<template>
  <view class="slow-notes-tab" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 顶栏 -->
    <view class="tab-header">
      <view class="header-titles">
        <text class="main-title">小纸条</text>
        <text class="sub-title">慢节奏社交 · 距离换算传递延迟</text>
      </view>
      <view class="header-right-badges">
        <view class="speed-ticket-badge seal-mall-badge" @tap="openGrowthMall">
          <text class="ticket-icon">🔏</text>
          <text class="ticket-count">火漆印章 & 信纸库 ›</text>
        </view>
      </view>
    </view>

    <!-- 正在飞行的纸条雷达横幅 (若有) -->
    <view v-if="activeFlyingNotes.length > 0" class="flying-radar-box">
      <view class="radar-header">
        <text class="radar-title">✈️ 正在天空飞行的纸条 ({{ activeFlyingNotes.length }})</text>
        <text class="radar-tip">按物理距离折算传递时间</text>
      </view>
      <view
        v-for="fn in activeFlyingNotes"
        :key="fn.id"
        class="flying-card"
        @tap="openChatFromFlyingNote(fn)"
      >
        <view class="flying-card-top">
          <view class="flying-user">
            <image class="target-avatar" :src="fn.targetAvatar" mode="aspectFill" />
            <view class="flying-info">
              <text class="flying-to">飞往 {{ fn.targetName }}</text>
              <text class="flying-step">{{ fn.currentDesc }}</text>
            </view>
          </view>
          <view class="slow-flight-badge">
            <text class="badge-txt">🕊️ 纸飞机慢翔中</text>
          </view>
        </view>
        <!-- 飞行进度条 -->
        <view class="flight-progress-bar">
          <view class="progress-fill" :style="{ width: fn.progress + '%' }">
            <view class="airplane-head">✈️</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 纸条会话列表 -->
    <scroll-view scroll-y class="conversations-scroll">
      <view class="conversations-list">
        <view
          v-for="friend in friendConversations"
          :key="friend.userId"
          class="chat-cell-item"
          @tap="openChatWithFriend(friend)"
        >
          <view class="avatar-box">
            <image class="user-avatar" :src="friend.avatar" mode="aspectFill" />
            <view v-if="friend.unreadCount && friend.unreadCount > 0" class="unread-badge">
              {{ friend.unreadCount }}
            </view>
          </view>

          <view class="chat-cell-content">
            <view class="cell-row-top">
              <text class="friend-name">{{ friend.name }}</text>
              <text class="distance-tag">📍 {{ formatDistance(friend.distanceMeters || 650) }}</text>
              <text class="chat-time">{{ formatTime(friend.lastMessageTime || Date.now()) }}</text>
            </view>
            <view class="cell-row-bottom">
              <text class="last-msg-preview" :class="{ 'in-flight': isMsgInFlight(friend) }">
                {{ friend.lastMessage || '还没有互传过小纸条，点击打个招呼吧~' }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部暖心提示 -->
      <view class="slow-chat-footer-tip">
        <text class="footer-icon">📮</text>
        <text class="footer-text">慢下来，生活才有期待 · 小纸条到达时会轻轻提醒你</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { FriendItem, ChatMessage } from "../../types";
import { useAppState } from "../../composables/useAppState";
import { computeFlightProgress } from "../../services/slowNotesService";
import { formatDistance } from "../../services/geo";

const {
  statusBarHeight,
  myProfile,
  openChatWithFriend,
  formatTime,
  getFriendsList,
  switchMainTab
} = useAppState();

const friends = ref<FriendItem[]>([]);
let timer: any = null;

function loadFriends() {
  friends.value = getFriendsList();
}

onMounted(() => {
  loadFriends();
  timer = setInterval(() => {
    loadFriends();
  }, 2000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const friendConversations = computed(() => {
  return [...friends.value].sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
});

// 计算所有未送达的飞行纸条
interface FlyingCardItem {
  id: string;
  targetId: string;
  targetName: string;
  targetAvatar: string;
  currentDesc: string;
  progress: number;
}

const activeFlyingNotes = computed<FlyingCardItem[]>(() => {
  const rawChats = uni.getStorageSync("LOCAL_MAP_CHATS_V1") || "{}";
  let allChats: Record<string, ChatMessage[]> = {};
  try {
    allChats = JSON.parse(rawChats);
  } catch (e) {}

  const result: FlyingCardItem[] = [];
  for (const friendId of Object.keys(allChats)) {
    const list = allChats[friendId] || [];
    const friend = friends.value.find(f => f.userId === friendId);
    for (const msg of list) {
      if (msg.senderId === myProfile.value.id && !msg.isDelivered) {
        const { progress, currentDesc, isDelivered } = computeFlightProgress(msg);
        if (!isDelivered) {
          result.push({
            id: msg.id,
            targetId: friendId,
            targetName: friend?.name || "邻友",
            targetAvatar: friend?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120",
            currentDesc,
            progress
          });
        }
      }
    }
  }
  return result;
});

function isMsgInFlight(friend: FriendItem): boolean {
  return !!(friend.lastMessage && friend.lastMessage.includes("[纸条传递中]"));
}

function openChatFromFlyingNote(fn: FlyingCardItem) {
  const f = friends.value.find(item => item.userId === fn.targetId);
  if (f) {
    openChatWithFriend(f);
  }
}

function openGrowthMall() {
  switchMainTab("me");
}
</script>

<style lang="scss" scoped>
.slow-notes-tab {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f5f0;
  box-sizing: border-box;
  padding-bottom: calc(58px + env(safe-area-inset-bottom, 0px));
}

.tab-header {
  padding: 14px 16px 12px;
  background: #fff;
  border-bottom: 0.5px solid #e5e0d8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-titles {
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: 20px;
  font-weight: bold;
  color: #3e2723;
  letter-spacing: 0.5px;
}

.sub-title {
  font-size: 11px;
  color: #8d6e63;
  margin-top: 2px;
}

.speed-ticket-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff3e0;
  border: 1px solid #ffe082;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: bold;
  color: #d84315;
}

/* 飞行雷达卡片 */
.flying-radar-box {
  margin: 10px 14px 6px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 3px 10px rgba(62, 39, 35, 0.05);
  border: 1px solid #fde68a;
}

.radar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.radar-title {
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
}

.radar-tip {
  font-size: 11px;
  color: #b45309;
}

.flying-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 6px;
  border: 0.5px solid rgba(220, 210, 198, 0.6);
}

.flying-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flying-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.target-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ebd9c5;
}

.flying-info {
  display: flex;
  flex-direction: column;
}

.flying-to {
  font-size: 13px;
  font-weight: 600;
  color: #2c2420;
}

.flying-step {
  font-size: 11px;
  color: #d97706;
  margin-top: 1px;
}

.slow-flight-badge {
  background: rgba(217, 119, 6, 0.1);
  border: 1px solid rgba(217, 119, 6, 0.25);
  color: #92400e;
  font-size: 11px;
  font-weight: 600;
  border-radius: 12px;
  padding: 2px 8px;
}

.seal-mall-badge {
  background: #fbf5ea !important;
  border-color: #ebd9c5 !important;
  color: #8c5835 !important;
}

.flight-progress-bar {
  margin-top: 8px;
  height: 5px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 3px;
  position: relative;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: #d97706;
  border-radius: 3px;
  position: relative;
}

.airplane-head {
  position: absolute;
  right: -10px;
  top: -8px;
  font-size: 14px;
}

/* 列表区 */
.conversations-scroll {
  flex: 1;
  padding: 8px 0;
}

.conversations-list {
  background: #fff;
  border-top: 0.5px solid rgba(220, 210, 198, 0.5);
  border-bottom: 0.5px solid rgba(220, 210, 198, 0.5);
}

.chat-cell-item {
  display: flex;
  align-items: center;
  padding: 13px 16px;
  border-bottom: 0.5px solid #f2ede4;
  transition: background 0.15s;
}

.chat-cell-item:active {
  background: #faf7f2;
}

.avatar-box {
  position: relative;
  margin-right: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #dc2626;
  color: #fff;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  padding: 0 4px;
}

.chat-cell-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cell-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.friend-name {
  font-size: 15px;
  font-weight: 600;
  color: #2c2420;
}

.distance-tag {
  font-size: 10px;
  background: #fbf5ea;
  color: #8c5835;
  border: 0.5px solid #ebd9c5;
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 6px;
  margin-right: auto;
}

.chat-time {
  font-size: 11px;
  color: #a8a096;
}

.cell-row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.last-msg-preview {
  font-size: 13px;
  color: #70665f;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.in-flight {
  color: #d97706;
  font-weight: 500;
}

.slow-chat-footer-tip {
  padding: 24px 16px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #a0aec0;
}

.footer-icon {
  font-size: 20px;
}

.footer-text {
  font-size: 11px;
  text-align: center;
}
</style>
