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
