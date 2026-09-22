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
  resolveHelpStatus,
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
const statusBarHeight = ref(0);
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

// ============ 发布抽屉 ============
const publishVisible = ref(false);
const newPostContent = ref("");
const pickedImages = ref<string[]>([]);
const isPublishing = ref(false);

// ============ HELP 求助 ============
const helpSheetVisible = ref(false);
const isEmergencyHelp = ref(false); // false: 普通急事help, true: 救命help (标红标大)
const newHelpContent = ref("");
const helpContactPhone = ref("");
const pickedHelpImages = ref<string[]>([]);
const isHelpSubmitting = ref(false);

// 全局活跃求助
const activeHelpStatuses = computed(() =>
  visibleStatuses.value.filter((s) => s.isHelp && !s.helpResolved)
);
const hasActiveEmergency = computed(() =>
  activeHelpStatuses.value.some((s) => s.isEmergency)
);

// 我发起的活跃求助 (用于顶部快捷气泡/胶囊，点击一键直达，无需在地图盲目寻找)
const myActiveHelp = computed(() =>
  allStatuses.value.find((s) => s.isHelp && !s.helpResolved && s.userId === myProfile.value.id) || null
);

// 我发起的求助历史记录
const myHelpHistory = computed(() =>
  allStatuses.value.filter((s) => s.isHelp && s.userId === myProfile.value.id)
);

// 判断“已解决”状态卡片是否在2小时显示窗口内 (关闭后满2小时自动消失)
function isHelpResolvedPromptVisible(status?: StatusItem | null): boolean {
  if (!status || !status.isHelp) return false;
  if (!status.helpResolved) return true; // 未解决时正常显示
  const resolvedAt = status.helpResolvedTime || status.createdAt;
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
  return Date.now() - resolvedAt <= TWO_HOURS_MS;
}

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

// ============ 500m 覆盖圈与紧急警报圈 ============
const mapCircles = computed<MapCircle[]>(() => {
  const circles: MapCircle[] = [
    {
      latitude: userLocation.value.latitude,
      longitude: userLocation.value.longitude,
      radius: 500,
      color: "#6366F1",
      fillColor: "#6366F115",
      strokeWidth: 2,
    },
  ];

  // 为每个未解决的救命求助点添加红色紧急光圈
  activeHelpStatuses.value.forEach((h) => {
    if (h.isEmergency) {
      circles.push({
        latitude: h.latitude,
        longitude: h.longitude,
        radius: 90,
        color: "#EF4444",
        fillColor: "#EF444430",
        strokeWidth: 3,
      });
    }
  });

  return circles;
});

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
    const isUnresolvedHelp = firstItem.isHelp && !firstItem.helpResolved;
    const isEmergency = isUnresolvedHelp && firstItem.isEmergency;
    const isNormalHelp = isUnresolvedHelp && !firstItem.isEmergency;
    const isResolvedHelp = firstItem.isHelp && firstItem.helpResolved;

    const hasImg = firstItem.images?.length ? " 📷" : "";
    const brief = firstItem.content.length > 12
      ? firstItem.content.slice(0, 12) + "..."
      : firstItem.content;

    let calloutContent = "";
    let calloutBg = "#FFFFFFEE";
    let calloutColor = "#1E293B";
    let calloutFontSize = 11;
    let markerWidth = isCluster ? 36 : isMyStatus ? 32 : 28;

    if (isEmergency) {
      // 救命 HELP：标红标大
      markerWidth = 48;
      calloutBg = "#EF4444";
      calloutColor = "#FFFFFF";
      calloutFontSize = 13;
      calloutContent = `🚨 救命HELP (${firstItem.distance}m) 🚨\n${firstItem.userName}: ${brief}\n[紧急呼救·点击施救]`;
    } else if (isNormalHelp) {
      // 普通 HELP：橙色醒目标记
      markerWidth = 38;
      calloutBg = "#F59E0B";
      calloutColor = "#FFFFFF";
      calloutFontSize = 12;
      calloutContent = `🆘 急事求助 (${firstItem.distance}m)\n${firstItem.userName}: ${brief}\n[点击查看求助]`;
    } else if (isResolvedHelp) {
      // 已解决求助
      calloutContent = `✅ [求助已解决] ${firstItem.userName} (${firstItem.distance}m)\n${brief}`;
      calloutColor = "#059669";
      calloutBg = "#ECFDF5EE";
    } else if (isCluster) {
      calloutBg = "#EEF2FFEE";
      calloutColor = "#4338CA";
      calloutContent = `🔥 [首图] ${firstItem.userName}等 · 共${cluster.count}条状态\n📍 ${brief} (点击查看)`;
    } else {
      const cmtCount = firstItem.comments?.length ? ` [💬${firstItem.comments.length}]` : "";
      calloutBg = isMyStatus ? "#FFFBEBEE" : "#FFFFFFEE";
      calloutColor = isMyStatus ? "#9A3412" : "#1E293B";
      calloutContent = isMyStatus
        ? `⭐我发的 (${firstItem.distance}m)${hasImg}${cmtCount}\n${brief}`
        : `${firstItem.userName} (${firstItem.distance}m)${hasImg}${cmtCount}\n${brief}`;
    }

    list.push({
      id: index + 1,
      latitude: cluster.latitude,
      longitude: cluster.longitude,
      iconPath: "/static/icons/pin.png",
      width: markerWidth,
      height: markerWidth,
      callout: {
        content: calloutContent,
        color: calloutColor,
        fontSize: calloutFontSize,
        borderRadius: isEmergency ? 14 : 10,
        bgColor: calloutBg,
        padding: isEmergency ? 8 : 6,
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
    // #ifdef H5
    statusBarHeight.value = 0;
    // #endif
    // #ifndef H5
    statusBarHeight.value = info.statusBarHeight || 0;
    // #endif
  } catch (e) {
    statusBarHeight.value = 0;
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

// 记录弹窗打开时间戳，用于防御移动端 300ms 合成点击产生的点透穿透 (Ghost Click / 闪屏关闭)
let lastModalOpenTime = 0;

// ============ Marker & Callout 点击 ============
function onMarkerTap(e: any) {
  const markerId = Number(e?.detail?.markerId ?? e?.markerId);
  if (isNaN(markerId) || markerId === 0) return;

  if (markerId === 999999) {
    // 点击本人位置标记 (999999)：
    // 优先检查我是否发布过状态，如果是，直接打开我最新的状态详情进行查看与互动
    const myLatestStatus = allStatuses.value.find((s) => s.userId === myProfile.value.id);
    if (myLatestStatus) {
      openDetailSheet(myLatestStatus);
    } else {
      openUserProfileCard(myProfile.value, 0);
    }
    return;
  }

  const cluster = locationClusters.value[markerId - 1];
  if (!cluster) {
    const fallback = visibleStatuses.value.find((s, idx) => idx + 1 === markerId);
    if (fallback) {
      openDetailSheet(fallback);
    }
    return;
  }

  if (cluster.count > 1) {
    openClusterSheet(cluster);
  } else {
    openDetailSheet(cluster.firstStatus);
  }
}

function onCalloutTap(e: any) {
  onMarkerTap(e);
}

// ============ 聚合抽屉 ============
function openClusterSheet(cluster: LocationCluster) {
  lastModalOpenTime = Date.now();
  activeCluster.value = cluster;
  clusterVisible.value = true;
}

function closeClusterSheet(force = false) {
  if (!force && Date.now() - lastModalOpenTime < 450) return;
  clusterVisible.value = false;
  activeCluster.value = null;
}

function jumpToMomentsFromCluster() {
  closeClusterSheet(true);
  activeTab.value = "moments";
  uni.showToast({ title: `已跳转朋友圈，浏览共 ${visibleStatuses.value.length} 条动态`, icon: "none" });
}

// ============ 详情抽屉 ============
function openDetailSheet(item: StatusItem) {
  lastModalOpenTime = Date.now();
  activeStatus.value = item;
  detailVisible.value = true;
  newCommentText.value = "";
  pickedCommentImage.value = "";
}

function closeDetailSheet(force = false) {
  if (!force && Date.now() - lastModalOpenTime < 450) return;
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

function removeCommentImage() {
  pickedCommentImage.value = "";
}

function handleSendComment() {
  const content = newCommentText.value.trim();
  if ((!content && !pickedCommentImage.value) || !activeStatus.value) return;

  const newComment = addCommentToStatus(activeStatus.value.id, {
    userId: myProfile.value.id,
    userName: myProfile.value.name,
    userAvatar: myProfile.value.avatar,
    content: content || "分享了配图",
    images: pickedCommentImage.value ? [pickedCommentImage.value] : [],
    authorProfile: { ...myProfile.value },
  });

  if (newComment) {
    allStatuses.value = readLocalData();
    activeStatus.value = allStatuses.value.find((s) => s.id === activeStatus.value?.id) || null;
    newCommentText.value = "";
    pickedCommentImage.value = "";
    uni.showToast({ title: "评论成功！", icon: "success" });
  }
}

// ============ 我的资料 ============
function openMyProfileSheet() {
  lastModalOpenTime = Date.now();
  editingProfile.value = { ...myProfile.value };
  myProfileVisible.value = true;
}

function closeMyProfileSheet(force = false) {
  if (!force && Date.now() - lastModalOpenTime < 450) return;
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
  closeMyProfileSheet(true);
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
  lastModalOpenTime = Date.now();
  viewingProfile.value = profile;
  viewingDistance.value = distance;
  userCardVisible.value = true;
}

function closeUserCard(force = false) {
  if (!force && Date.now() - lastModalOpenTime < 450) return;
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
  lastModalOpenTime = Date.now();
  friendsList.value = getFriendsList();
  friendsSheetVisible.value = true;
}

function closeFriendsSheet(force = false) {
  if (!force && Date.now() - lastModalOpenTime < 450) return;
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
    closeUserCard(true);
    openChatSheet(f);
  }
}

function acceptFriendFromCard(userId?: string) {
  if (!userId) return;
  handleAcceptFriend(userId);
  const f = friendsList.value.find((item) => item.userId === userId);
  if (f) {
    closeUserCard(true);
    openChatSheet(f);
  }
}

// ============ 私聊 ============
function openChatSheet(friend: FriendItem) {
  lastModalOpenTime = Date.now();
  currentChatFriend.value = friend;
  currentChatMessages.value = getChatMessages(friend.userId);
  chatSheetVisible.value = true;
  chatScrollTop.value = 999999;
}

function closeChatSheet(force = false) {
  if (!force && Date.now() - lastModalOpenTime < 450) return;
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
  lastModalOpenTime = Date.now();
  publishVisible.value = true;
  newPostContent.value = "";
  pickedImages.value = [];
}

function closePublishSheet(force = false) {
  if (!force && Date.now() - lastModalOpenTime < 450) return;
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

// ============ HELP 求助操作 ============
function openHelpSheet(emergency = false) {
  lastModalOpenTime = Date.now();
  isEmergencyHelp.value = emergency;
  newHelpContent.value = "";
  helpContactPhone.value = myProfile.value.phone || "";
  pickedHelpImages.value = [];
  helpSheetVisible.value = true;
}

function closeHelpSheet(force = false) {
  if (!force && Date.now() - lastModalOpenTime < 450) return;
  helpSheetVisible.value = false;
}

function chooseHelpImages() {
  const count = 3 - pickedHelpImages.value.length;
  if (count <= 0) return;
  uni.chooseImage({
    count,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      if (res.tempFilePaths?.length) {
        pickedHelpImages.value = [...pickedHelpImages.value, ...res.tempFilePaths];
      }
    },
  });
}

function removePickedHelpImage(idx: number) {
  pickedHelpImages.value.splice(idx, 1);
}

async function submitHelpPost() {
  const content = newHelpContent.value.trim();
  if (!content) {
    uni.showToast({ title: "请简要描述求助情况", icon: "none" });
    return;
  }
  isHelpSubmitting.value = true;
  try {
    const savedPaths: string[] = [];
    for (const p of pickedHelpImages.value) {
      savedPaths.push(await saveLocalImageFile(p));
    }
    const offsetPos = createOffsetCoordinates(userLocation.value, 10, Math.random() * 360);
    const created = addNewStatus({
      userId: myProfile.value.id,
      userName: myProfile.value.name,
      userAvatar: myProfile.value.avatar,
      latitude: offsetPos.latitude,
      longitude: offsetPos.longitude,
      content: (isEmergencyHelp.value ? "【🚨救命紧急呼救】" : "【🆘急事求助】") + content,
      images: savedPaths,
      authorProfile: { ...myProfile.value },
      isHelp: true,
      isEmergency: isEmergencyHelp.value,
      helpResolved: false,
      helpContactPhone: helpContactPhone.value.trim() || myProfile.value.phone || "",
    });
    allStatuses.value = readLocalData();
    closeHelpSheet(true);
    uni.showToast({
      title: isEmergencyHelp.value ? "🚨 救命呼救已发出！全网标红播报" : "🆘 求助已发布！",
      icon: "none",
      duration: 2500,
    });
    setTimeout(() => {
      const latest = visibleStatuses.value.find((s) => s.id === created.id);
      if (latest) openDetailSheet(latest);
    }, 400);
  } catch (err) {
    console.error("求助发布失败:", err);
    uni.showToast({ title: "发布异常，请重试", icon: "none" });
  } finally {
    isHelpSubmitting.value = false;
  }
}

function handleCloseHelp(statusId: string) {
  uni.showModal({
    title: "确认关闭求助？",
    content: "确认此问题已得到解决？关闭后将解除全网求助标记与警报。",
    confirmText: "确认解决",
    confirmColor: "#10B981",
    success: (res) => {
      if (res.confirm) {
        const ok = resolveHelpStatus(statusId, myProfile.value.id);
        if (ok) {
          allStatuses.value = readLocalData();
          if (activeStatus.value && activeStatus.value.id === statusId) {
            activeStatus.value = allStatuses.value.find((s) => s.id === statusId) || null;
          }
          uni.showToast({ title: "✅ 求助已关闭，祝一切安好！", icon: "success" });
        } else {
          uni.showToast({ title: "仅发起人有权关闭该求助", icon: "none" });
        }
      }
    },
  });
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
    mapCircles, mapMarkers, onMarkerTap, onCalloutTap, onRegionChange: () => {},
    recenterToUser, refreshNearbyStatuses, simulateUserMove,
    // 聚合
    clusterVisible, activeCluster, openClusterSheet, closeClusterSheet, jumpToMomentsFromCluster,
    // 详情
    detailVisible, activeStatus, newCommentText, pickedCommentImage,
    openDetailSheet, closeDetailSheet,
    chooseCommentImage, removeCommentImage, handleSendComment,
    // 发布
    publishVisible, newPostContent, pickedImages, isPublishing,
    openPublishSheet, closePublishSheet, chooseImages, removePickedImage, submitNewPost,
    // HELP 求助
    helpSheetVisible, isEmergencyHelp, newHelpContent, helpContactPhone, pickedHelpImages, isHelpSubmitting,
    activeHelpStatuses, hasActiveEmergency, myActiveHelp, myHelpHistory, isHelpResolvedPromptVisible,
    openHelpSheet, closeHelpSheet, chooseHelpImages, removePickedHelpImage, submitHelpPost, handleCloseHelp,
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
