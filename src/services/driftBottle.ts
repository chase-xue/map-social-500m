import { DriftBottleItem, DriftBottleReply } from '../types';

const DRIFT_BOTTLES_KEY = '500m_drift_bottles_v1';
const MY_BOTTLE_SHELLS_KEY = '500m_bottle_shells_v1';

// 公海预置漂流瓶池
export const INITIAL_OCEAN_BOTTLES: DriftBottleItem[] = [
  {
    id: 'bottle_1',
    userId: 'user_coser',
    userName: '荧光喵喵 (Coser)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    content: '今天在漫展抽到了芙莉莲的隐藏款吧唧！心情超级棒！虽然周边没有能一起大喊吃谷快乐的小伙伴，希望捞到瓶子的你也能开心一整天呀～🌸✨',
    tag: '🌸 二次元安利',
    createdAt: Date.now() - 1000 * 60 * 42,
    distanceMeters: 360,
    bottleType: 1,
    replies: []
  },
  {
    id: 'bottle_2',
    userId: 'user_coffee',
    userName: '小夏 (精品咖啡师)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    content: '独处虽然惬意，但也想认识同在周边的朋友聊聊生活美学。今天手冲了一壶埃塞俄比亚水洗瑰夏，花香和柑橘调很明显，闻着就治愈☕',
    tag: '☕ 周边交友',
    createdAt: Date.now() - 1000 * 60 * 95,
    distanceMeters: 180,
    bottleType: 2,
    replies: []
  },
  {
    id: 'bottle_3',
    userId: 'user_kiri',
    userName: '雾切Kiri (二游玩家)',
    userAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    content: '绝区零深渊终于满星通关啦！有没有同在 500 米内的同好一起讨论配队和驱动盘呀，高难关卡可以带飞哦～🎮',
    tag: '🌸 二次元安利',
    createdAt: Date.now() - 1000 * 60 * 150,
    distanceMeters: 420,
    bottleType: 3,
    replies: []
  },
  {
    id: 'bottle_4',
    userId: 'user_runner',
    userName: '夜跑阿健',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    content: '晚上沿着社区河滨夜跑了 10 公里，晚风拂过特别解压！寻找周边的夜跑搭子，互相督促打卡🏃‍♂️',
    tag: '💌 心事随想',
    createdAt: Date.now() - 1000 * 60 * 210,
    distanceMeters: 290,
    bottleType: 4,
    replies: []
  },
  {
    id: 'bottle_5',
    userId: 'user_chiyo',
    userName: '千代Chiyo (开盒欧皇)',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    content: '今天在泡泡玛特盲盒店端盒！开出了大隐藏！手气爆棚，求同城盲盒交换同好，把欧气分你一半🌟',
    tag: '🌟 盲盒心愿',
    createdAt: Date.now() - 1000 * 60 * 300,
    distanceMeters: 140,
    bottleType: 5,
    replies: []
  }
];

export function getStoredBottles(): DriftBottleItem[] {
  try {
    const raw = uni.getStorageSync(DRIFT_BOTTLES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  // 写入初始公海池
  saveStoredBottles(INITIAL_OCEAN_BOTTLES);
  return INITIAL_OCEAN_BOTTLES;
}

export function saveStoredBottles(list: DriftBottleItem[]): void {
  try {
    uni.setStorageSync(DRIFT_BOTTLES_KEY, JSON.stringify(list));
  } catch (e) {}
}

export function getShellCount(): number {
  try {
    const val = uni.getStorageSync(MY_BOTTLE_SHELLS_KEY);
    if (val !== undefined && val !== null && val !== '') {
      return Number(val);
    }
  } catch (e) {}
  return 2; // 默认赠送 2 次
}

export function saveShellCount(count: number): void {
  try {
    uni.setStorageSync(MY_BOTTLE_SHELLS_KEY, String(count));
  } catch (e) {}
}

/**
 * 扔瓶子
 */
export function throwBottleToOcean(
  userProfile: { id: string; name: string; avatar: string },
  content: string,
  tag: string = '💌 心事随想',
  bottleType: number = 1
): DriftBottleItem {
  const all = getStoredBottles();
  const newBottle: DriftBottleItem = {
    id: 'bottle_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    userId: userProfile.id,
    userName: userProfile.name,
    userAvatar: userProfile.avatar,
    content,
    tag,
    createdAt: Date.now(),
    distanceMeters: 0,
    bottleType,
    replies: [],
    isMine: true
  };

  all.unshift(newBottle);
  saveStoredBottles(all);
  return newBottle;
}

/**
 * 随机捞一个瓶子 (排除自己刚扔的)
 */
export function fishBottleFromOcean(myUserId: string): DriftBottleItem | null {
  const all = getStoredBottles();
  const candidates = all.filter(b => b.userId !== myUserId);
  if (candidates.length === 0) return all[0] || null;
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return picked;
}

/**
 * 回复瓶子
 */
export function replyToBottle(
  bottleId: string,
  replyUser: { id: string; name: string; avatar: string },
  content: string
): DriftBottleReply | null {
  const all = getStoredBottles();
  const target = all.find(b => b.id === bottleId);
  if (!target) return null;

  const newReply: DriftBottleReply = {
    id: 'reply_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    userId: replyUser.id,
    userName: replyUser.name,
    userAvatar: replyUser.avatar,
    content,
    createdAt: Date.now()
  };

  if (!target.replies) target.replies = [];
  target.replies.push(newReply);
  saveStoredBottles(all);
  return newReply;
}
