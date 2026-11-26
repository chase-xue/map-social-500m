import { DeskTheme, NotePaperColor, TerrainType } from "../types";

export interface WindowNoteItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  color: NotePaperColor;
  createdAt: number;
  rotationDeg: number;
  likes: number;
  isMine: boolean;
}

export interface DiaryMemoryItem {
  id: string;
  title: string;
  content: string;
  dateStr: string;
  locationName: string;
  tag: string;
  color: NotePaperColor;
  paperTexture: string;
}

export interface DrawerSecretNote {
  id: string;
  senderName: string;
  senderAvatar: string;
  preview: string;
  fullContent: string;
  isSealed: boolean;
  receivedTime: string;
  read: boolean;
  category?: string;
}

export interface ScheduleItem {
  id: string;
  day: "周一" | "周二" | "周三" | "周四" | "周五" | "周六" | "周日";
  time: string;
  title: string;
  room?: string;
}

export interface LedgerEntry {
  id: string;
  type: "expense" | "income";
  amount: number;
  category: string;
  note: string;
  dateStr: string;
}

export interface AlbumPhotoItem {
  id: string;
  url: string;
  caption: string;
  location: string;
  dateStr: string;
}

export interface GiftItem {
  id: string;
  name: string;
  icon: string;
  from: string;
  message: string;
  dateStr: string;
}

export interface JewelryItem {
  id: string;
  name: string;
  icon: string;
  rarity: string;
  equipped: boolean;
}

export interface DeskDecorConfig {
  deskStyle: "classic" | "walnut" | "cream" | "sakura";
  curtainStyle: number; // 1~5
  wallpaperStyle: "warm" | "linen" | "sage" | "starry";
  terrain: TerrainType;
  petSlot: "none" | "cat" | "shiba" | "bird";
}

export interface ExtraSlotModule {
  id: string;
  name: string;
  icon: string;
  desc: string;
}

export interface DeskHoleData {
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  theme: DeskTheme;
  weather: "sunny" | "rainy" | "night" | "cloudy";
  terrain?: TerrainType;
  decor?: DeskDecorConfig;
  windowNotes: WindowNoteItem[];
  stickyWallNotes?: WindowNoteItem[];
  diaryEntries: DiaryMemoryItem[];
  drawerNotes: DrawerSecretNote[];
  noteCategories?: string[];
  schedule?: ScheduleItem[];
  ledger?: LedgerEntry[];
  albumPhotos?: AlbumPhotoItem[];
  gifts?: GiftItem[];
  jewelry?: JewelryItem[];
  extraSlots?: ExtraSlotModule[];
  visitorCount: number;
}

export const DESK_STORAGE_KEY = "LOCAL_DESK_HOLE_DATA_V1";

function buildDefaultDeskData(): DeskHoleData {
  return {
    ownerId: "my_user_id",
    ownerName: "探索者小晨",
    ownerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    theme: "wood",
    weather: "sunny",
    terrain: "city",
    decor: {
      deskStyle: "classic",
      curtainStyle: 1,
      wallpaperStyle: "warm",
      terrain: "city",
      petSlot: "none",
    },
    visitorCount: 128,
    windowNotes: [
      {
        id: "wn_1",
        authorId: "user_coffee",
        authorName: "小夏 (精品咖啡师)",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        content: "今天窗外阳光刚好照在桌上，手冲咖啡香飘过来啦～☕",
        color: "yellow",
        createdAt: Date.now() - 1000 * 60 * 120,
        rotationDeg: -2,
        likes: 12,
        isMine: false,
      },
      {
        id: "wn_2",
        authorId: "user_coser",
        authorName: "荧光喵喵 (Coser)",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        content: "悄悄在留言板贴一张祈愿条：下周漫展天气大晴！🌸",
        color: "pink",
        createdAt: Date.now() - 1000 * 60 * 360,
        rotationDeg: 3,
        likes: 24,
        isMine: false,
      },
      {
        id: "wn_3",
        authorId: "my_user_id",
        authorName: "探索者小晨",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        content: "生活不赶路，慢慢写字，静待小纸条滑入桌洞。",
        color: "green",
        createdAt: Date.now() - 1000 * 60 * 720,
        rotationDeg: 1,
        likes: 38,
        isMine: true,
      },
    ],
    stickyWallNotes: [
      {
        id: "sw_1",
        authorId: "my_user_id",
        authorName: "我",
        authorAvatar: "",
        content: "去丽江看一次玉龙雪山日照金山 🏔️",
        color: "yellow",
        createdAt: Date.now() - 1000 * 60 * 240,
        rotationDeg: -3,
        likes: 6,
        isMine: true,
      },
      {
        id: "sw_2",
        authorId: "my_user_id",
        authorName: "我",
        authorAvatar: "",
        content: "周末给窗台多肉换盆浇水 🪴",
        color: "green",
        createdAt: Date.now() - 1000 * 60 * 500,
        rotationDeg: 2,
        likes: 4,
        isMine: true,
      },
      {
        id: "sw_3",
        authorId: "my_user_id",
        authorName: "我",
        authorAvatar: "",
        content: "画一张铅笔素描寄给好朋友 ✏️",
        color: "pink",
        createdAt: Date.now() - 1000 * 60 * 900,
        rotationDeg: -1,
        likes: 9,
        isMine: true,
      },
    ],
    diaryEntries: [
      {
        id: "diary_1",
        title: "晴朗秋日的街角随笔",
        content: "下午坐在窗前整理了上周收到的折纸小条。有人写了关于猫咪的奇妙偶遇，有人留下了刚出炉面包的香味。慢生活的确有独特的魔力。",
        dateStr: "11月12日 · 晴",
        locationName: "街心花园",
        tag: "生活记忆",
        color: "yellow",
        paperTexture: "grid",
      },
      {
        id: "diary_2",
        title: "第一次收到火漆印小纸条",
        content: "红色的火漆封口很有仪式感，字数不多，但一笔一划都能感受到认真。",
        dateStr: "11月10日 · 微风",
        locationName: "阳光咖啡馆",
        tag: "纸条回忆",
        color: "kraft",
        paperTexture: "lined",
      },
    ],
    noteCategories: ["全部", "心动瞬间", "旅行碎片", "灵感备忘"],
    drawerNotes: [
      {
        id: "drawer_1",
        senderName: "小夏 (精品咖啡师)",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        preview: "耶加雪菲手冲配方：水温91℃，粉水比1:15...",
        fullContent: "嗨！特意把新烘焙的耶加雪菲配方写给你：水温91℃，粉水比1:15，三段式注水。有空来尝这杯！",
        isSealed: true,
        receivedTime: "今天 08:30",
        read: false,
        category: "心动瞬间",
      },
      {
        id: "drawer_2",
        senderName: "阿木 · 丽江木屋",
        senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
        preview: "丽江四方街的青石板今天泛着暖光...",
        fullContent: "如果你来丽江古城，记得傍晚去狮子山看万家灯火，风里都是民谣的声音。",
        isSealed: false,
        receivedTime: "昨天 19:20",
        read: true,
        category: "旅行碎片",
      },
    ],
    schedule: [
      { id: "sc_1", day: "周一", time: "09:00", title: "设计素描课", room: "艺术楼 204" },
      { id: "sc_2", day: "周一", time: "14:00", title: "咖啡手冲体验", room: "街角工坊" },
      { id: "sc_3", day: "周三", time: "10:00", title: "城市摄影采风", room: "古城南门" },
      { id: "sc_4", day: "周五", time: "19:30", title: "电影放映夜", room: "社区书屋" },
    ],
    ledger: [
      { id: "lg_1", type: "expense", amount: 28, category: "咖啡饮品", note: "手冲耶加雪菲", dateStr: "11-26" },
      { id: "lg_2", type: "expense", amount: 45, category: "手账文创", note: "京都和纸胶带", dateStr: "11-24" },
      { id: "lg_3", type: "income", amount: 120, category: "插画稿费", note: "素描约稿", dateStr: "11-22" },
    ],
    albumPhotos: [
      {
        id: "al_1",
        url: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&auto=format&fit=crop&q=80",
        caption: "丽江古城的青瓦与暖阳",
        location: "丽江古城",
        dateStr: "11月20日",
      },
      {
        id: "al_2",
        url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
        caption: "午后窗边的手冲咖啡",
        location: "阳光咖啡馆",
        dateStr: "11月15日",
      },
    ],
    gifts: [
      { id: "gf_1", name: "古铜月相火漆印", icon: "🌙", from: "小夏", message: "愿你的每封纸条都有月光陪伴", dateStr: "11月18日" },
      { id: "gf_2", name: "手工黄铜纸飞机书签", icon: "✈️", from: "阿木", message: "从丽江寄来的小礼物", dateStr: "11月12日" },
    ],
    jewelry: [
      { id: "jw_1", name: "岁月至交铜章", icon: "🏅", rarity: "珍藏", equipped: true },
      { id: "jw_2", name: "银杏叶胸针", icon: "🍂", rarity: "秋日限定", equipped: false },
      { id: "jw_3", name: "猫爪玫瑰金挂坠", icon: "🐾", rarity: "暖心", equipped: false },
    ],
    extraSlots: [
      { id: "slot_wish", name: "心愿胶囊", icon: "💊", desc: "封存给未来自己的一句话" },
    ],
  };
}

export function getMyDeskData(): DeskHoleData {
  const defaults = buildDefaultDeskData();
  const raw = uni.getStorageSync(DESK_STORAGE_KEY);
  if (raw) {
    try {
      const parsed: DeskHoleData = JSON.parse(raw);
      if (parsed.windowNotes) {
        parsed.windowNotes = parsed.windowNotes.filter(
          (n) => !(n.content.startsWith("data:image/") && n.content.length < 200)
        );
      }
      return {
        ...defaults,
        ...parsed,
        decor: { ...defaults.decor!, ...(parsed.decor || {}) },
        stickyWallNotes: parsed.stickyWallNotes || defaults.stickyWallNotes,
        noteCategories: parsed.noteCategories || defaults.noteCategories,
        schedule: parsed.schedule || defaults.schedule,
        ledger: parsed.ledger || defaults.ledger,
        albumPhotos: parsed.albumPhotos || defaults.albumPhotos,
        gifts: parsed.gifts || defaults.gifts,
        jewelry: parsed.jewelry || defaults.jewelry,
        extraSlots: parsed.extraSlots || defaults.extraSlots,
      };
    } catch (e) {}
  }
  saveMyDeskData(defaults);
  return defaults;
}

export function saveMyDeskData(data: DeskHoleData): void {
  try {
    uni.setStorageSync(DESK_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

/**
 * 免 Key 实时天气拉取（Open-Meteo），断网或超时优雅降级
 */
export async function fetchRealtimeWeather(
  latitude: number,
  longitude: number
): Promise<{ weather: "sunny" | "rainy" | "night" | "cloudy"; tempC?: number } | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(3)}&longitude=${longitude.toFixed(3)}&current=temperature_2m,weather_code,is_day`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const cur = json?.current;
    if (!cur) return null;
    const code = Number(cur.weather_code || 0);
    const isDay = Number(cur.is_day ?? 1) === 1;
    let weather: "sunny" | "rainy" | "night" | "cloudy" = "sunny";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) {
      weather = "rainy";
    } else if (!isDay) {
      weather = "night";
    } else if ([1, 2, 3, 45, 48].includes(code)) {
      weather = "cloudy";
    } else {
      weather = "sunny";
    }
    return { weather, tempC: Math.round(Number(cur.temperature_2m)) };
  } catch (e) {
    return null;
  }
}

export function getOtherDeskData(userId: string, name: string, avatar: string): DeskHoleData {
  const base = buildDefaultDeskData();
  return {
    ...base,
    ownerId: userId,
    ownerName: name,
    ownerAvatar: avatar,
    weather: "cloudy",
    visitorCount: 64 + (userId.length * 7) % 100,
    windowNotes: [
      {
        id: "other_wn_1",
        authorId: userId,
        authorName: name,
        authorAvatar: avatar,
        content: `欢迎来 ${name} 的桌洞小坐，可以在左边留言板留张纸条哦～`,
        color: "yellow",
        createdAt: Date.now() - 1000 * 60 * 90,
        rotationDeg: -2,
        likes: 18,
        isMine: false,
      },
    ],
  };
}

export function addWindowNote(
  desk: DeskHoleData,
  content: string,
  color: NotePaperColor,
  author: { id: string; name: string; avatar: string }
): WindowNoteItem {
  const newNote: WindowNoteItem = {
    id: "wn_" + Date.now(),
    authorId: author.id,
    authorName: author.name,
    authorAvatar: author.avatar,
    content,
    color,
    createdAt: Date.now(),
    rotationDeg: Math.floor(Math.random() * 7) - 3,
    likes: 1,
    isMine: author.id === "my_user_id",
  };
  desk.windowNotes.unshift(newNote);
  if (desk.ownerId === "my_user_id") {
    saveMyDeskData(desk);
  }
  return newNote;
}

export function addDiaryMemory(
  desk: DeskHoleData,
  title: string,
  content: string,
  locationName: string,
  tag: string,
  color: NotePaperColor
): DiaryMemoryItem {
  const now = new Date();
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日`;
  const entry: DiaryMemoryItem = {
    id: "diary_" + Date.now(),
    title: title || "今日窗边随笔",
    content,
    dateStr,
    locationName: locationName || "书桌窗前",
    tag: tag || "日常",
    color,
    paperTexture: "lined",
  };
  desk.diaryEntries.unshift(entry);
  if (desk.ownerId === "my_user_id") {
    saveMyDeskData(desk);
  }
  return entry;
}
