<template>
  <view v-if="chatSheetVisible" class="chat-fullscreen-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="chat-sheet">
      <!-- 慢纸条顶栏: 返回键 + 昵称/距离 + 桌洞直达 -->
      <view class="chat-header">
        <view class="chat-back-btn" @tap="closeChatSheet(true)">
          <text class="back-arrow">‹</text>
          <text class="back-label">返回</text>
        </view>

        <view class="chat-header-center" @tap="openUserProfileCard(currentChatFriend, undefined)">
          <text class="chat-header-name">{{ currentChatFriend?.name }}</text>
          <text class="online-tag">📍 距离 {{ formatDistance(currentChatFriend?.distanceMeters || 780) }} · 慢纸条互传</text>
        </view>

        <view class="chat-desk-btn" @tap="goToFriendDesk">
          <text class="desk-btn-text">🪟 进TA桌洞</text>
        </view>
      </view>

      <!-- 飞行航迹状态卡片 (如果有正在传递中的纸条) -->
      <view v-if="flyingNoteInfo" class="flight-radar-banner">
        <view class="radar-top-row">
          <view class="radar-left">
            <text class="airplane-spin">✈️</text>
            <text class="radar-text">{{ flyingNoteInfo.desc }}</text>
          </view>
          <button class="fast-speed-action" @tap="accelerateCurrentNote">
            🚀 1元极速送达
          </button>
        </view>
        <view class="radar-progress-track">
          <view class="track-fill" :style="{ width: flyingNoteInfo.progress + '%' }" />
        </view>
      </view>

      <!-- 纸条消息流 -->
      <scroll-view scroll-y class="chat-messages-box" :scroll-top="chatScrollTop">
        <view class="chat-scroll-inner">
          <view class="chat-security-tip">
            <text>📜 慢社交模式：每条限70字，按物理距离换算传递延迟时间</text>
          </view>

          <view
            v-for="msg in currentChatMessages"
            :key="msg.id"
            class="chat-bubble-row"
            :class="msg.senderId === myProfile.id ? 'row-self' : 'row-other'"
          >
            <image
              class="msg-avatar"
              :src="msg.senderId === myProfile.id ? myProfile.avatar : currentChatFriend?.avatar"
              mode="aspectFill"
            />
            <view class="msg-paper-card" :class="{ 'sealed-card': msg.isSealed, 'sketch-card': msg.sketchMode }">
              <!-- 火漆封口徽标 -->
              <view v-if="msg.isSealed" class="wax-seal-badge">
                <text class="seal-icon">🔏 火漆密封</text>
              </view>

              <!-- 手写原迹/配图 -->
              <image
                v-if="msg.contentType === 'image' && msg.content"
                class="msg-hw-img"
                :src="msg.content"
                mode="widthFix"
              />

              <!-- 文字正文 -->
              <text v-if="msg.contentType === 'text'" class="msg-text">{{ msg.content }}</text>

              <!-- 纸条底部：传递状态与时间戳 -->
              <view class="msg-card-footer">
                <text class="transit-status" :class="{ 'status-flying': !msg.isDelivered }">
                  {{ msg.isDelivered ? '📬 已滑入桌洞' : '✈️ 天空传递中 (' + (msg.flightProgress || 60) + '%)' }}
                </text>
                <text class="msg-timestamp">{{ formatTime(msg.createdAt) }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 纸条输入栏与拟物工具区 -->
      <view class="slow-input-panel">
        <!-- 工具栏：火漆印切换、素描滤镜切换、字数指示器 -->
        <view class="input-tools-bar">
          <view
            class="tool-chip"
            :class="{ 'chip-on': isSealedMode }"
            @tap="isSealedMode = !isSealedMode"
          >
            <text>{{ isSealedMode ? '🔏 火漆印盖章' : '📜 普通折纸' }}</text>
          </view>
          <view
            class="tool-chip hw-btn-chip"
            @tap="showHwPad = true"
          >
            <text>✍️ 手写纸条</text>
          </view>
          <view
            class="tool-chip"
            :class="{ 'chip-on': isSketchMode }"
            @tap="isSketchMode = !isSketchMode"
          >
            <text>{{ isSketchMode ? '✏️ 铅笔素描已开启' : '✏️ 铅笔素描' }}</text>
          </view>
          <view class="char-counter" :class="{ 'char-warning': newChatMessageText.length >= 70 }">
            <text>{{ newChatMessageText.length }}/70 字</text>
          </view>
        </view>

        <!-- 文本输入行 -->
        <view class="input-action-row">
          <input
            class="chat-input"
            v-model="newChatMessageText"
            placeholder="写下70字折纸小纸条..."
            maxlength="70"
            confirm-type="send"
            @confirm="sendPaperNote"
          />
          <button
            class="chat-send-btn"
            :class="{ 'btn-ready': !!newChatMessageText.trim() }"
            :disabled="!newChatMessageText.trim()"
            @tap="sendPaperNote"
          >
            ✉️ 传纸条
          </button>
        </view>
      </view>
    </view>

    <!-- 真实手写纸条画板 -->
    <HandwritingPad
      v-if="showHwPad"
      actionConfirmText="✈️ 折成纸条寄出"
      defaultPattern="lined"
      @confirm="onHwConfirmed"
      @close="showHwPad = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAppState } from "../../composables/useAppState";
import {
  sendSlowPaperNote,
  computeFlightProgress,
  accelerateSlowNote
} from "../../services/slowNotesService";
import HandwritingPad from "../common/HandwritingPad.vue";

const showHwPad = ref(false);

const {
  statusBarHeight,
  chatSheetVisible,
  currentChatFriend,
  currentChatMessages,
  newChatMessageText,
  chatScrollTop,
  myProfile,
  closeChatSheet,
  formatTime,
  openUserProfileCard,
  switchMainTab
} = useAppState();

const isSealedMode = ref(false);
const isSketchMode = ref(false);
let progressTimer: any = null;

onMounted(() => {
  progressTimer = setInterval(() => {
    // 触发响应式刷新
    if (chatSheetVisible.value && currentChatFriend.value) {
      updateFlyingStatus();
    }
  }, 1000);
});

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer);
});

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

const flyingMsg = ref<any>(null);

function updateFlyingStatus() {
  const list = currentChatMessages.value || [];
  const inFlight = list.find(m => m.senderId === myProfile.value.id && !m.isDelivered);
  flyingMsg.value = inFlight || null;
}

const flyingNoteInfo = computed(() => {
  if (!flyingMsg.value) return null;
  const { progress, currentDesc, isDelivered } = computeFlightProgress(flyingMsg.value);
  if (isDelivered) {
    flyingMsg.value.isDelivered = true;
    return null;
  }
  return {
    progress,
    desc: currentDesc
  };
});

function sendPaperNote() {
  const text = newChatMessageText.value.trim();
  if (!text || !currentChatFriend.value) return;

  const newMsg = sendSlowPaperNote(currentChatFriend.value.userId, text, {
    isSealed: isSealedMode.value,
    sketchMode: isSketchMode.value,
    targetDistanceMeters: currentChatFriend.value.distanceMeters || 850
  });

  currentChatMessages.value.push(newMsg);
  newChatMessageText.value = "";
  updateFlyingStatus();
}

function onHwConfirmed(dataUrl: string) {
  showHwPad.value = false;
  if (!currentChatFriend.value) return;

  const newMsg = sendSlowPaperNote(currentChatFriend.value.userId, dataUrl, {
    isSealed: isSealedMode.value,
    sketchMode: false,
    imageUri: dataUrl,
    targetDistanceMeters: currentChatFriend.value.distanceMeters || 850
  });

  currentChatMessages.value.push(newMsg);
  updateFlyingStatus();
  uni.showToast({ title: "手写纸条已折起，起飞寄出！✈️", icon: "success" });
}

function accelerateCurrentNote() {
  if (!flyingMsg.value || !currentChatFriend.value) return;
  accelerateSlowNote(currentChatFriend.value.userId, flyingMsg.value.id);
  flyingMsg.value.isDelivered = true;
  flyingMsg.value.flightProgress = 100;
  uni.showToast({ title: "🚀 极速送达成功！已落入对方桌洞", icon: "success" });
}

function goToFriendDesk() {
  closeChatSheet(true);
  switchMainTab("deskHole");
}
</script>

<style lang="scss" scoped>
.chat-fullscreen-page {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f2eb;
  z-index: 150;
  display: flex;
  flex-direction: column;
}

.chat-sheet {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  height: 48px;
  background-color: #fff;
  border-bottom: 0.5px solid #e0d8cc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
}

.chat-back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.back-arrow {
  font-size: 22px;
  color: #8d6e63;
  line-height: 1;
}

.back-label {
  font-size: 14px;
  color: #5d4037;
}

.chat-header-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chat-header-name {
  font-size: 15px;
  font-weight: bold;
  color: #3e2723;
}

.online-tag {
  font-size: 10px;
  color: #8d6e63;
}

.chat-desk-btn {
  background: #fff3e0;
  padding: 4px 10px;
  border-radius: 14px;
  border: 1px solid #ffe082;
}

.desk-btn-text {
  font-size: 11px;
  color: #e67e22;
  font-weight: bold;
}

/* 飞行航迹状态横幅 */
.flight-radar-banner {
  background: linear-gradient(135deg, #fff9c4, #fff176);
  padding: 10px 14px;
  border-bottom: 1px solid #ffe082;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.radar-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.radar-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.airplane-spin {
  font-size: 16px;
}

.radar-text {
  font-size: 12px;
  font-weight: bold;
  color: #795548;
}

.fast-speed-action {
  background: #ff9800;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  border: none;
}

.radar-progress-track {
  margin-top: 6px;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.track-fill {
  height: 100%;
  background: #e67e22;
  border-radius: 2px;
}

/* 消息流 */
.chat-messages-box {
  flex: 1;
  background-color: #f7f4ed;
}

.chat-scroll-inner {
  padding: 14px;
}

.chat-security-tip {
  text-align: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  font-size: 10px;
  color: #8d6e63;
  margin-bottom: 16px;
}

.chat-bubble-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.row-self {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #ebd9c5;
}

/* 拟物化纸条卡片 */
.msg-paper-card {
  max-width: 72%;
  background: #fffdf9;
  border-radius: 8px 8px 8px 0;
  padding: 10px 12px;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.06);
  border: 1px solid #ebd9c5;
  position: relative;
}

.row-self .msg-paper-card {
  border-radius: 8px 8px 0 8px;
  background: #fffde7;
  border-color: #fff59d;
}

.sealed-card {
  border: 1.5px solid #d32f2f;
  background: #fffafa;
}

.wax-seal-badge {
  display: inline-block;
  background: #c62828;
  color: #fff;
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.msg-sketch-img {
  width: 100%;
  height: 120px;
  border-radius: 6px;
  margin-bottom: 6px;
  filter: grayscale(100%) contrast(120%);
}

.msg-hw-img {
  width: 100%;
  max-width: 220px;
  border-radius: 6px;
  margin-bottom: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.msg-text {
  font-size: 14px;
  color: #3e2723;
  line-height: 1.45;
  word-break: break-all;
  display: block;
}

.msg-card-footer {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 10px;
  color: #a1887f;
}

.status-flying {
  color: #e65100;
  font-weight: 500;
}

/* 底部纸条工具与输入区 */
.slow-input-panel {
  background: #fff;
  border-top: 0.5px solid #e0d8cc;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
}

.input-tools-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.tool-chip {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  background: #f5f2eb;
  color: #795548;
  border: 0.5px solid #ebd9c5;
}

.chip-on {
  background: #e67e22;
  color: #fff;
  border-color: #e67e22;
  font-weight: bold;
}

.hw-btn-chip {
  background: #fff3e0 !important;
  color: #e65100 !important;
  border-color: #ffb74d !important;
  font-weight: 700;
}

.char-counter {
  margin-left: auto;
  font-size: 11px;
  color: #8d6e63;
}

.char-warning {
  color: #d32f2f;
  font-weight: bold;
}

.input-action-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chat-input {
  flex: 1;
  background: #f7f5f0;
  border-radius: 18px;
  padding: 6px 14px;
  font-size: 14px;
  border: 1px solid #e0d8cc;
}

.chat-send-btn {
  background: #ccc;
  color: #fff;
  border-radius: 18px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: bold;
  border: none;
}

.btn-ready {
  background: #e67e22 !important;
}
</style>
