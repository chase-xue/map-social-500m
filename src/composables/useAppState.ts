import { ref, computed } from "vue";
import {
  StatusItem,
  Coordinates,
  MapMarker,
  MapCircle,
  UserProfile,
  CommentItem,
  FriendItem,
  ChatMessage,
  LocationCluster,
} from "../types";
import {
  filterStatusesWithinRange,
  formatRelativeTime,
  createOffsetCoordinates,
  clusterStatusesByLocation,
} from "../services/geo";
import {
  readLocalData,
  writeLocalData,
  addNewStatus,
  addCommentToStatus,
  ensureInitialMockData,
  saveLocalImageFile,
  getUserProfile,
  saveUserProfile,
  getFriendsList,
  saveFriendsList,
  sendFriendRequest,
  acceptFriendRequest,
  getChatMessages,
  sendChatMessage,
  toggleStatusLike,
} from "../services/storage";

// ============ Z-Index 分层常量 ============
export const Z_INDEX = {
  CONTENT: 10,       // 地图/朋友圈内容层
  CONTROLS: 40,      // 悬浮控制按钮
  TOP_NAV: 50,       // 顶部导航
  MODAL_MASK: 100,   // 弹窗遮罩
  SHEET: 110,        // 底部抽屉 (详情/发布/资料/好友/聚合)
  CHAT: 150,         // 聊天窗口 (最高频交互)
  USER_CARD: 200,    // 用户资料卡 (最顶层弹窗)
} as const;

// ============ 系统状态 ============
const statusBarHeight = ref(44);
const mapScale = ref(16);

// ============ 位置与地图 ============
const userLocation = ref<Coordinates>({ latitude: 39.9087, longitude: 116.3975 });
const mapCenter = ref<Coordinates>({ latitude: 39.9087, longitude: 116.3975 });

// ============ 模块切换 ============
const activeTab = ref<"map" | "moments">("map");

// ============ 我的资料 ============
const myProfile = ref<UserProfile>(getUserProfile());
const editingProfile = ref<UserProfile>({ ...myProfile.value });
const myProfileVisible = ref(false);

// ============ 查看他人资料卡 ============
const userCardVisible = ref(false);
const viewingProfile = ref<UserProfile | null>(null);
const viewingDistance = ref<number | undefined>(undefined);

// ============ 状态数据 ============
const allStatuses = ref<StatusItem[]>([]);

const visibleStatuses = computed(() =>
  filterStatusesWithinRange(userLocation.value, allStatuses.value, 500)
);

const locationClusters = computed(() =>
  clusterStatusesByLocation(visibleStatuses.value, 35)
);

// 朋友圈模式：按发布时间倒序
const sortedMomentsStatuses = computed(() =>
  [...visibleStatuses.value].sort((a, b) => b.createdAt - a.createdAt)
);

// ============ 聚合抽屉 ============
const clusterVisible = ref(false);
const activeCluster = ref<LocationCluster | null>(null);

// ============ 详情抽屉 ============
const detailVisible = ref(false);
const activeStatus = ref<StatusItem | null>(null);
const newCommentText = ref("");
const pickedCommentImage = ref("");

// 评论角色
const commentRoleOptions = ["👤 我自己", "🙋 附近路人 (小林)", "☕ 咖啡店老板", "🏃 晨跑团友"];
const selectedRoleIndex = ref(0);

// ============ 发布抽屉 ============
const publishVisible = ref(false);
const newPostContent = ref("");
const pickedImages = ref<string[]>([]);
const isPublishing = ref(false);

// ============ 好友与私聊 ============
const friendsSheetVisible = ref(false);
const friendsList = ref<FriendItem[]>([]);
const pendingFriendsCount = computed(() =>
  friendsList.value.filter((f) => f.status === "pending").length
);
const currentChatFriend = ref<FriendItem | null>(null);
const currentChatMessages = ref<ChatMessage[]>([]);
const newChatMessageText = ref("");
const chatSheetVisible = ref(false);
const chatScrollTop = ref(0);

// ============ 500m 覆盖圈 ============
const mapCircles = computed<MapCircle[]>(() => [
  {
    latitude: userLocation.value.latitude,
    longitude: userLocation.value.longitude,
    radius: 500,
    color: "#6366F1AA",
    fillColor: "#6366F120",
    strokeWidth: 2,
  },
]);

// ============ 地图 Markers ============
const mapMarkers = computed<MapMarker[]>(() => {
  const list: MapMarker[] = [];

  // 用户本人位置
  list.push({
    id: 999999,
    latitude: userLocation.value.latitude,
    longitude: userLocation.value.longitude,
    iconPath: "/static/icons/user.png",
    width: 28,
    height: 28,
    callout: {
      content: `${myProfile.value.name} (500m中心)`,
      color: "#4338CA",
      fontSize: 11,
      borderRadius: 12,
      bgColor: "#FFFFFF",
      padding: 6,
      display: "ALWAYS",
      textAlign: "center",
    },
  });

  // 状态点 (同地点聚合)
  locationClusters.value.forEach((cluster, index) => {
    const firstItem = cluster.firstStatus;
    const isCluster = cluster.count > 1;
    const isMyStatus = firstItem.userId === myProfile.value.id;
    const hasImg = firstItem.images?.length ? " 📷" : "";
    const brief = firstItem.content.length > 10
      ? firstItem.content.slice(0, 10) + "..."
      : firstItem.content;

    let calloutContent = "";
    if (isCluster) {
      calloutContent = `🔥 [首图] ${firstItem.userName}等 · 共${cluster.count}条状态\n📍 ${brief} (点击查看)`;
    } else {
      const cmtCount = firstItem.comments?.length ? ` [💬${firstItem.comments.length}]` : "";
      calloutContent = isMyStatus
        ? `⭐我发的 (${firstItem.distance}m)${hasImg}${cmtCount}\n${brief}`
        : `${firstItem.userName} (${firstItem.distance}m)${hasImg}${cmtCount}\n${brief}`;
    }

    list.push({
      id: index + 1,
      latitude: cluster.latitude,
      longitude: cluster.longitude,
      iconPath: "/static/icons/pin.png",
      width: isCluster ? 36 : isMyStatus ? 32 : 28,
      height: isCluster ? 36 : isMyStatus ? 32 : 28,
      callout: {
        content: calloutContent,
        color: isCluster ? "#4338CA" : isMyStatus ? "#9A3412" : "#1E293B",
        fontSize: 11,
        borderRadius: 10,
        bgColor: isCluster ? "#EEF2FFEE" : isMyStatus ? "#FFFBEBEE" : "#FFFFFFEE",
        padding: 6,
        display: "ALWAYS",
        textAlign: "center",
      },
    });
  });

  return list;
});

// ============ 初始化 ============
function initApp() {
  getSystemInfo();
  myProfile.value = getUserProfile();
  friendsList.value = getFriendsList();
  initGeolocation();
}

function getSystemInfo() {
  try {
    const info = uni.getSystemInfoSync();
    if (info.statusBarHeight) statusBarHeight.value = info.statusBarHeight;
  } catch (e) {
    console.warn("获取系统信息失败", e);
  }
}

function initGeolocation() {
  uni.getLocation({
    type: "gcj02",
    isHighAccuracy: true,
    success: (res) => {
      userLocation.value = { latitude: res.latitude, longitude: res.longitude };
      mapCenter.value = { latitude: res.latitude, longitude: res.longitude };
      allStatuses.value = ensureInitialMockData(userLocation.value);
    },
    fail: () => {
      allStatuses.value = ensureInitialMockData(userLocation.value);
    },
  });
}

// ============ 地图操作 ============
function recenterToUser() {
  mapCenter.value = { ...userLocation.value };
  uni.showToast({ title: "已回到中心位置", icon: "none" });
}

function refreshNearbyStatuses() {
  allStatuses.value = readLocalData();
  uni.showToast({ title: `周边 500m 内共 ${visibleStatuses.value.length} 条动态`, icon: "none" });
}

function simulateUserMove() {
  userLocation.value = {
    latitude: userLocation.value.latitude + (Math.random() - 0.5) * 0.005,
    longitude: userLocation.value.longitude + (Math.random() - 0.5) * 0.005,
  };
  mapCenter.value = { ...userLocation.value };
  uni.showToast({ title: `走动模拟：当前可见 ${visibleStatuses.value.length} 条`, icon: "none" });
}

// ============ Marker 点击 ============
function onMarkerTap(e: any) {
  const markerId = e.detail.markerId;
  if (markerId === 999999) {
    openUserProfileCard(myProfile.value, 0);
    return;
  }
  const cluster = locationClusters.value[markerId - 1];
  if (!cluster) return;
  if (cluster.count > 1) {
    openClusterSheet(cluster);
  } else {
    openDetailSheet(cluster.firstStatus);
  }
}

// ============ 聚合抽屉 ============
function openClusterSheet(cluster: LocationCluster) {
  activeCluster.value = cluster;
  clusterVisible.value = true;
}

function closeClusterSheet() {
  clusterVisible.value = false;
  activeCluster.value = null;
}

function jumpToMomentsFromCluster() {
  closeClusterSheet();
  activeTab.value = "moments";
  uni.showToast({ title: `已跳转朋友圈，浏览共 ${visibleStatuses.value.length} 条动态`, icon: "none" });
}

// ============ 详情抽屉 ============
function openDetailSheet(item: StatusItem) {
  activeStatus.value = item;
  detailVisible.value = true;
  newCommentText.value = "";
  pickedCommentImage.value = "";
}

function closeDetailSheet() {
  detailVisible.value = false;
  activeStatus.value = null;
  pickedCommentImage.value = "";
}

// ============ 评论操作 ============
function chooseCommentImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      const path = res.tempFilePaths[0];
      if (path) {
        pickedCommentImage.value = await saveLocalImageFile(path);
        uni.showToast({ title: "已添加评论配图", icon: "none" });
      }
    },
  });
}

function usePresetCommentImage() {
  pickedCommentImage.value = "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80";
  uni.showToast({ title: "已添加示例配图", icon: "none" });
}

function removeCommentImage() {
  pickedCommentImage.value = "";
}

function onRoleChange(e: any) {
  selectedRoleIndex.value = e.detail.value;
}

function handleSendComment() {
  const content = newCommentText.value.trim();
  if ((!content && !pickedCommentImage.value) || !activeStatus.value) return;

  const roleName = commentRoleOptions[selectedRoleIndex.value];
  const isSelf = selectedRoleIndex.value === 0;

  const newComment = addCommentToStatus(activeStatus.value.id, {
    userId: isSelf ? myProfile.value.id : "stranger_" + Date.now(),
    userName: isSelf ? myProfile.value.name : roleName,
    userAvatar: isSelf ? myProfile.value.avatar : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    content: content || "分享了配图",
    images: pickedCommentImage.value ? [pickedCommentImage.value] : [],
    authorProfile: isSelf ? myProfile.value : {
      id: "stranger_" + Date.now(),
      name: roleName,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      gender: "男",
      age: 26,
      bio: "附近500米热心邻友",
    },
  });

  if (newComment) {
    allStatuses.value = readLocalData();
    activeStatus.value = allStatuses.value.find((s) => s.id === activeStatus.value?.id) || null;
    newCommentText.value = "";
    pickedCommentImage.value = "";
    uni.showToast({ title: "评价已发布！", icon: "success" });
  }
}

function triggerMockStrangerComment() {
  if (!activeStatus.value) return;
  const mockQuotes = [
    { text: "拍得真好看！我也在附近～", user: "附近邻友小晴", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80", gender: "女" as const, age: 23, bio: "热爱生活，发现身边的美好🌸" },
    { text: "环境太赞了，改天去逛逛！", user: "骑行阿健", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", gender: "男" as const, age: 27, bio: "周末常在附近河堤骑行🚲" },
    { text: "阳光真好，分享得很及时！", user: "街角大叔", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", gender: "男" as const, age: 38, bio: "散步摄影随拍📷" },
  ];
  const pick = mockQuotes[Math.floor(Math.random() * mockQuotes.length)];

  addCommentToStatus(activeStatus.value.id, {
    userId: "stranger_" + Date.now(),
    userName: pick.user,
    userAvatar: pick.avatar,
    content: pick.text,
    authorProfile: { id: "stranger_" + Date.now(), name: pick.user, avatar: pick.avatar, gender: pick.gender, age: pick.age, bio: pick.bio },
  });

  allStatuses.value = readLocalData();
  activeStatus.value = allStatuses.value.find((s) => s.id === activeStatus.value?.id) || null;
  uni.showToast({ title: "收到一条路人新评价！", icon: "success" });
}

// ============ 我的资料 ============
function openMyProfileSheet() {
  editingProfile.value = { ...myProfile.value };
  myProfileVisible.value = true;
}

function closeMyProfileSheet() {
  myProfileVisible.value = false;
}

function chooseNewAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      const path = res.tempFilePaths[0];
      if (path) {
        editingProfile.value.avatar = await saveLocalImageFile(path);
        uni.showToast({ title: "头像已选择", icon: "none" });
      }
    },
  });
}

function saveMyProfile() {
  if (!editingProfile.value.name.trim()) {
    uni.showToast({ title: "请填写昵称", icon: "none" });
    return;
  }
  saveUserProfile(editingProfile.value);
  myProfile.value = { ...editingProfile.value };
  closeMyProfileSheet();
  uni.showToast({ title: "资料保存成功！", icon: "success" });
}

function onPhonePrivacyChange(e: any) {
  editingProfile.value.showPhone = e.detail.value;
}

// ============ 查看他人资料卡 ============
function viewAuthorProfile(status: StatusItem | null) {
  if (!status) return;
  const profile: UserProfile = status.authorProfile || {
    id: status.userId, name: status.userName, avatar: status.userAvatar,
    gender: "保密", age: 24, bio: "身处周边500米生活圈",
  };
  openUserProfileCard(profile, status.distance);
}

function viewCommenterProfile(cmt: CommentItem) {
  const profile: UserProfile = cmt.authorProfile || {
    id: cmt.userId, name: cmt.userName, avatar: cmt.userAvatar,
    gender: "保密", age: 22, bio: "积极互动的好邻友",
  };
  openUserProfileCard(profile);
}

function openUserProfileCard(profile: UserProfile, distance?: number) {
  viewingProfile.value = profile;
  viewingDistance.value = distance;
  userCardVisible.value = true;
}

function closeUserCard() {
  userCardVisible.value = false;
  viewingProfile.value = null;
}

function makePhoneCall(phoneNumber?: string) {
  if (!phoneNumber) return;
  uni.makePhoneCall({ phoneNumber, fail: () => {} });
}

// ============ 点赞 ============
function toggleLikeStatus(item: StatusItem) {
  const isLiked = toggleStatusLike(item.id, myProfile.value.name);
  allStatuses.value = readLocalData();
  uni.showToast({ title: isLiked ? "❤️ 点赞成功！" : "已取消点赞", icon: "none" });
}

// ============ 好友 ============
function openFriendsSheet() {
  friendsList.value = getFriendsList();
  friendsSheetVisible.value = true;
}

function closeFriendsSheet() {
  friendsSheetVisible.value = false;
}

function isFriend(userId?: string): boolean {
  if (!userId) return false;
  return friendsList.value.some((f) => f.userId === userId && f.status === "accepted");
}

function isFriendPending(userId?: string): boolean {
  if (!userId) return false;
  return friendsList.value.some((f) => f.userId === userId && f.status === "pending");
}

function handleAddFriend(target: UserProfile | null) {
  if (!target) return;
  const res = sendFriendRequest(target);
  if (res.success) {
    uni.showToast({ title: res.msg, icon: "success" });
    friendsList.value = getFriendsList();
  } else {
    uni.showToast({ title: res.msg, icon: "none" });
  }
}

function handleAcceptFriend(targetUserId: string) {
  const ok = acceptFriendRequest(targetUserId);
  if (ok) {
    uni.showToast({ title: "已通过好友申请！现在可以私聊啦", icon: "success" });
    friendsList.value = getFriendsList();
  }
}

function startChatFromCard(target: UserProfile | null) {
  if (!target) return;
  const f = friendsList.value.find((item) => item.userId === target.id);
  if (f) {
    closeUserCard();
    openChatSheet(f);
  }
}

function acceptFriendFromCard(userId?: string) {
  if (!userId) return;
  handleAcceptFriend(userId);
  const f = friendsList.value.find((item) => item.userId === userId);
  if (f) {
    closeUserCard();
    openChatSheet(f);
  }
}

// ============ 私聊 ============
function openChatSheet(friend: FriendItem) {
  currentChatFriend.value = friend;
  currentChatMessages.value = getChatMessages(friend.userId);
  chatSheetVisible.value = true;
  chatScrollTop.value = 999999;
}

function closeChatSheet() {
  chatSheetVisible.value = false;
  currentChatFriend.value = null;
}

function sendCurrentChatMessage() {
  const text = newChatMessageText.value.trim();
  if (!text || !currentChatFriend.value) return;
  const friendId = currentChatFriend.value.userId;
  const msg = sendChatMessage(friendId, text);
  currentChatMessages.value.push(msg);
  newChatMessageText.value = "";
  chatScrollTop.value = 999999 + Math.random();

  setTimeout(() => {
    if (chatSheetVisible.value && currentChatFriend.value?.userId === friendId) {
      const replies = ["收到啦！我刚好在附近～☕", "好呀，周边500米相遇很有缘分！", "今天天气很不错，随时联系！", "哈哈太巧了，我也刚在附近散步！"];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      const replyMsg = sendChatMessage(friendId, replyText, "text", friendId);
      currentChatMessages.value.push(replyMsg);
      chatScrollTop.value = 999999 + Math.random();
    }
  }, 1200);
}

// ============ 发布 ============
function openPublishSheet() {
  publishVisible.value = true;
  newPostContent.value = "";
  pickedImages.value = [];
}

function closePublishSheet() {
  publishVisible.value = false;
}

function chooseImages() {
  const count = 3 - pickedImages.value.length;
  if (count <= 0) return;
  uni.chooseImage({
    count,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      if (res.tempFilePaths?.length) {
        pickedImages.value = [...pickedImages.value, ...res.tempFilePaths];
      }
    },
  });
}

function usePresetImage() {
  pickedImages.value = ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80"];
  uni.showToast({ title: "已添加示例美图", icon: "none" });
}

function removePickedImage(idx: number) {
  pickedImages.value.splice(idx, 1);
}

async function submitNewPost() {
  const content = newPostContent.value.trim();
  if (!content && pickedImages.value.length === 0) {
    uni.showToast({ title: "请填写文字或添加图片", icon: "none" });
    return;
  }
  isPublishing.value = true;
  try {
    const savedPaths: string[] = [];
    for (const p of pickedImages.value) {
      savedPaths.push(await saveLocalImageFile(p));
    }
    const offsetPos = createOffsetCoordinates(userLocation.value, 15, Math.random() * 360);
    const created = addNewStatus({
      userId: myProfile.value.id,
      userName: myProfile.value.name,
      userAvatar: myProfile.value.avatar,
      latitude: offsetPos.latitude,
      longitude: offsetPos.longitude,
      content: content || "分享了此地的风景",
      images: savedPaths,
      authorProfile: { ...myProfile.value },
    });
    allStatuses.value = readLocalData();
    closePublishSheet();
    uni.showToast({ title: "发布成功！已在地图打点", icon: "success" });
    setTimeout(() => {
      const latest = visibleStatuses.value.find((s) => s.id === created.id);
      if (latest) openDetailSheet(latest);
    }, 400);
  } catch (err) {
    console.error("发布失败:", err);
    uni.showToast({ title: "保存异常，请重试", icon: "none" });
  } finally {
    isPublishing.value = false;
  }
}

// ============ 通用工具 ============
function previewImage(current: string, urls: string[]) {
  uni.previewImage({ current, urls });
}

function formatTime(timestamp: number) {
  return formatRelativeTime(timestamp);
}

// ============ 导出 ============
export function useAppState() {
  return {
    // Z-Index
    Z_INDEX,
    // 系统
    statusBarHeight, mapScale,
    // 位置
    userLocation, mapCenter,
    // 模块
    activeTab,
    // 我的资料
    myProfile, editingProfile, myProfileVisible,
    openMyProfileSheet, closeMyProfileSheet, chooseNewAvatar, saveMyProfile, onPhonePrivacyChange,
    // 他人资料卡
    userCardVisible, viewingProfile, viewingDistance,
    openUserProfileCard, closeUserCard, viewAuthorProfile, viewCommenterProfile, makePhoneCall,
    // 状态
    allStatuses, visibleStatuses, locationClusters, sortedMomentsStatuses,
    // 地图
    mapCircles, mapMarkers, onMarkerTap, onCalloutTap: onMarkerTap, onRegionChange: () => {},
    recenterToUser, refreshNearbyStatuses, simulateUserMove,
    // 聚合
    clusterVisible, activeCluster, openClusterSheet, closeClusterSheet, jumpToMomentsFromCluster,
    // 详情
    detailVisible, activeStatus, newCommentText, pickedCommentImage,
    openDetailSheet, closeDetailSheet,
    commentRoleOptions, selectedRoleIndex, onRoleChange,
    chooseCommentImage, usePresetCommentImage, removeCommentImage,
    handleSendComment, triggerMockStrangerComment,
    // 发布
    publishVisible, newPostContent, pickedImages, isPublishing,
    openPublishSheet, closePublishSheet, chooseImages, usePresetImage, removePickedImage, submitNewPost,
    // 好友
    friendsSheetVisible, friendsList, pendingFriendsCount,
    openFriendsSheet, closeFriendsSheet, isFriend, isFriendPending,
    handleAddFriend, handleAcceptFriend, startChatFromCard, acceptFriendFromCard,
    // 私聊
    chatSheetVisible, currentChatFriend, currentChatMessages, newChatMessageText, chatScrollTop,
    openChatSheet, closeChatSheet, sendCurrentChatMessage,
    // 点赞
    toggleLikeStatus,
    // 工具
    previewImage, formatTime,
    // 初始化
    initApp,
  };
}
