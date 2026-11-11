/**
 * 用户个人资料与设置服务接口 (User Profile & Settings API)
 * 适配真实后端 RESTful 规范，并支持本地降级
 */
import { request } from "./client";
import { UserProfile } from "../types";
import { readUserProfile, writeUserProfile } from "../services/storage";

/**
 * 获取当前登录用户的个人资料
 * GET /api/v1/user/profile
 */
export async function getMyProfile(): Promise<UserProfile> {
  try {
    const res = await request<UserProfile>({
      url: "/api/v1/user/profile",
      method: "GET",
    });
    return res.data;
  } catch {
    return readUserProfile();
  }
}

/**
 * 更新当前登录用户的个人资料与页签展示设置
 * PUT /api/v1/user/profile
 */
export async function updateMyProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const res = await request<UserProfile>({
      url: "/api/v1/user/profile",
      method: "PUT",
      data: profile,
    });
    return res.data;
  } catch {
    const current = readUserProfile();
    const updated = { ...current, ...profile };
    writeUserProfile(updated);
    return updated;
  }
}

/**
 * 获取任意目标用户的公开个人卡片信息
 * GET /api/v1/users/:userId
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const res = await request<UserProfile>({
      url: `/api/v1/users/${userId}`,
      method: "GET",
    });
    return res.data;
  } catch {
    return null;
  }
}
