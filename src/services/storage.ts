import { StatusItem, CommentItem, Coordinates, UserProfile, FriendItem, ChatMessage } from "../types";
import { createOffsetCoordinates } from "./geo";

const STATUSES_STORAGE_KEY = "LOCAL_MAP_STATUSES_V1";
const FILE_NAME_STATUSES = "statuses.json";

const PROFILE_STORAGE_KEY = "LOCAL_MAP_USER_PROFILE_V1";
const FILE_NAME_PROFILE = "user_profile.json";

const FRIENDS_STORAGE_KEY = "LOCAL_MAP_FRIENDS_V1";
const FILE_NAME_FRIENDS = "friends.json";

const CHATS_STORAGE_KEY = "LOCAL_MAP_CHATS_V1";
const FILE_NAME_CHATS = "chats.json";

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: "my_user_id",
  name: "探索者小晨",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
  gender: "男",
  age: 24,
  bio: "在周边500米里记录最真实的烟火气与风景✨",
  phone: "13800138000",
  showPhone: true, // 是否向他人公开展示手机号
  showAcgnTab: true, // 默认在首页展示二次元页签
  showRecommendTab: true
};

// 平台环境下的文件管理器兼容处理
interface FileSystemManagerLike {
  writeFileSync(filePath: string, data: string | ArrayBuffer, encoding?: string): void;
  readFileSync(filePath: string, encoding?: string): string;
  accessSync(path: string): void;
  saveFileSync?(tempFilePath: string, filePath?: string): string;
}

let fsManager: FileSystemManagerLike | null = null;
let userDataDir = "";

try {
  // #ifdef MP-WEIXIN || MP-TOUTIAO
  // @ts-ignore
  if (typeof uni !== "undefined" && typeof uni.getFileSystemManager === "function") {
    // @ts-ignore
    fsManager = uni.getFileSystemManager();
    // @ts-ignore
    userDataDir = (typeof wx !== "undefined" ? wx.env?.USER_DATA_PATH : "") || 
                  // @ts-ignore
                  (typeof tt !== "undefined" ? tt.env?.USER_DATA_PATH : "") || "";
  }
  // #endif
} catch (e) {
  console.warn("文件管理器初始化提示:", e);
}

function writeRawFile(filename: string, key: string, data: any): void {
  const jsonString = JSON.stringify(data, null, 2);
  if (fsManager && userDataDir) {
    try {
      fsManager.writeFileSync(`${userDataDir}/${filename}`, jsonString, "utf8");
    } catch (e) {}
  }
  try {
    uni.setStorageSync(key, jsonString);
  } catch (e) {}
}

function readRawFile<T>(filename: string, key: string, fallback: T): T {
  let raw: string | null = null;
  if (fsManager && userDataDir) {
    try {
      raw = fsManager.readFileSync(`${userDataDir}/${filename}`, "utf8");
    } catch (e) {}
  }
  if (!raw) {
    try {
      raw = uni.getStorageSync(key);
    } catch (e) {}
  }
  if (raw) {
    try {
      return JSON.parse(raw) as T;
    } catch (e) {}
  }
  return fallback;
}

/**
 * 个人资料读写
 */
export function getUserProfile(): UserProfile {
  const p = readRawFile<UserProfile>(FILE_NAME_PROFILE, PROFILE_STORAGE_KEY, DEFAULT_USER_PROFILE);
  return { ...DEFAULT_USER_PROFILE, ...p };
}

export function saveUserProfile(profile: UserProfile): void {
  writeRawFile(FILE_NAME_PROFILE, PROFILE_STORAGE_KEY, profile);
}

/**
 * 状态读写
 */
export function writeLocalData(statuses: StatusItem[]): void {
  writeRawFile(FILE_NAME_STATUSES, STATUSES_STORAGE_KEY, statuses);
}

export function readLocalData(): StatusItem[] {
  return readRawFile<StatusItem[]>(FILE_NAME_STATUSES, STATUSES_STORAGE_KEY, []);
}

/**
 * 好友关系管理
 */
export function getFriendsList(): FriendItem[] {
  const existing = readRawFile<FriendItem[]>(FILE_NAME_FRIENDS, FRIENDS_STORAGE_KEY, []);
  if (existing && existing.length > 0) {
    return existing;
  }

  // 默认预置好友与二次元同好
  const initialFriends: FriendItem[] = [
    {
      userId: "user_coffee",
      name: "小夏 (精品咖啡师)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      phone: "13912345678",
      gender: "女",
      age: 25,
      bio: "独立咖啡馆主理人，热爱手冲与烘豆☕",
      status: "accepted",
      lastMessage: "今天新到了埃塞俄比亚水洗豆，给你留了一杯哦！",
      lastMessageTime: Date.now() - 1000 * 60 * 15,
      unreadCount: 1
    },
    {
      userId: "user_coser",
      name: "荧光喵喵 (Coser)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      phone: "13800009999",
      gender: "女",
      age: 21,
      bio: "二次元重度同好 / 漫展常驻 / 谷美手作 ✨",
      status: "accepted",
      lastMessage: "返图出来啦！下次同城漫展一起组队出CP剧组呀🌸✨",
      lastMessageTime: Date.now() - 1000 * 60 * 20,
      unreadCount: 1
    },
    {
      userId: "user_runner",
      name: "夜跑阿健",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      phone: "13511112222",
      gender: "男",
      age: 28,
      bio: "跑龄5年，目标今年全马破三！",
      status: "pending",
      lastMessage: "申请添加你为好友：看到你在附近发的状态啦，加个好友一起约跑！",
      lastMessageTime: Date.now() - 1000 * 60 * 60,
      unreadCount: 1
    }
  ];

  writeRawFile(FILE_NAME_FRIENDS, FRIENDS_STORAGE_KEY, initialFriends);
  return initialFriends;
}

export function saveFriendsList(list: FriendItem[]): void {
  writeRawFile(FILE_NAME_FRIENDS, FRIENDS_STORAGE_KEY, list);
}

/**
 * 发送好友申请 (需双方均绑定手机号)
 */
export function sendFriendRequest(target: UserProfile): { success: boolean; msg: string } {
  const me = getUserProfile();
  if (!me.phone || me.phone.trim().length < 7) {
    return { success: false, msg: "请先在「我的」资料中绑定您的手机号才能加好友" };
  }
  if (!target.phone || target.phone.trim().length < 7) {
    return { success: false, msg: "对方尚未绑定手机号，暂无法加为好友" };
  }

  const friends = getFriendsList();
  const existing = friends.find(f => f.userId === target.id);
  if (existing) {
    if (existing.status === 'accepted') {
      return { success: false, msg: "你们已经是好友了，可以直接聊天" };
    } else {
      return { success: false, msg: "好友申请已发送，等待对方通过" };
    }
  }

  const newFriend: FriendItem = {
    userId: target.id,
    name: target.name,
    avatar: target.avatar,
    gender: target.gender,
    age: target.age,
    bio: target.bio,
    phone: target.phone,
    status: 'pending',
    lastMessage: '已发起好友申请',
    lastMessageTime: Date.now(),
    unreadCount: 0
  };

  friends.unshift(newFriend);
  saveFriendsList(friends);
  return { success: true, msg: "好友申请已发送！" };
}

/**
 * 通过好友申请
 */
export function acceptFriendRequest(targetUserId: string): boolean {
  const friends = getFriendsList();
  const target = friends.find(f => f.userId === targetUserId);
  if (!target) return false;

  target.status = 'accepted';
  target.lastMessage = '你们已经成为好友，现在可以开始聊天啦！';
  target.lastMessageTime = Date.now();
  target.unreadCount = 0;
  saveFriendsList(friends);

  // 初始化一条打招呼消息
  sendChatMessage(targetUserId, "我们已经成为好友了，随时在500米圈内联系呀~", 'text', targetUserId);
  return true;
}

/**
 * 聊天记录管理
 */
export function getChatMessages(friendId: string): ChatMessage[] {
  const allChats = readRawFile<Record<string, ChatMessage[]>>(FILE_NAME_CHATS, CHATS_STORAGE_KEY, {});
  if (!allChats[friendId]) {
    if (friendId === 'user_coffee') {
      allChats[friendId] = [
        {
          id: "msg_1",
          senderId: "user_coffee",
          receiverId: "my_user_id",
          content: "哈喽！看到你在周边500米内发的状态啦👋",
          contentType: "text",
          createdAt: Date.now() - 1000 * 60 * 30
        },
        {
          id: "msg_2",
          senderId: "user_coffee",
          receiverId: "my_user_id",
          content: "今天新到了埃塞俄比亚水洗豆，给你留了一杯哦！☕",
          contentType: "text",
          createdAt: Date.now() - 1000 * 60 * 15
        }
      ];
      writeRawFile(FILE_NAME_CHATS, CHATS_STORAGE_KEY, allChats);
    } else if (friendId === 'user_coser') {
      allChats[friendId] = [
        {
          id: "msg_coser_1",
          senderId: "user_coser",
          receiverId: "my_user_id",
          content: "哈喽！你也喜欢二次元动漫吗？看到你在周边500米发的状态啦🌸",
          contentType: "text",
          createdAt: Date.now() - 1000 * 60 * 40
        },
        {
          id: "msg_coser_2",
          senderId: "user_coser",
          receiverId: "my_user_id",
          content: "返图出来啦！下次同城漫展一起组队出CP剧组呀🌸✨",
          contentType: "text",
          createdAt: Date.now() - 1000 * 60 * 20
        }
      ];
      writeRawFile(FILE_NAME_CHATS, CHATS_STORAGE_KEY, allChats);
    } else {
      allChats[friendId] = [];
    }
  }
  return allChats[friendId] || [];
}

export function sendChatMessage(
  friendId: string,
  content: string,
  contentType: 'text' | 'image' = 'text',
  customSenderId?: string
): ChatMessage {
  const me = getUserProfile();
  const allChats = readRawFile<Record<string, ChatMessage[]>>(FILE_NAME_CHATS, CHATS_STORAGE_KEY, {});
  if (!allChats[friendId]) {
    allChats[friendId] = [];
  }

  const newMsg: ChatMessage = {
    id: "msg_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    senderId: customSenderId || me.id,
    receiverId: friendId,
    content,
    contentType,
    createdAt: Date.now()
  };

  allChats[friendId].push(newMsg);
  writeRawFile(FILE_NAME_CHATS, CHATS_STORAGE_KEY, allChats);

  // 同步更新好友列表的最后一条消息
  const friends = getFriendsList();
  const f = friends.find(item => item.userId === friendId);
  if (f) {
    f.lastMessage = contentType === 'image' ? '[图片]' : content;
    f.lastMessageTime = Date.now();
    saveFriendsList(friends);
  }

  return newMsg;
}

/**
 * 保存本地图片
 */
export function saveLocalImageFile(tempFilePath: string): Promise<string> {
  return new Promise((resolve) => {
    if (tempFilePath.startsWith("http") || tempFilePath.startsWith("data:")) {
      return resolve(tempFilePath);
    }
    // #ifndef H5
    try {
      uni.saveFile({
        tempFilePath: tempFilePath,
        success: (res) => resolve(res.savedFilePath),
        fail: () => resolve(tempFilePath)
      });
    } catch (e) {
      resolve(tempFilePath);
    }
    // #endif
    // #ifdef H5
    resolve(tempFilePath);
    // #endif
  });
}

/**
 * 添加一条新状态
 */
export function addNewStatus(status: Omit<StatusItem, "id" | "createdAt" | "comments">): StatusItem {
  const all = readLocalData();
  const newStatus: StatusItem = {
    ...status,
    id: "status_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    createdAt: Date.now(),
    comments: [],
    likes: []
  };

  all.unshift(newStatus);
  writeLocalData(all);
  return newStatus;
}

/**
 * 添加留言
 */
export function addCommentToStatus(
  statusId: string,
  comment: {
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    replyToUserName?: string;
    images?: string[];
    authorProfile?: UserProfile;
  }
): CommentItem | null {
  const all = readLocalData();
  const target = all.find((item) => item.id === statusId);
  if (!target) return null;

  const newComment: CommentItem = {
    id: "cmt_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    statusId,
    userId: comment.userId,
    userName: comment.userName,
    userAvatar: comment.userAvatar,
    content: comment.content,
    replyToUserName: comment.replyToUserName,
    images: comment.images || [],
    authorProfile: comment.authorProfile,
    createdAt: Date.now()
  };

  if (!target.comments) {
    target.comments = [];
  }
  // 微信朋友圈按对话流自然顺序追加在底部
  target.comments.push(newComment);
  writeLocalData(all);
  return newComment;
}

/**
 * 生成全套二次元同好专属状态数据 (覆盖 Cosplay / 谷美/吃谷 / 漫展打卡 / 番剧安利 / 游戏同好)
 */
export function generateAcgnMockStatuses(currentPos: Coordinates): StatusItem[] {
  const p1 = createOffsetCoordinates(currentPos, 140, 60);
  const p2 = createOffsetCoordinates(currentPos, 210, 150);
  const p3 = createOffsetCoordinates(currentPos, 280, 240);
  const p4 = createOffsetCoordinates(currentPos, 350, 310);
  const p5 = createOffsetCoordinates(currentPos, 410, 40);
  const p6 = createOffsetCoordinates(currentPos, 180, 290);
  const p7 = createOffsetCoordinates(currentPos, 320, 180);

  return [
    {
      id: "mock_acgn_1",
      userId: "user_coser",
      userName: "荧光喵喵 (Coser)",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      latitude: p1.latitude,
      longitude: p1.longitude,
      content: "周末漫展正片返图出炉啦！今天出的是《魔法少女》鹿目圆焰魔装，假发修剪定型折腾了两个通宵，大家觉得还原度怎么样？周边有没有二次元同好一起吃谷或者约下次CP展出呀？🌸✨",
      images: [
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80"
      ],
      createdAt: Date.now() - 1000 * 60 * 18,
      isAcgn: true,
      acgnTag: "Cosplay",
      authorProfile: {
        id: "user_coser",
        name: "荧光喵喵",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        gender: "女",
        age: 21,
        bio: "二次元重度同好 / 漫展常驻 / 谷美手作 ✨",
        phone: "13800009999",
        showPhone: true
      },
      comments: [
        {
          id: "c_acgn_1",
          statusId: "mock_acgn_1",
          userId: "user_mike",
          userName: "阿泽",
          userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
          content: "返图好棒！下次同城漫展一起去打卡呀～🌸",
          createdAt: Date.now() - 1000 * 60 * 10
        }
      ],
      likes: ["小夏 (精品咖啡师)", "阿泽", "夜跑阿健"]
    },
    {
      id: "mock_acgn_2",
      userId: "user_bag",
      userName: "凛音Rin (痛包工坊)",
      userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
      latitude: p2.latitude,
      longitude: p2.longitude,
      content: "新扎的芙莉莲全板痛包大功告成！✨ 54个同人马口铁吧唧整齐划一，搭配手作浅紫蕾丝吧唧托+透光亚克力挂件，带去同城逛街安全感满满！周边吃谷同好欢迎来互相鉴赏痛包，顺便求换同画师特典色纸！🎒🌸",
      images: [
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=600&auto=format&fit=crop&q=80"
      ],
      createdAt: Date.now() - 1000 * 60 * 35,
      isAcgn: true,
      acgnTag: "谷美/吃谷",
      authorProfile: {
        id: "user_bag",
        name: "凛音Rin",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
        gender: "女",
        age: 22,
        bio: "资深吃谷人 / 痛包手作爱好者 / 吧唧托定制 🌸",
        phone: "13811223344",
        showPhone: true
      },
      comments: [
        {
          id: "c_acgn_2_1",
          statusId: "mock_acgn_2",
          userId: "user_coser",
          userName: "荧光喵喵 (Coser)",
          userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
          content: "哇这个吧唧托排布太绝了！跪求扎包教程！✨",
          createdAt: Date.now() - 1000 * 60 * 20
        }
      ],
      likes: ["荧光喵喵 (Coser)", "老刘", "秋山Mio (资深追番宅)"]
    },
    {
      id: "mock_acgn_3",
      userId: "user_photo",
      userName: "星野Haru (漫展野生摄影)",
      userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
      latitude: p3.latitude,
      longitude: p3.longitude,
      content: "同城动漫嘉年华DAY1现场速报！📸 场馆里好多神级Cosplay大佬，抓拍到了超还原的电锯人早川秋和咒术高专剧组！无料区排队超热闹，明天DAY2继续出摊集邮，附近的同好快来找我拍返图合影呀！🎪🎉",
      images: [
        "https://images.unsplash.com/photo-1569317002804-ab77bcf1bce4?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
      ],
      createdAt: Date.now() - 1000 * 60 * 55,
      isAcgn: true,
      acgnTag: "漫展打卡",
      authorProfile: {
        id: "user_photo",
        name: "星野Haru",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
        gender: "男",
        age: 24,
        bio: "同城漫展常驻野生摄影 / 索尼大法好 / 免费返图 📸",
        phone: "13566778899",
        showPhone: true
      },
      comments: [
        {
          id: "c_acgn_3_1",
          statusId: "mock_acgn_3",
          userId: "user_prop",
          userName: "白夜Rei (道具师/Coser)",
          userAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
          content: "明天上午10点我也在主舞台附近出星铁黄泉，求抓拍合影！🗡️",
          createdAt: Date.now() - 1000 * 60 * 40
        }
      ],
      likes: ["荧光喵喵 (Coser)", "阿泽", "白夜Rei (道具师/Coser)"]
    },
    {
      id: "mock_acgn_4",
      userId: "user_anime",
      userName: "秋山Mio (资深追番宅)",
      userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      latitude: p4.latitude,
      longitude: p4.longitude,
      content: "【本季新番强推】刚补完最新一话，分镜演出与神仙级作画直接封神！配乐响起来那一瞬间全身起鸡皮疙瘩，年度霸权预定！剧情节奏快到停不下来，还没补的二次元同好赶快吃下我这剂安利，顺便蹲同好交流剧情伏笔！🍿📺✨",
      images: [
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80"
      ],
      createdAt: Date.now() - 1000 * 60 * 75,
      isAcgn: true,
      acgnTag: "番剧安利",
      authorProfile: {
        id: "user_anime",
        name: "秋山Mio",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
        gender: "女",
        age: 20,
        bio: "追番十年的资深二次元 / 萌系&热血杂食党 📺🍿",
        phone: "13900112233",
        showPhone: true
      },
      comments: [
        {
          id: "c_acgn_4_1",
          statusId: "mock_acgn_4",
          userId: "user_mike",
          userName: "阿泽",
          userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
          content: "最新话神回我也看了，最后几分钟的旋转运镜绝了！",
          createdAt: Date.now() - 1000 * 60 * 60
        }
      ],
      likes: ["小夏 (精品咖啡师)", "老刘", "阿泽"]
    },
    {
      id: "mock_acgn_5",
      userId: "user_game",
      userName: "雾切Kiri (二游玩家)",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      latitude: p5.latitude,
      longitude: p5.longitude,
      content: "《原神》《崩坏：星穹铁道》周边同好联机交流！新一期深渊和末日幻影已经全满星通关，配队遗器心得已整理好。今晚有邻近的小伙伴一起联机刷材料打周本BOSS吗？求加UID组队，500米圈内游戏同好快来扩列！🎮⚔️",
      images: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80"
      ],
      createdAt: Date.now() - 1000 * 60 * 90,
      isAcgn: true,
      acgnTag: "游戏同好",
      authorProfile: {
        id: "user_game",
        name: "雾切Kiri",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        gender: "男",
        age: 23,
        bio: "二游全图鉴收集控 / 深渊满星指南 / 音游十段 🎮",
        phone: "13611224455",
        showPhone: true
      },
      comments: [
        {
          id: "c_acgn_5_1",
          statusId: "mock_acgn_5",
          userId: "user_runner",
          userName: "夜跑阿健",
          userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
          content: "我也在玩星铁！求加大佬好友，私聊发你UID！",
          createdAt: Date.now() - 1000 * 60 * 70
        }
      ],
      likes: ["阿泽", "夜跑阿健", "白夜Rei (道具师/Coser)"]
    },
    {
      id: "mock_acgn_6",
      userId: "user_prop",
      userName: "白夜Rei (道具师/Coser)",
      userAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
      latitude: p6.latitude,
      longitude: p6.longitude,
      content: "连续肝了一周，黄泉的太刀道具手作喷漆终于大功告成！刀镡细节和磁吸拆装结构超还原，下个月同城漫展正片开拍，同剧组有砂金或者黑天鹅的小伙伴吗？求拉进同城星铁群一起出景！🗡️⚡",
      images: [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80"
      ],
      createdAt: Date.now() - 1000 * 60 * 110,
      isAcgn: true,
      acgnTag: "Cosplay",
      authorProfile: {
        id: "user_prop",
        name: "白夜Rei",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
        gender: "男",
        age: 25,
        bio: "二次元道具制作 / 3D建模涂装 / 角色还原出片 🗡️",
        phone: "13799887766",
        showPhone: true
      },
      comments: [],
      likes: ["荧光喵喵 (Coser)", "星野Haru (漫展野生摄影)"]
    },
    {
      id: "mock_acgn_7",
      userId: "user_blindbox",
      userName: "千代Chiyo (开盒欧皇)",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      latitude: p7.latitude,
      longitude: p7.longitude,
      content: "今天在商场动漫谷子店拆盒大丰收！一发入魂直接抽出了推角的隐藏闪卡！太欧了简直要喜极而泣😭 重复的普款亚克力立牌同城500米圈内可随时当面交换置换，吃谷人永不认输！✨🎁",
      images: [
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80"
      ],
      createdAt: Date.now() - 1000 * 60 * 130,
      isAcgn: true,
      acgnTag: "谷美/吃谷",
      authorProfile: {
        id: "user_blindbox",
        name: "千代Chiyo",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
        gender: "女",
        age: 21,
        bio: "盲盒拆盒欧皇 / 谷美手账 / 随缘换谷 🎀",
        phone: "13699881122",
        showPhone: true
      },
      comments: [],
      likes: ["凛音Rin (痛包工坊)", "阿泽"]
    }
  ];
}

/**
 * 初始化测试数据
 */
export function ensureInitialMockData(currentPos: Coordinates): StatusItem[] {
  let existing = readLocalData();
  const acgnList = generateAcgnMockStatuses(currentPos);

  if (existing && existing.length > 0) {
    // 检查并自动补齐缺失的二次元数据
    const existingAcgnIds = new Set(existing.filter((s) => s.isAcgn).map((s) => s.id));
    const toAdd = acgnList.filter((s) => !existingAcgnIds.has(s.id));
    if (toAdd.length > 0) {
      existing = [...existing, ...toAdd];
      writeLocalData(existing);
    }
    return existing;
  }

  const pos85m = createOffsetCoordinates(currentPos, 85, 45);
  const pos220m = createOffsetCoordinates(currentPos, 220, 130);
  const pos390m = createOffsetCoordinates(currentPos, 390, 260);

  const initialList: StatusItem[] = [
    {
      id: "mock_1",
      userId: "user_coffee",
      userName: "小夏 (精品咖啡师)",
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      latitude: pos85m.latitude,
      longitude: pos85m.longitude,
      content: "巷口拐弯的咖啡馆今天开了埃塞俄比亚新豆子，柑橘花香很浓郁，路过的朋友欢迎进来尝尝！☕",
      images: [
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80"
      ],
      createdAt: Date.now() - 1000 * 60 * 50,
      authorProfile: {
        id: "user_coffee",
        name: "小夏",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        gender: "女",
        age: 25,
        bio: "独立咖啡馆主理人，热爱手冲与烘豆，记录街角的香气☕",
        phone: "13912345678",
        showPhone: true
      },
      comments: [
        {
          id: "c_1",
          statusId: "mock_1",
          userId: "user_mike",
          userName: "阿泽",
          userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
          content: "刚好就在附近，尝了一杯手冲，拉花和柑橘风味很赞！",
          images: [
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80"
          ],
          createdAt: Date.now() - 1000 * 60 * 30,
          authorProfile: {
            id: "user_mike",
            name: "阿泽",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
            gender: "男",
            age: 26,
            bio: "设计师，咖啡重度爱好者",
            phone: "13888886666",
            showPhone: false
          }
        }
      ],
      likes: ["阿泽", "夜跑阿健"]
    },
    // 同地点聚合状态 2 (咖啡馆同坐标点)
    {
      id: "mock_1_b",
      userId: "user_design",
      userName: "摄影师阿文",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      latitude: pos85m.latitude + 0.00008,
      longitude: pos85m.longitude - 0.00005,
      content: "咖啡馆二楼靠窗的绿植光影太绝了，胶片感满满📸",
      images: [
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80"
      ],
      createdAt: Date.now() - 1000 * 60 * 25,
      authorProfile: {
        id: "user_design",
        name: "阿文",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        gender: "男",
        age: 27,
        bio: "自由摄影师，捕捉城市角落的光影✨",
        phone: "13766665555",
        showPhone: true
      },
      comments: [],
      likes: ["小夏 (精品咖啡师)"]
    },
    // 同地点聚合状态 3 (咖啡馆同坐标点)
    {
      id: "mock_1_c",
      userId: "user_foodie",
      userName: "甜品控婷婷",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      latitude: pos85m.latitude - 0.00006,
      longitude: pos85m.longitude + 0.00007,
      content: "今天配咖啡的巴斯克蛋糕好绵密，太治愈了🍰",
      images: [
        "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80"
      ],
      createdAt: Date.now() - 1000 * 60 * 10,
      authorProfile: {
        id: "user_foodie",
        name: "婷婷",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
        gender: "女",
        age: 23,
        bio: "烘焙爱好者，发现周边美食🍮",
        phone: "13988887777",
        showPhone: false
      },
      comments: [],
      likes: ["摄影师阿文"]
    },
    {
      id: "mock_2",
      userId: "user_book",
      userName: "书店老刘",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      latitude: pos220m.latitude,
      longitude: pos220m.longitude,
      content: "新到了一批精装建筑设计画册，靠窗阳光正好，安静看书很舒服。📖",
      images: [
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80"
      ],
      createdAt: Date.now() - 1000 * 60 * 45,
      authorProfile: {
        id: "user_book",
        name: "老刘",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
        gender: "男",
        age: 42,
        bio: "经营社区二手书店第十年，以书会友，欢迎来坐坐📖",
        phone: "13688889999",
        showPhone: true
      },
      comments: [],
      likes: ["小夏 (精品咖啡师)"]
    },
    ...acgnList
  ];

  writeLocalData(initialList);
  return initialList;
}

/**
 * 朋友圈点赞/取消点赞切换
 */
export function toggleStatusLike(statusId: string, userName: string): boolean {
  const all = readLocalData();
  const target = all.find(s => s.id === statusId);
  if (!target) return false;
  if (!target.likes) target.likes = [];
  const idx = target.likes.indexOf(userName);
  let isLiked = false;
  if (idx >= 0) {
    target.likes.splice(idx, 1);
    isLiked = false;
  } else {
    target.likes.push(userName);
    isLiked = true;
  }
  writeLocalData(all);
  return isLiked;
}

/**
 * 由发起人关闭求助 (问题已解决)
 */
export function resolveHelpStatus(statusId: string, currentUserId: string): boolean {
  const all = readLocalData();
  const target = all.find((item) => item.id === statusId);
  if (!target) return false;
  if (target.userId !== currentUserId) {
    return false;
  }
  target.helpResolved = true;
  target.helpResolvedTime = Date.now();
  writeLocalData(all);
  return true;
}
