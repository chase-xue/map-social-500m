/**
 * 生产级统一 HTTP 网络请求客户端 (Unified API Client)
 * 封装 uni.request，支持拦截器、统一错误处理与 Mock 回退机制
 */
import { ApiResponse } from "./types";

export interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

// 优先读取环境变量 VITE_API_BASE_URL，无后端时使用本地契约调度
export const API_BASE_URL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "";

/**
 * 获取请求认证 Token (JWT Bearer)
 */
function getAuthToken(): string {
  try {
    return uni.getStorageSync("USER_AUTH_TOKEN") || "";
  } catch {
    return "";
  }
}

/**
 * 核心统一请求函数
 */
export async function request<T>(options: RequestOptions): Promise<ApiResponse<T>> {
  const fullUrl = options.url.startsWith("http")
    ? options.url
    : `${API_BASE_URL}${options.url.startsWith("/") ? "" : "/"}${options.url}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 若未配置远程 API_BASE_URL，抛出错误以便上层调用服务降级到本地持久层存储
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL_NOT_CONFIGURED");
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: fullUrl,
      method: options.method || "GET",
      data: options.data,
      header: headers,
      timeout: options.timeout || 10000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = res.data as ApiResponse<T>;
          if (body && typeof body.code !== "undefined") {
            if (body.code === 0 || body.code === 200) {
              resolve(body);
            } else {
              uni.showToast({ title: body.message || "业务处理异常", icon: "none" });
              reject(new Error(body.message || "API Error"));
            }
          } else {
            // 兼容直接返回原始数据实体的后端接口
            resolve({
              code: 200,
              message: "OK",
              data: res.data as T,
            });
          }
        } else {
          const msg = `网络请求失败 (${res.statusCode})`;
          uni.showToast({ title: msg, icon: "none" });
          reject(new Error(msg));
        }
      },
      fail: (err) => {
        console.warn("网络异常，启用契约降级:", err);
        reject(err);
      },
    });
  });
}
