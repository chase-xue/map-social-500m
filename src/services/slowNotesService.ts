import { ChatMessage, FriendItem, TrashNoteItem } from "../types";
import { getUserProfile, getFriendsList, saveFriendsList } from "./storage";

const CHATS_KEY = "LOCAL_MAP_CHATS_V1";
const TRASH_KEY = "LOCAL_NOTES_TRASH_V1";
const TRASH_DAYS_KEY = "LOCAL_TRASH_RETENTION_DAYS_V1";

const FLY_STEPS = [
  "刚刚从课桌折叠起飞 🕊️",
  "正在掠过街角银杏树稍 🍂",
  "迎着微风穿过街区 🍃",
  "即将滑入对方窗台桌洞 🪟",
  "已稳稳送达桌洞！📬"
];

export function calculateDistanceDuration(distanceMeters: number): { durationSeconds: number; desc: string } {
  if (distanceMeters <= 500) {
    return { durationSeconds: 0, desc: "即时送达" };
  } else if (distanceMeters <= 1500) {
    return { durationSeconds: 30, desc: "纸飞机滑翔中 (约30秒)" };
  } else {
    return { durationSeconds: 60, desc: "慢递飞行中 (约1分钟)" };
  }
}

export function computeFlightProgress(msg: ChatMessage): { progress: number; currentDesc: string; isDelivered: boolean } {
  const now = Date.now();
  if (msg.isDelivered || msg.noteMode === "fast" || !msg.flightDurationSeconds || msg.flightDurationSeconds === 0) {
    return { progress: 100, currentDesc: "已送达 📬", isDelivered: true };
  }

  const elapsed = Math.max(0, (now - msg.createdAt) / 1000);
  const total = msg.flightDurationSeconds;
  if (elapsed >= total) {
    return { progress: 100, currentDesc: "已稳稳送达！📬", isDelivered: true };
  }

  const progress = Math.min(99, Math.floor((elapsed / total) * 100));
  const stepIndex = Math.min(FLY_STEPS.length - 2, Math.floor((progress / 100) * (FLY_STEPS.length - 1)));
  return {
    progress,
    currentDesc: FLY_STEPS[stepIndex] || "纸条正在空中飞行...",
    isDelivered: false
  };
}

/**
 * 根据聊天时长与互动条数计算关系称号（需求 6）
 */
export function getRelationshipTitle(friend: FriendItem, msgCount = 0): { title: string; icon: string; days: number } {
  if (friend.isGroup) {
    const count = friend.members?.length || 3;
    return { title: `${count} 人纸条小群`, icon: "👥", days: friend.chatDays || 1 };
  }
  const baseDays =
    friend.chatDays ??
    (friend.userId === "user_coffee"
      ? 42
      : friend.userId === "user_coser"
        ? 16
        : Math.max(1, Math.floor((Date.now() - (friend.firstChatTime || Date.now())) / (1000 * 60 * 60 * 24)) + 1));

  const score = baseDays + Math.floor(msgCount / 3);
  if (score >= 30) return { title: "岁月至交", icon: "🌟", days: baseDays };
  if (score >= 14) return { title: "时光知己", icon: "🍂", days: baseDays };
  if (score >= 5) return { title: "同桌密友", icon: "🌿", days: baseDays };
  return { title: "初遇笔友", icon: "🌱", days: baseDays };
}

function readAllChats(): Record<string, ChatMessage[]> {
  try {
    const raw = uni.getStorageSync(CHATS_KEY) || "{}";
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function writeAllChats(allChats: Record<string, ChatMessage[]>): void {
  try {
    uni.setStorageSync(CHATS_KEY, JSON.stringify(allChats));
  } catch (e) {}
}

export function sendSlowPaperNote(
  receiverId: string,
  content: string,
  options: {
    noteMode?: "fast" | "crumpled";
    crumpledText?: string;
    crumpledImage?: string;
    isSealed?: boolean;
    sealType?: string;
    paperType?: string;
    sketchMode?: boolean;
    originalImage?: string;
    imageUri?: string;
    targetDistanceMeters?: number;
  } = {}
): ChatMessage {
  const me = getUserProfile();
  const noteMode = options.noteMode || "fast";
  const isFast = noteMode === "fast";
  const createdAt = Date.now();
  const isImage = !!options.imageUri || content.startsWith("data:image/");

  const newMsg: ChatMessage = {
    id: "note_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    senderId: me.id,
    receiverId,
    senderName: me.name,
    senderAvatar: me.avatar,
    content: isImage ? (options.imageUri || content) : content.slice(0, 300),
    contentType: isImage ? "image" : "text",
    createdAt,
    noteMode,
    crumpledText: options.crumpledText,
    crumpledImage: options.crumpledImage,
    isSealed: options.isSealed ?? false,
    sealType: options.sealType,
    paperType: options.paperType || "淡黄和纸",
    isOpened: isFast, // 纸团默认未展开，点击后触发全屏展开动画
    isPinnedToDesk: false,
    isAccelerated: false,
    sketchMode: options.sketchMode ?? false,
    originalImage: options.originalImage,
    flightDurationSeconds: 0,
    deliveredAt: createdAt,
    isDelivered: true,
    flightProgress: 100,
    currentFlyLocation: "已送达"
  };

  const allChats = readAllChats();
  if (!allChats[receiverId]) {
    allChats[receiverId] = [];
  }
  allChats[receiverId].push(newMsg);
  writeAllChats(allChats);

  const friends = getFriendsList();
  const f = friends.find(item => item.userId === receiverId);
  if (f) {
    if (noteMode === "crumpled") {
      f.lastMessage = "🏐 [扔来一个纸团 · 点击全屏展开]";
    } else if (isImage) {
      f.lastMessage = options.sketchMode ? "✏️ [素描照片小纸条]" : "🖼️ [图片小纸条]";
    } else {
      f.lastMessage = content;
    }
    f.lastMessageTime = createdAt;
    saveFriendsList(friends);
  }

  return newMsg;
}

/**
 * 纸篓与定时自动回收（需求 7）
 */
export function getTrashRetentionDays(): number {
  try {
    const val = Number(uni.getStorageSync(TRASH_DAYS_KEY));
    if (val === 7 || val === 30) return val;
  } catch (e) {}
  return 7;
}

export function setTrashRetentionDays(days: 7 | 30): void {
  try {
    uni.setStorageSync(TRASH_DAYS_KEY, String(days));
  } catch (e) {}
}

export function getTrashNotes(): TrashNoteItem[] {
  let list: TrashNoteItem[] = [];
  try {
    const raw = uni.getStorageSync(TRASH_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    list = [];
  }
  // 定时自动回收过期纸条
  const retentionMs = getTrashRetentionDays() * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const alive = list.filter((item) => now - item.deletedAt < retentionMs);
  if (alive.length !== list.length) {
    try {
      uni.setStorageSync(TRASH_KEY, JSON.stringify(alive));
    } catch (e) {}
  }
  return alive;
}

export function moveNoteToTrash(friendId: string, friendName: string, msg: ChatMessage): boolean {
  const allChats = readAllChats();
  const list = allChats[friendId] || [];
  const nextList = list.filter((m) => m.id !== msg.id);
  allChats[friendId] = nextList;
  writeAllChats(allChats);

  const trash = getTrashNotes();
  trash.unshift({
    id: "trash_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    sourceFriendId: friendId,
    sourceFriendName: friendName,
    message: msg,
    deletedAt: Date.now()
  });
  try {
    uni.setStorageSync(TRASH_KEY, JSON.stringify(trash));
  } catch (e) {}
  return true;
}

export function restoreNoteFromTrash(trashId: string): boolean {
  const trash = getTrashNotes();
  const target = trash.find((t) => t.id === trashId);
  if (!target) return false;

  const allChats = readAllChats();
  if (!allChats[target.sourceFriendId]) {
    allChats[target.sourceFriendId] = [];
  }
  allChats[target.sourceFriendId].push(target.message);
  allChats[target.sourceFriendId].sort((a, b) => a.createdAt - b.createdAt);
  writeAllChats(allChats);

  const remain = trash.filter((t) => t.id !== trashId);
  try {
    uni.setStorageSync(TRASH_KEY, JSON.stringify(remain));
  } catch (e) {}
  return true;
}

export function emptyTrash(): void {
  try {
    uni.setStorageSync(TRASH_KEY, JSON.stringify([]));
  } catch (e) {}
}

/**
 * 建群功能（需求 20）
 */
export function createNoteGroup(groupName: string, memberFriends: FriendItem[]): FriendItem {
  const me = getUserProfile();
  const groupId = "group_" + Date.now();
  const members = [me.name, ...memberFriends.map((f) => f.name)];

  const newGroup: FriendItem = {
    userId: groupId,
    name: groupName.trim() || "纸条小分队",
    avatar: memberFriends[0]?.avatar || me.avatar,
    status: "accepted",
    isGroup: true,
    members,
    chatDays: 1,
    firstChatTime: Date.now(),
    lastMessage: `欢迎 ${members.join("、")} 加入小纸条群聊！`,
    lastMessageTime: Date.now(),
    unreadCount: 0
  };

  const friends = getFriendsList();
  friends.unshift(newGroup);
  saveFriendsList(friends);

  const allChats = readAllChats();
  allChats[groupId] = [
    {
      id: "grp_welcome_" + Date.now(),
      senderId: memberFriends[0]?.userId || "system",
      senderName: memberFriends[0]?.name || "群小助手",
      senderAvatar: memberFriends[0]?.avatar || me.avatar,
      receiverId: groupId,
      content: `哈喽大家！${newGroup.name} 建好啦，日常可以文字速发，有好玩的也可以揉成纸团扔进来～`,
      contentType: "text",
      noteMode: "fast",
      paperType: "淡黄和纸",
      createdAt: Date.now(),
      isDelivered: true,
      isOpened: true
    }
  ];
  writeAllChats(allChats);

  return newGroup;
}

export function accelerateSlowNote(): boolean {
  uni.showToast({ title: "小纸条慢社交：拒绝付费提速～🕊️", icon: "none" });
  return false;
}
