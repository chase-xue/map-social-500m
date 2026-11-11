import { UserProfile, AiMatchFilter, AiMatchUserResult, Coordinates } from '../types';
import { calculateDistance } from './geo';

/**
 * 候选邻友画像库 (结合地理位置动态计算)
 */
export interface CandidateNeighbor {
  userId: string;
  userName: string;
  userAvatar: string;
  gender: '男' | '女' | '保密';
  age: number;
  constellation: string;
  personalityTags: string[];
  mbti: string;
  bio: string;
  offsetDistanceMeters: number; // 相对距离
}

// 12 星座象限与属性字典
export const CONSTELLATION_ELEMENTS: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  '白羊座': 'fire', '狮子座': 'fire', '射手座': 'fire',
  '金牛座': 'earth', '处女座': 'earth', '摩羯座': 'earth',
  '双子座': 'air', '天秤座': 'air', '水瓶座': 'air',
  '巨蟹座': 'water', '天蝎座': 'water', '双鱼座': 'water'
};

// 预置 500 米内立体邻友画像池
export const CANDIDATE_NEIGHBORS: CandidateNeighbor[] = [
  {
    userId: 'user_coser',
    userName: '荧光喵喵 (Coser)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    gender: '女',
    age: 21,
    constellation: '射手座',
    personalityTags: ['猫系慢热', '二次元宅', '漫展达人', '真诚专注'],
    mbti: 'INFP',
    bio: '二次元重度同好 / 漫展常驻 / 谷美手作 ✨',
    offsetDistanceMeters: 140
  },
  {
    userId: 'user_rin',
    userName: '凛音Rin (痛包工坊)',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    gender: '女',
    age: 22,
    constellation: '双鱼座',
    personalityTags: ['温柔细致', '手作狂人', '情绪价值高', '善解人意'],
    mbti: 'ISFJ',
    bio: '痛包手作主理人，54个吧唧芙莉莲板完成！',
    offsetDistanceMeters: 210
  },
  {
    userId: 'user_haru',
    userName: '星野Haru (漫展野生摄影)',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    gender: '男',
    age: 24,
    constellation: '天秤座',
    personalityTags: ['审美在线', '社牛幽默', '幽默风趣', '随和搭子'],
    mbti: 'ENFP',
    bio: '索尼A7M4，周末同城漫展免费野生返图中～',
    offsetDistanceMeters: 280
  },
  {
    userId: 'user_mio',
    userName: '秋山Mio (资深追番宅)',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    gender: '女',
    age: 23,
    constellation: '巨蟹座',
    personalityTags: ['佛系安静', '宅家追番', '慢热同频', '细节控'],
    mbti: 'INFJ',
    bio: '京阿尼厨 / 轻音少女十周年！找同频邻友一起补番',
    offsetDistanceMeters: 350
  },
  {
    userId: 'user_kiri',
    userName: '雾切Kiri (二游玩家)',
    userAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    gender: '女',
    age: 20,
    constellation: '天蝎座',
    personalityTags: ['高冷神秘', '深渊配队高玩', '严谨理性', '外冷内热'],
    mbti: 'INTJ',
    bio: '绝区零/原神深渊满星配队研究，同好来战',
    offsetDistanceMeters: 410
  },
  {
    userId: 'user_rei',
    userName: '白夜Rei (道具师/Coser)',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    gender: '男',
    age: 26,
    constellation: '狮子座',
    personalityTags: ['阳光开朗', '热心助人', '行动力爆表', '手工达人'],
    mbti: 'ENTJ',
    bio: '3D打印铠甲武器道具，可指导新人做漫展道具',
    offsetDistanceMeters: 180
  },
  {
    userId: 'user_chiyo',
    userName: '千代Chiyo (开盒欧皇)',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    gender: '女',
    age: 19,
    constellation: '双子座',
    personalityTags: ['古灵精怪', '社牛自来熟', '活泼开朗', '好奇心强'],
    mbti: 'ESFP',
    bio: '泡泡玛特与动漫一番赏手气爆棚，求盲盒交换同好！',
    offsetDistanceMeters: 320
  },
  {
    userId: 'user_coffee',
    userName: '小夏 (精品咖啡师)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    gender: '女',
    age: 25,
    constellation: '金牛座',
    personalityTags: ['温柔治愈', '热爱生活', '生活美学', '慢节奏'],
    mbti: 'ISFP',
    bio: '独立咖啡馆主理人，热爱手冲与烘豆☕',
    offsetDistanceMeters: 90
  },
  {
    userId: 'user_runner',
    userName: '夜跑阿健',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    gender: '男',
    age: 28,
    constellation: '白羊座',
    personalityTags: ['运动阳光', '自律硬核', '直爽坦诚', '正能量'],
    mbti: 'ESTJ',
    bio: '跑龄5年，目标今年全马破三！夜跑搭子来',
    offsetDistanceMeters: 260
  },
  {
    userId: 'user_camera',
    userName: '阿泽 (街头抓拍)',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    gender: '男',
    age: 25,
    constellation: '水瓶座',
    personalityTags: ['独立思考', '幽默风趣', '旅行同好', '随性自然'],
    mbti: 'ENTP',
    bio: '纪实摄影与胶片机爱好者，喜欢记录社区街角温情',
    offsetDistanceMeters: 380
  },
  {
    userId: 'user_cat',
    userName: '婷婷 (猫舍救助志愿者)',
    userAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    gender: '女',
    age: 23,
    constellation: '处女座',
    personalityTags: ['爱心爆棚', '细心靠谱', '温柔耐心', '治愈系'],
    mbti: 'INFJ',
    bio: '社区流浪猫领养救助，家里有3只原住民喵星人',
    offsetDistanceMeters: 170
  },
  {
    userId: 'user_coder',
    userName: '程序员小李',
    userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    gender: '男',
    age: 27,
    constellation: '摩羯座',
    personalityTags: ['严谨理性', '踏实靠谱', '低调内敛', '极客精神'],
    mbti: 'INTP',
    bio: '开源爱好者 / 独居猫奴 / 周末数码折腾日常',
    offsetDistanceMeters: 450
  }
];

/**
 * AI 智能契合度计算与推荐引擎
 */
export function executeAiMatch(filter: AiMatchFilter): AiMatchUserResult[] {
  const results: AiMatchUserResult[] = [];

  for (const c of CANDIDATE_NEIGHBORS) {
    let score = 70; // 基础契合分
    const matchedReasons: string[] = [];

    // 1. 性别筛选过滤
    if (filter.gender !== 'all') {
      if (c.gender !== filter.gender) {
        continue; // 不满足性别硬过滤条件
      } else {
        score += 5;
      }
    }

    // 2. 年龄区间过滤
    if (filter.ageRange !== 'all') {
      let ageMatch = false;
      if (filter.ageRange === '18-24' && c.age >= 18 && c.age <= 24) ageMatch = true;
      else if (filter.ageRange === '25-30' && c.age >= 25 && c.age <= 30) ageMatch = true;
      else if (filter.ageRange === '31+' && c.age >= 31) ageMatch = true;

      if (!ageMatch) {
        // 轻度减分，非完全排除
        score -= 10;
      } else {
        score += 5;
      }
    }

    // 3. 星座星盘匹配计算
    const cElem = CONSTELLATION_ELEMENTS[c.constellation];
    if (filter.constellation && filter.constellation !== 'all') {
      if (filter.constellation.includes(c.constellation)) {
        score += 10;
        matchedReasons.push(`星座指定契合 (${c.constellation})`);
      } else if (filter.constellation.includes('火象') && cElem === 'fire') {
        score += 8;
        matchedReasons.push(`同属热情火象星座 (${c.constellation})`);
      } else if (filter.constellation.includes('水象') && cElem === 'water') {
        score += 8;
        matchedReasons.push(`同属感性水象星座 (${c.constellation})`);
      } else if (filter.constellation.includes('风象') && cElem === 'air') {
        score += 8;
        matchedReasons.push(`同属灵动风象星座 (${c.constellation})`);
      } else if (filter.constellation.includes('土象') && cElem === 'earth') {
        score += 8;
        matchedReasons.push(`同属稳重土象星座 (${c.constellation})`);
      }
    } else {
      score += 4;
    }

    // 4. 🌟 性格一层核心 AI 匹配算法
    const userSelectedTags = filter.personalityTags || [];
    const commonTags = c.personalityTags.filter(t => userSelectedTags.includes(t));

    if (filter.personalityMode === 'same') {
      // 同频共振模式：越相似得分越高
      if (commonTags.length > 0) {
        score += commonTags.length * 6;
        matchedReasons.push(`性格同频点：${commonTags.join('、')}`);
      }
      // MBTI 同型或同向 (如都是 I 慢热内省，或都是 E 阳光外向)
      if (c.mbti.startsWith('I') && userSelectedTags.some(t => t.includes('慢热') || t.includes('宅') || t.includes('安静'))) {
        score += 6;
        matchedReasons.push(`同为慢热猫系人格 (${c.mbti})，相处零压力`);
      }
    } else {
      // 互补合拍模式：一动一静，反差互补
      const hasOutgoing = c.personalityTags.some(t => t.includes('社牛') || t.includes('开朗') || t.includes('幽默'));
      const hasQuiet = c.personalityTags.some(t => t.includes('细致') || t.includes('安静') || t.includes('倾听') || t.includes('慢热'));
      
      if (userSelectedTags.some(t => t.includes('慢热') || t.includes('宅')) && hasOutgoing) {
        score += 12;
        matchedReasons.push(`完美互补：对方活泼开朗能主动带动话题，破冰极度轻松`);
      } else if (userSelectedTags.some(t => t.includes('社牛') || t.includes('开朗')) && hasQuiet) {
        score += 12;
        matchedReasons.push(`完美互补：对方擅长深度倾听，能给你充足的情绪支持`);
      } else {
        score += 6;
        matchedReasons.push(`性格张弛有度，日常相处舒适自然`);
      }
    }

    // 5. 自然语言描述与兴趣语义提取加权
    if (filter.customDesc && filter.customDesc.trim()) {
      const desc = filter.customDesc.toLowerCase();
      if (desc.includes('二次元') || desc.includes('漫展') || desc.includes('谷') || desc.includes('番')) {
        if (c.personalityTags.includes('二次元宅') || c.bio.includes('二次元') || c.bio.includes('漫展')) {
          score += 10;
          matchedReasons.push(`共同二次元同好生态圈，兴趣高度重合`);
        }
      }
      if (desc.includes('猫') || desc.includes('宠物')) {
        if (c.bio.includes('猫') || c.personalityTags.includes('爱心爆棚')) {
          score += 8;
          matchedReasons.push(`同为毛孩子/爱宠人士，天然话题不断`);
        }
      }
      if (desc.includes('真诚') || desc.includes('走心') || desc.includes('聊')) {
        score += 5;
      }
    }

    // 封顶 99 分，保底 75 分
    const finalScore = Math.min(99, Math.max(78, score));
    
    // 生成匹配亮点与 AI 理由
    const modeLabel = filter.personalityMode === 'same' ? '灵魂同频' : '性格互补';
    const matchHighlight = `🔥 ${finalScore}% ${modeLabel}`;
    
    let aiReason = `【${c.constellation} · ${c.mbti}】`;
    if (matchedReasons.length > 0) {
      aiReason += matchedReasons.slice(0, 2).join('；') + '。';
    } else {
      aiReason += `双方在 500 米生活圈内距离接近，性格节奏合拍，极适合从日常近邻开始认识。`;
    }

    // AI 生成专属破冰开场白
    let icebreaker = `嗨～AI 说我们的性格与星座契合度高达 ${finalScore}%，看到你也在周边 500 米内，想认识一下交个朋友！`;
    if (c.bio.includes('漫展') || c.personalityTags.includes('二次元宅')) {
      icebreaker = `哈喽～AI 匹配推荐说我们同在周边 500 米且都是二次元同好（契合度 ${finalScore}%），想认识一下，下次漫展或吃谷一起组队呀！🌸`;
    } else if (c.bio.includes('咖啡')) {
      icebreaker = `嗨～AI 算出我们性格契合度有 ${finalScore}%，我也超爱咖啡生活美学，想加个好友有机会交流品鉴！☕`;
    }

    results.push({
      userId: c.userId,
      userName: c.userName,
      userAvatar: c.userAvatar,
      gender: c.gender,
      age: c.age,
      constellation: c.constellation,
      personalityTags: c.personalityTags,
      mbti: c.mbti,
      distance: c.offsetDistanceMeters,
      matchScore: finalScore,
      matchHighlight,
      aiReason,
      icebreaker,
      isFriend: false,
      applied: false
    });
  }

  // 按契合度降序排列
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
