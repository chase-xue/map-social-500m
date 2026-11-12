export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type NotePaperColor = 'yellow' | 'pink' | 'blue' | 'green' | 'kraft';

export type DeskTheme = 'wood' | 'cherry' | 'retro' | 'modern';

export type GradeLevel = '幼儿园' | '小学生' | '初中生' | '高中生' | '大学生' | '老教授';

export interface UserGrowth {
  grade: GradeLevel;
  title: string;           // 如 "课堂捣蛋鬼", "传纸条课代表"
  experience: number;
  coins: number;           // 慢纸条慢币
  ownedSeals: string[];    // 拥有的特权火漆印章外观 (如 "古铜月相印", "玫瑰金猫爪印", "欧式皇家徽印")
  activeSeal: string;      // 当前佩戴印章
  ownedPapers: string[];   // 拥有的特权信纸外观 (如 "京都和纸", "星空流光纸", "羊皮手账卷")
  activePaper: string;     // 当前使用信纸
  charExpandCards: number; // 70字长信纸扩充包
  activeTheme: DeskTheme;
  ownedThemes: DeskTheme[];
  speedTickets?: number;   // 已彻底废弃(砍掉反人类提速，坚守纯粹慢节奏)
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  gender: '男' | '女' | '保密';
  age: number;
  bio: string;
  phone?: string;        // 绑定的手机号
  showPhone?: boolean;   // 是否向附近500米内他人公开展示手机号
  showAcgnTab?: boolean; // 首页顶部是否展示「二次元」页签
  showRecommendTab?: boolean; // 首页顶部是否展示「推荐」页签
  constellation?: string; // 星座
  personalityTags?: string[]; // 性格标签
  mbti?: string;         // MBTI 人格
  growth?: UserGrowth;   // 学级成长体系
}

export interface FriendItem {
  userId: string;
  name: string;
  avatar: string;
  gender?: '男' | '女' | '保密';
  age?: number;
  bio?: string;
  phone?: string;
  status: 'pending' | 'accepted'; // 待通过 / 已成为好友
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount?: number;
  distanceMeters?: number;       // 与我的物理距离 (米)
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  contentType: 'text' | 'image';
  createdAt: number;
  // 小纸条慢聊天特性
  isSealed?: boolean;            // 火漆印私密纸条
  isAccelerated?: boolean;       // 是否已被加速
  distanceMeters?: number;       // 发送时的物理距离
  flightDurationSeconds?: number;// 传递所需总秒数
  deliveredAt?: number;          // 预计或实际送达时间戳
  isDelivered?: boolean;         // 是否已到达
  flightProgress?: number;       // 0~100 飞行进度
  currentFlyLocation?: string;   // 航迹描述 (如 "正飞跃海淀黄庄...")
  passByUsers?: string[];        // 途经中转路人印记
  sketchMode?: boolean;          // 配图素描滤镜
}

export interface CommentItem {
  id: string;
  statusId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  replyToUserName?: string;
  images?: string[];
  createdAt: number;
  authorProfile?: UserProfile;
  isLocalReply?: boolean;        // 500m 内现场回复 vs 远程回复
}

export interface LocationCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  firstStatus: StatusItem;
  statuses: StatusItem[];
  distance?: number;
}

export interface StatusItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  latitude: number;
  longitude: number;
  content: string;
  images: string[];
  createdAt: number;
  distance?: number;
  comments: CommentItem[];
  authorProfile?: UserProfile;
  likes?: string[];
  isHelp?: boolean;
  isEmergency?: boolean;
  helpResolved?: boolean;
  helpResolvedTime?: number;
  helpContactPhone?: string;
  isAcgn?: boolean;
  acgnTag?: string;
  // 小纸条/小便签新增特性
  paperColor?: NotePaperColor;   // 便签纸张颜色
  paperTag?: '闲聊' | '小告示' | '商户优惠' | '求助' | '回忆录' | '同好';
  isMerchant?: boolean;          // 是否为本地商户便签
  merchantDiscount?: string;     // 商户专属福利/优惠打卡
}

export interface MapMarker {
  id: number;
  latitude: number;
  longitude: number;
  title?: string;
  iconPath: string;
  width: number;
  height: number;
  callout?: {
    content: string;
    color?: string;
    fontSize?: number;
    borderRadius?: number;
    bgColor?: string;
    padding?: number;
    display?: 'ALWAYS' | 'BYCLICK';
    textAlign?: 'center' | 'left' | 'right';
  };
}

export interface MapCircle {
  latitude: number;
  longitude: number;
  radius: number;
  color: string;
  fillColor: string;
  strokeWidth: number;
}

export interface SponsoredAdItem {
  id: string;
  brandName: string;
  brandAvatar: string;
  tag: string;
  title: string;
  content: string;
  images: string[];
  actionText: string;
  phone?: string;
  likesCount: number;
}

export interface AiMatchFilter {
  gender: 'all' | '女' | '男';
  ageRange: 'all' | '18-24' | '25-30' | '31+';
  constellation: string;
  personalityMode: 'same' | 'complement';
  personalityTags: string[];
  customDesc?: string;
}

export interface AiMatchUserResult {
  userId: string;
  userName: string;
  userAvatar: string;
  gender: '男' | '女' | '保密';
  age: number;
  constellation: string;
  personalityTags: string[];
  mbti?: string;
  distance?: number;
  matchScore: number;
  matchHighlight: string;
  aiReason: string;
  icebreaker: string;
  isFriend?: boolean;
  applied?: boolean;
}

export interface DriftBottleReply {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: number;
}

export interface DriftBottleItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  tag: string;
  createdAt: number;
  distanceMeters: number;
  bottleType: number; // 1~5
  replies?: DriftBottleReply[];
  isMine?: boolean;
}


