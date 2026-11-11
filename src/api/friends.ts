/**
 * 好友通讯录与私聊消息服务接口 (Friends & Messages API)
 * 适配真实后端 RESTful 规范，并支持本地降级
 */
import { request } from "./client";
import { FriendItem, ChatMessage } from "../types";
import { SendFriendRequestDTO, SendChatMessageDTO } from "./types";
import {
  readFriendsList,
  writeFriendsList,
  readChatHistory,
  writeChatHistory,
} from "../services/storage";

/**
 * 获取我的好友通讯录列表
 * GET /api/v1/friends
 */
export async function getFriendsList(): Promise<FriendItem[]> {
  try {
    const res = await request<FriendItem[]>({
      url: "/api/v1/friends",
      method: "GET",
    });
    return res.data;
  } catch {
    return readFriendsList();
  }
}

/**
 * 发送好友申请 / 添加好友
 * POST /api/v1/friends/requests
 */
export async function sendFriendRequest(dto: SendFriendRequestDTO): Promise<boolean> {
  try {
    await request({
      url: "/api/v1/friends/requests",
      method: "POST",
      data: dto,
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * 获取与指定好友的私聊历史记录
 * GET /api/v1/friends/:friendId/messages
 */
export async function getChatMessages(friendId: string): Promise<ChatMessage[]> {
  try {
    const res = await request<ChatMessage[]>({
      url: `/api/v1/friends/${friendId}/messages`,
      method: "GET",
    });
    return res.data;
  } catch {
    return readChatHistory(friendId);
  }
}

/**
 * 发送一条私聊消息
 * POST /api/v1/friends/:friendId/messages
 */
export async function sendChatMessage(friendId: string, message: ChatMessage): Promise<ChatMessage> {
  try {
    const res = await request<ChatMessage>({
      url: `/api/v1/friends/${friendId}/messages`,
      method: "POST",
      data: message,
    });
    return res.data;
  } catch {
    const list = readChatHistory(friendId);
    list.push(message);
    writeChatHistory(friendId, list);
    return message;
  }
}
