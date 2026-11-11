/**
 * 动态/状态服务接口 (Statuses & Moments API)
 * 适配真实后端 RESTful 规范，并支持开发期本地双轨降级
 */
import { request } from "./client";
import { QueryStatusesParams, CreateStatusDTO, CreateCommentDTO } from "./types";
import { StatusItem, CommentItem } from "../types";
import {
  readLocalData,
  writeLocalData,
  addNewStatus,
  addCommentToStatus,
  toggleStatusLike,
} from "../services/storage";
import { filterStatusesWithinRange } from "../services/geo";

/**
 * 1. 查询附近状态 (500米物理生活圈)
 * GET /api/v1/statuses/nearby
 */
export async function getNearbyStatuses(params: QueryStatusesParams): Promise<StatusItem[]> {
  try {
    const res = await request<StatusItem[]>({
      url: "/api/v1/statuses/nearby",
      method: "GET",
      data: params,
    });
    return res.data;
  } catch {
    // 降级使用本地存储与空间过滤
    const all = readLocalData();
    return filterStatusesWithinRange(
      { latitude: params.latitude, longitude: params.longitude },
      all,
      params.radius || 500
    );
  }
}

/**
 * 2. 查询同城热门推荐流
 * GET /api/v1/statuses/recommended
 */
export async function getRecommendedStatuses(): Promise<StatusItem[]> {
  try {
    const res = await request<StatusItem[]>({
      url: "/api/v1/statuses/recommended",
      method: "GET",
    });
    return res.data;
  } catch {
    const all = readLocalData();
    return [...all]
      .map((item) => {
        const likesCount = item.likes?.length || 0;
        const hoursOld = (Date.now() - item.createdAt) / (1000 * 60 * 60);
        const recencyScore = Math.max(0, 100 - hoursOld * 3);
        const score = likesCount * 80 + recencyScore;
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);
  }
}

/**
 * 3. 查询二次元专属专区流 (支持细分子标签过滤)
 * GET /api/v1/statuses/acgn
 */
export async function getAcgnStatuses(tag?: string): Promise<StatusItem[]> {
  try {
    const res = await request<StatusItem[]>({
      url: "/api/v1/statuses/acgn",
      method: "GET",
      data: { tag },
    });
    return res.data;
  } catch {
    const all = readLocalData();
    return all
      .filter((s) => s.isAcgn && (!tag || tag === "all" || s.acgnTag === tag))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
}

/**
 * 4. 查询特定用户发表的所有动态 (和位置无关，全量查询)
 * GET /api/v1/users/:userId/statuses
 */
export async function getUserAllStatuses(userId: string): Promise<StatusItem[]> {
  try {
    const res = await request<StatusItem[]>({
      url: `/api/v1/users/${userId}/statuses`,
      method: "GET",
    });
    return res.data;
  } catch {
    const all = readLocalData();
    return all
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }
}

/**
 * 5. 发布新动态 / 救命呼救
 * POST /api/v1/statuses
 */
export async function createStatus(dto: CreateStatusDTO): Promise<StatusItem> {
  try {
    const res = await request<StatusItem>({
      url: "/api/v1/statuses",
      method: "POST",
      data: dto,
    });
    return res.data;
  } catch {
    return addNewStatus({
      userId: dto.userId,
      userName: dto.userName,
      userAvatar: dto.userAvatar,
      latitude: dto.latitude,
      longitude: dto.longitude,
      content: dto.content,
      images: dto.images || [],
      isAcgn: dto.isAcgn,
      acgnTag: dto.acgnTag,
      isHelp: dto.isHelp,
      isEmergency: dto.isEmergency,
      helpContactPhone: dto.helpContactPhone,
    });
  }
}

/**
 * 6. 点赞 / 取消点赞切换
 * POST /api/v1/statuses/:statusId/likes
 */
export async function toggleLikeStatusApi(statusId: string, userName: string): Promise<boolean> {
  try {
    const res = await request<{ liked: boolean }>({
      url: `/api/v1/statuses/${statusId}/likes`,
      method: "POST",
      data: { userName },
    });
    return res.data.liked;
  } catch {
    return toggleStatusLike(statusId, userName);
  }
}

/**
 * 7. 发表评论 / 二级回复
 * POST /api/v1/statuses/:statusId/comments
 */
export async function postCommentApi(
  statusId: string,
  comment: {
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    replyToUserName?: string;
    images?: string[];
  }
): Promise<CommentItem> {
  try {
    const res = await request<CommentItem>({
      url: `/api/v1/statuses/${statusId}/comments`,
      method: "POST",
      data: comment,
    });
    return res.data;
  } catch {
    return addCommentToStatus(statusId, comment);
  }
}
