/**
 * 二次元 (ACGN) 领域分类与常量配置
 */

export interface AcgnTagCategory {
  emoji: string;
  name: string;
}

export const ACGN_TAG_CATEGORIES: AcgnTagCategory[] = [
  { emoji: "👗", name: "Cosplay" },
  { emoji: "🛍️", name: "谷美/吃谷" },
  { emoji: "🎪", name: "漫展打卡" },
  { emoji: "📺", name: "番剧安利" },
  { emoji: "🎮", name: "游戏同好" },
];
