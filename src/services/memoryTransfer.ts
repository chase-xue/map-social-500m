/**
 * Local-First 优先本地存储 · 传输记忆 / 账号互传服务（需求 10 & 17）
 */
const MEMORY_KEYS = [
  "LOCAL_MAP_USER_PROFILE_V1",
  "LOCAL_MAP_STATUSES_V1",
  "LOCAL_MAP_FRIENDS_V1",
  "LOCAL_MAP_CHATS_V1",
  "LOCAL_DESK_HOLE_DATA_V1",
  "LOCAL_NOTES_TRASH_V1",
  "LOCAL_TRASH_RETENTION_DAYS_V1",
  "LOCAL_PUSH_SUBSCRIPTION_V1",
] as const;

export interface MemoryBundle {
  app: "slow-notes-500m";
  version: 3;
  exportedAt: number;
  data: Record<string, string>;
}

export function collectLocalMemoryBundle(): MemoryBundle {
  const data: Record<string, string> = {};
  for (const key of MEMORY_KEYS) {
    try {
      const val = uni.getStorageSync(key);
      if (val !== undefined && val !== null && val !== "") {
        data[key] = typeof val === "string" ? val : JSON.stringify(val);
      }
    } catch (e) {}
  }
  return {
    app: "slow-notes-500m",
    version: 3,
    exportedAt: Date.now(),
    data,
  };
}

export function getLocalMemoryStats(): { keysCount: number; sizeKB: number } {
  const bundle = collectLocalMemoryBundle();
  const str = JSON.stringify(bundle);
  return {
    keysCount: Object.keys(bundle.data).length,
    sizeKB: Math.max(1, Math.round((str.length / 1024) * 10) / 10),
  };
}

export function exportMemoryToken(): string {
  const bundle = collectLocalMemoryBundle();
  return JSON.stringify(bundle);
}

export function downloadMemoryJsonFile(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const json = JSON.stringify(collectLocalMemoryBundle(), null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    a.href = url;
    a.download = `slow-notes-memory-${stamp}.slownotes.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    return false;
  }
}

export function importMemoryFromText(rawText: string): { ok: boolean; msg: string; count: number } {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { ok: false, msg: "请先粘贴记忆口令或 JSON 内容", count: 0 };
  }
  try {
    const parsed = JSON.parse(trimmed) as MemoryBundle;
    if (!parsed || parsed.app !== "slow-notes-500m" || !parsed.data || typeof parsed.data !== "object") {
      return { ok: false, msg: "格式不匹配：不是有效的小纸条记忆包", count: 0 };
    }
    let count = 0;
    for (const key of MEMORY_KEYS) {
      if (parsed.data[key] !== undefined) {
        uni.setStorageSync(key, parsed.data[key]);
        count++;
      }
    }
    return { ok: true, msg: `成功恢复 ${count} 项本地记忆！`, count };
  } catch (e) {
    return { ok: false, msg: "解析失败，请确认粘贴内容完整", count: 0 };
  }
}
