export interface Coordinates {
  latitude: number;
  longitude: number;
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
  showAcgnTab?: boolean; // 首页顶部是否展示「二次元」页签 (可自定义开启/隐藏)
  showRecommendTab?: boolean; // 首页顶部是否展示「推荐」页签
  constellation?: string; // 星座
  personalityTags?: string[]; // 性格标签
  mbti?: string;         // MBTI 人格
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
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  contentType: 'text' | 'image';
  createdAt: number;
}

export interface CommentItem {
  id: string;
  statusId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  replyToUserName?: string; // 微信朋友圈二级回复对象 (如 "婷婷 回复 咖啡老张:")
  images?: string[];       // 评论附带的照片，支持点击放大查看
  createdAt: number;
  authorProfile?: UserProfile;
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
  likes?: string[]; // 点赞用户昵称列表，用于朋友圈互动展示
  isHelp?: boolean;                  // 是否为求助帖 (普通help或救命help)
  isEmergency?: boolean;             // 是否为救命HELP (标红标大)
  helpResolved?: boolean;            // 问题是否已解决 (由发起人关闭)
  helpResolvedTime?: number;         // 解决关闭时间戳 (用于2小时后提示自动消失)
  helpContactPhone?: string;         // 紧急求助联系电话
  isAcgn?: boolean;                  // 是否标注为二次元动态 (ACGN / 二次元同好)
  acgnTag?: string;                  // 二次元细分子标签 (如 Cosplay / 谷子市集 / 漫展打卡 / 番剧安利)
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


