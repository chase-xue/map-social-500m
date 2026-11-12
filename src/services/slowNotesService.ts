import { ChatMessage, FriendItem, UserProfile } from "../types";
import { getUserProfile, saveUserProfile, getFriendsList, saveFriendsList, getChatMessages } from "./storage";

const SLOW_NOTES_KEY = "LOCAL_SLOW_NOTES_EXTRA_V1";

export interface SlowFlightInfo {
  messageId: string;
  senderId: string;
  receiverId: string;
  startLocation: string;
  targetLocation: string;
  currentStepDesc: string;
  distanceMeters: number;
  totalDurationSeconds: number;
  sentAt: number;
  deliveredAt: number;
  isDelivered: boolean;
  flightProgress: number; // 0 ~ 100
  passByCount: number;
  isSealed: boolean;
  isAccelerated: boolean;
}

const FLY_STEPS = [
  "刚刚从课桌折叠起飞 🕊️",
  "正在掠过街角银杏树稍 🍂",
  "迎着微风穿过学院路十字路口 🚥",
  "由热心路人轻轻顺手传递 🤝",
  "即将滑入对方窗台桌洞 🪟",
  "已稳稳送达桌洞！📬"
];

export function calculateDistanceDuration(distanceMeters: number): { durationSeconds: number; desc: string } {
  if (distanceMeters <= 500) {
    return { durationSeconds: 0, desc: "500米同桌生活圈 · 即时传递" };
  } else if (distanceMeters <= 1500) {
    return { durationSeconds: 45, desc: "约 1 公里 · 纸飞机滑翔中 (约45秒)" };
  } else if (distanceMeters <= 5000) {
    return { durationSeconds: 120, desc: "约 3~5 公里 · 穿过街区传递中 (约2分钟)" };
  } else {
    return { durationSeconds: 240, desc: "跨城远距离 · 慢条斯理飞行中 (约4分钟)" };
  }
}

export function computeFlightProgress(msg: ChatMessage): { progress: number; currentDesc: string; isDelivered: boolean } {
  const now = Date.now();
  if (msg.isDelivered || !msg.flightDurationSeconds || msg.flightDurationSeconds === 0) {
    return { progress: 100, currentDesc: "已送达桌洞 📬", isDelivered: true };
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

export function sendSlowPaperNote(
  receiverId: string,
  content: string,
  options: {
    isSealed?: boolean;
    sketchMode?: boolean;
    imageUri?: string;
    targetDistanceMeters?: number;
  } = {}
): ChatMessage {
  const me = getUserProfile();
  const distance = options.targetDistanceMeters || 850;
  const { durationSeconds } = calculateDistanceDuration(distance);

  const createdAt = Date.now();
  const deliveredAt = createdAt + durationSeconds * 1000;
  const isDelivered = durationSeconds === 0;

  const newMsg: ChatMessage = {
    id: "note_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    senderId: me.id,
    receiverId,
    content: content.slice(0, 70), // 严格限制70字
    contentType: options.imageUri ? "image" : "text",
    createdAt,
    isSealed: options.isSealed ?? false,
    isAccelerated: false,
    sketchMode: options.sketchMode ?? false,
    distanceMeters: distance,
    flightDurationSeconds: durationSeconds,
    deliveredAt,
    isDelivered,
    flightProgress: isDelivered ? 100 : 5,
    currentFlyLocation: isDelivered ? "已即时送达" : "折叠起飞，正在越过邻近街区...",
    passByUsers: ["邻居小张", "咖啡师小夏"]
  };

  // 存储到聊天记录中
  const rawChats = uni.getStorageSync("LOCAL_MAP_CHATS_V1") || "{}";
  let allChats: Record<string, ChatMessage[]> = {};
  try {
    allChats = JSON.parse(rawChats);
  } catch (e) {}

  if (!allChats[receiverId]) {
    allChats[receiverId] = [];
  }
  allChats[receiverId].push(newMsg);
  uni.setStorageSync("LOCAL_MAP_CHATS_V1", JSON.stringify(allChats));

  // 更新好友列表中最后一条纸条
  const friends = getFriendsList();
  const f = friends.find(item => item.userId === receiverId);
  if (f) {
    f.lastMessage = isDelivered ? content : `✈️ [纸条传递中] ${content.slice(0, 18)}...`;
    f.lastMessageTime = createdAt;
    f.distanceMeters = distance;
    saveFriendsList(friends);
  }

  return newMsg;
}

export function accelerateSlowNote(receiverId: string, messageId: string): boolean {
  const rawChats = uni.getStorageSync("LOCAL_MAP_CHATS_V1") || "{}";
  let allChats: Record<string, ChatMessage[]> = {};
  try {
    allChats = JSON.parse(rawChats);
  } catch (e) {
    return false;
  }

  const list = allChats[receiverId];
  if (!list) return false;

  const target = list.find(m => m.id === messageId);
  if (!target) return false;

  // 消耗 1 张极速加速券
  const profile = getUserProfile();
  if (profile.growth) {
    if (profile.growth.speedTickets > 0) {
      profile.growth.speedTickets -= 1;
    } else if (profile.growth.coins >= 10) {
      profile.growth.coins -= 10;
    }
    saveUserProfile(profile);
  }

  target.isAccelerated = true;
  target.isDelivered = true;
  target.flightProgress = 100;
  target.deliveredAt = Date.now();
  target.currentFlyLocation = "🚀 已通过1元极速特权加速送达！";

  uni.setStorageSync("LOCAL_MAP_CHATS_V1", JSON.stringify(allChats));
  return true;
}
