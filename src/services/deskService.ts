import { DeskTheme, NotePaperColor } from "../types";

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
}

export interface DeskHoleData {
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  theme: DeskTheme;
  weather: 'sunny' | 'rainy' | 'night' | 'cloudy';
  windowNotes: WindowNoteItem[];
  diaryEntries: DiaryMemoryItem[];
  drawerNotes: DrawerSecretNote[];
  visitorCount: number;
}

const DESK_STORAGE_KEY = "LOCAL_DESK_HOLE_DATA_V1";

export function getMyDeskData(): DeskHoleData {
  const raw = uni.getStorageSync(DESK_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {}
  }

  const initialData: DeskHoleData = {
    ownerId: "my_user_id",
    ownerName: "探索者小晨",
    ownerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
    theme: "wood",
    weather: "sunny",
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
        isMine: false
      },
      {
        id: "wn_2",
        authorId: "user_coser",
        authorName: "荧光喵喵 (Coser)",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        content: "悄悄在窗台贴一张手绘祈愿条：下周漫展天气大晴！🌸",
        color: "pink",
        createdAt: Date.now() - 1000 * 60 * 360,
        rotationDeg: 3,
        likes: 24,
        isMine: false
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
        isMine: true
      }
    ],
    diaryEntries: [
      {
        id: "diary_1",
        title: "晴朗秋日的街角随笔",
        content: "下午坐在窗前整理了上周在500米圈里收到的折纸小条。有人写了关于猫咪的奇妙偶遇，有人留下了刚出炉面包的香味。慢生活的确有独特的魔力。",
        dateStr: "11月12日 · 晴",
        locationName: "学院路街心花园",
        tag: "生活记忆",
        color: "yellow",
        paperTexture: "grid"
      },
      {
        id: "diary_2",
        title: "第一次收到火漆印小纸条",
        content: "红色的火漆封口很有仪式感，字数不多，但一笔一划都能感受到认真。这种需要等待几分钟才能飞到的信件，比冰冷的即时消息温暖百倍。",
        dateStr: "11月10日 · 微风",
        locationName: "阳光咖啡馆2楼",
        tag: "纸条回忆",
        color: "kraft",
        paperTexture: "lined"
      }
    ],
    drawerNotes: [
      {
        id: "drawer_1",
        senderName: "小夏 (精品咖啡师)",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        preview: "给你的桌洞塞了一份私密纸条，附带了一张手冲配方...",
        fullContent: "嗨！看到你在便签上写想喝浅烘手冲，特意把新烘培的耶加雪菲配方写给你：水温91℃，粉水比1:15，三段式注水。有机会来咖啡馆，给你尝这杯！",
        isSealed: true,
        receivedTime: "今天 08:30",
        read: false
      },
      {
        id: "drawer_2",
        senderName: "夜跑阿健",
        senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
        preview: "晚风很舒服，今晚在附近操场拉练5公里...",
        fullContent: "今天绕着社区夜跑，空气很棒，看到你的便签灯还亮着，给你留个加油纸条，坚持运动保持好心情！",
        isSealed: false,
        receivedTime: "昨天 21:40",
        read: true
      }
    ]
  };

  saveMyDeskData(initialData);
  return initialData;
}

export function saveMyDeskData(data: DeskHoleData): void {
  uni.setStorageSync(DESK_STORAGE_KEY, JSON.stringify(data));
}

export function getOtherUserDeskData(userId: string, name: string, avatar: string): DeskHoleData {
  return {
    ownerId: userId,
    ownerName: name,
    ownerAvatar: avatar,
    theme: "cherry",
    weather: "sunny",
    visitorCount: 356,
    windowNotes: [
      {
        id: "wn_other_1",
        authorId: userId,
        authorName: name,
        authorAvatar: avatar,
        content: "欢迎来到我的窗台桌洞！路过的朋友随时可以在窗户贴一张小便利贴哦～",
        color: "pink",
        createdAt: Date.now() - 1000 * 60 * 200,
        rotationDeg: 2,
        likes: 45,
        isMine: false
      },
      {
        id: "wn_other_2",
        authorId: "my_user_id",
        authorName: "探索者小晨",
        authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        content: "路过你的小桌洞，窗台的花草真好看！🌸",
        color: "green",
        createdAt: Date.now() - 1000 * 60 * 50,
        rotationDeg: -1,
        likes: 3,
        isMine: true
      }
    ],
    diaryEntries: [
      {
        id: "diary_other_1",
        title: "小镇手记",
        content: "把日常的美好折成纸条，送给同城有缘的人。",
        dateStr: "11月11日",
        locationName: "静谧书店",
        tag: "心情",
        color: "yellow",
        paperTexture: "grid"
      }
    ],
    drawerNotes: [],
  };
}

export function postWindowNote(
  targetUserId: string,
  content: string,
  color: NotePaperColor = "yellow"
): WindowNoteItem {
  const me = uni.getStorageSync("LOCAL_MAP_USER_PROFILE_V1");
  let myName = "探索者小晨";
  let myAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";
  if (me) {
    try {
      const p = JSON.parse(me);
      myName = p.name || myName;
      myAvatar = p.avatar || myAvatar;
    } catch (e) {}
  }

  const newNote: WindowNoteItem = {
    id: "wn_" + Date.now(),
    authorId: "my_user_id",
    authorName: myName,
    authorAvatar: myAvatar,
    content: content.slice(0, 70),
    color,
    createdAt: Date.now(),
    rotationDeg: Math.floor(Math.random() * 8) - 4,
    likes: 0,
    isMine: true
  };

  const desk = getMyDeskData();
  desk.windowNotes.unshift(newNote);
  saveMyDeskData(desk);

  return newNote;
}
