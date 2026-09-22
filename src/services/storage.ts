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
  showPhone: true // 是否向他人公开展示手机号
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

  // 默认预置一个已通过的好友（小夏 咖啡师）与一个申请中的好友
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
    images: comment.images || [],
    authorProfile: comment.authorProfile,
    createdAt: Date.now()
  };

  if (!target.comments) {
    target.comments = [];
  }
  target.comments.unshift(newComment);
  writeLocalData(all);
  return newComment;
}

/**
 * 初始化测试数据
 */
export function ensureInitialMockData(currentPos: Coordinates): StatusItem[] {
  const existing = readLocalData();
  if (existing && existing.length > 0) {
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
    }
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
  writeLocalData(all);
  return true;
}
