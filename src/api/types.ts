/**
 * 后端统一数据契约与接口模型 (API Contracts & DTOs)
 */
import { StatusItem, CommentItem, UserProfile, FriendItem, ChatMessage, SponsoredAdItem } from "../types";

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp?: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface QueryStatusesParams extends PaginationParams {
  latitude: number;
  longitude: number;
  radius?: number;          // 搜索半径，默认 500m
  category?: "all" | "moments" | "recommend" | "acgn";
  acgnTag?: string;
  userId?: string;          // 筛选特定用户的全部动态 (和位置无关)
}

export interface CreateStatusDTO {
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  images?: string[];
  latitude: number;
  longitude: number;
  isAcgn?: boolean;
  acgnTag?: string;
  isHelp?: boolean;
  isEmergency?: boolean;
  helpContactPhone?: string;
}

export interface CreateCommentDTO {
  statusId: string;
  content: string;
  replyToUserName?: string;
  images?: string[];
}

export interface SendFriendRequestDTO {
  targetUserId: string;
  greeting?: string;
}

export interface SendChatMessageDTO {
  receiverId: string;
  content: string;
  type?: "text" | "image";
}
