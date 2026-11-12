<template>
  <view v-if="chatSheetVisible" class="chat-fullscreen-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="chat-sheet">
      <!-- 1. 暖心慢纸条顶栏: 返回键 + 昵称/距离 + 桌洞直达 -->
      <view class="chat-header">
        <view class="chat-back-btn" @tap="closeChatSheet(true)">
          <text class="back-arrow">‹</text>
          <text class="back-label">返回</text>
        </view>

        <view class="chat-header-center" @tap="openUserProfileCard(currentChatFriend, undefined)">
          <text class="chat-header-name">{{ currentChatFriend?.name }}</text>
          <view class="header-sub-row">
            <text class="online-tag">📍 {{ formatDistance(currentChatFriend?.distanceMeters || 320) }} · 慢纸条互传</text>
          </view>
        </view>

        <!-- 进TA桌洞入口 (优雅木质圆角胶囊) -->
        <view class="chat-desk-btn" @tap="goToFriendDesk">
          <text class="desk-icon">🪟</text>
          <text class="desk-btn-text">进TA桌洞</text>
        </view>
      </view>

      <!-- 2. 纸飞机飞行航迹雷达 (有飞向TA的纸条时显示) -->
      <view v-if="flyingNoteInfo" class="flight-radar-banner">
        <view class="radar-top-row">
          <view class="radar-left">
            <text class="airplane-spin">🕊️</text>
            <text class="radar-text">{{ flyingNoteInfo.desc }}</text>
          </view>
          <view class="slow-flight-pill">
            <text class="flight-pill-txt">飞行进度 {{ flyingNoteInfo.progress }}%</text>
          </view>
        </view>
        <view class="radar-progress-track">
          <view class="track-fill" :style="{ width: flyingNoteInfo.progress + '%' }" />
        </view>
      </view>

      <!-- 3. 纸条消息流 -->
      <scroll-view scroll-y class="chat-messages-box" :scroll-top="chatScrollTop">
        <view class="chat-scroll-inner">
          <!-- 极简温情氛围小纸条引导 -->
          <view class="chat-security-tip">
            <text>💌 相距 500 米生活圈 · 纸飞机随微风慢递 · 拒绝即时焦虑</text>
          </view>

          <!-- 消息纸条列表 -->
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
              @tap="openUserProfileCard(msg.senderId === myProfile.id ? myProfile : currentChatFriend, undefined)"
            />

            <!-- 拟物便签纸张卡片 -->
            <view
              class="msg-paper-card"
              :class="[
                'paper-skin-' + (msg.paperType || 'default'),
                { 'sealed-card': msg.isSealed, 'sketch-card': msg.sketchMode }
              ]"
            >
              <!-- 和纸胶带装饰 (左上或顶边微折) -->
              <view class="card-washi-tape" />

              <!-- 未拆封火漆密封纸条 (点击破印拆信) -->
              <view v-if="msg.isSealed && !msg.isOpened && msg.senderId !== myProfile.id" class="sealed-unopened-box" @tap="crackWaxSeal(msg)">
                <view class="wax-seal-big-stamp">
                  <text class="stamp-seal-icon">🔏</text>
                  <text class="stamp-seal-name">{{ msg.sealType || '古铜月相火漆' }}</text>
                </view>
                <text class="unopened-hint">💌 这是一封私密慢纸条</text>
                <view class="crack-seal-btn">
                  <text>👆 点击戳破火漆 · 拆信阅读</text>
                </view>
              </view>

              <!-- 已拆开内容区 -->
              <view v-else class="msg-content-body">
                <!-- 火漆印已戳破专属勋章 -->
                <view v-if="msg.isSealed" class="wax-seal-badge">
                  <text class="seal-icon">🔏 {{ msg.sealType || '火漆印封' }}</text>
                </view>

                <!-- 手写原迹或素描插图 -->
                <view v-if="msg.contentType === 'image' && msg.content" class="hw-img-wrap">
                  <image
                    class="msg-hw-img"
                    :src="msg.content"
                    mode="widthFix"
                    @tap="previewImage(msg.content, [msg.content])"
                  />
                  <text class="hw-view-tip">🔍 点击查看手写真迹</text>
                </view>

                <!-- 文字正文 -->
                <text v-if="msg.contentType === 'text'" class="msg-text">{{ msg.content }}</text>

                <!-- 纸条卡片底部：传递状态、时间戳与桌洞收藏 -->
                <view class="msg-card-footer">
                  <view class="footer-left">
                    <text
                      v-if="msg.senderId === myProfile.id && !msg.isDelivered"
                      class="transit-status status-flying"
                    >
                      🕊️ 纸飞机飞行中 ({{ msg.flightProgress || 60 }}%)
                    </text>
                    <text v-else class="transit-status status-delivered">
                      📬 已滑入桌洞
                    </text>
                    <text class="msg-dot">·</text>
                    <text class="msg-timestamp">{{ formatTime(msg.createdAt) }}</text>
                  </view>

                  <!-- 珍藏入桌洞操作 -->
                  <view class="footer-pin-btn" @tap.stop="pinNoteToDesk(msg)">
                    <text class="pin-icon">{{ msg.isPinnedToDesk ? '⭐️ 已珍藏' : '📌 存入桌洞' }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 4. 纸条书写托盘 (彻底告别简陋单行框) -->
      <view class="stationery-tray-panel">
        <!-- 顶部拟物工具胶囊栏 -->
        <view class="stationery-tools-bar">
          <view class="tools-left-group">
            <!-- 手写纸条切换 -->
            <view class="tray-chip hw-chip" @tap="showHwPad = true">
              <text class="chip-icon">✍️</text>
              <text class="chip-text">手写纸条</text>
            </view>

            <!-- 火漆盖章开关 -->
            <view
              class="tray-chip"
              :class="{ 'chip-active-seal': isSealedMode }"
              @tap="openSealDrawer"
            >
              <text class="chip-icon">🔏</text>
              <text class="chip-text">{{ isSealedMode ? activeSealName : '火漆盖章' }}</text>
            </view>

            <!-- 特权信纸选择 -->
            <view class="tray-chip" @tap="openPaperDrawer">
              <text class="chip-icon">📜</text>
              <text class="chip-text">{{ activePaperName }}</text>
            </view>

            <!-- 快捷和纸戳印表情 -->
            <view class="tray-chip" @tap="showStickerPicker = !showStickerPicker">
              <text class="chip-icon">🌸</text>
              <text class="chip-text">戳印</text>
            </view>
          </view>

          <!-- 70字数指示器 -->
          <view class="char-counter" :class="{ 'char-warning': newChatMessageText.length >= 70 }">
            <text>{{ newChatMessageText.length }}/70 字</text>
          </view>
        </view>

        <!-- 戳印选择小抽屉 (如果展开) -->
        <view v-if="showStickerPicker" class="stickers-tray-drawer">
          <view
            v-for="stk in stickerList"
            :key="stk"
            class="sticker-item"
            @tap="insertSticker(stk)"
          >
            <text>{{ stk }}</text>
          </view>
        </view>

        <!-- 便签书写纸台与寄出动作行 -->
        <view class="stationery-input-box" :class="'paper-bg-' + currentPaperColor">
          <textarea
            class="note-writing-textarea"
            v-model="newChatMessageText"
            placeholder="写下70字折纸小纸条，伴随微风折叠寄出..."
            placeholder-class="note-textarea-ph"
            maxlength="70"
            :auto-height="true"
          />

          <!-- 寄出纸飞机按钮 -->
          <button
            class="note-send-btn"
            :class="{ 'send-ready': !!newChatMessageText.trim() }"
            :disabled="!newChatMessageText.trim()"
            @tap="sendPaperNote"
          >
            <text class="send-plane-icon">🕊️</text>
            <text class="send-label">寄出</text>
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

    <!-- 拟物信笺抽屉 (彻底取代原生 ActionSheet，保持吉卜力手账风格统一) -->
    <view v-if="showPaperDrawer" class="custom-drawer-mask" @tap="showPaperDrawer = false">
      <view class="custom-drawer-card" @tap.stop>
        <view class="drawer-header-row">
          <view class="drawer-pill-bar" />
          <text class="drawer-main-title">📜 挑选本次寄信的特权信纸</text>
          <text class="drawer-sub-title">慢节奏触感信笺，为文字镀上温暖温度</text>
        </view>
        <view class="drawer-items-list">
          <view
            v-for="p in paperOptions"
            :key="p.name"
            class="paper-item-card"
            :class="['paper-skin-' + p.colorKey, { 'item-card-active': activePaperName === p.name }]"
            @tap="applyPaper(p)"
          >
            <view class="paper-swatch-box">
              <text class="swatch-emoji">{{ p.icon }}</text>
            </view>
            <view class="paper-text-col">
              <view class="p-title-row">
                <text class="p-name">{{ p.name }}</text>
                <text v-if="activePaperName === p.name" class="p-badge">当前使用</text>
              </view>
              <text class="p-desc">{{ p.desc }}</text>
            </view>
            <view class="p-select-indicator">
              <text class="indicator-icon">{{ activePaperName === p.name ? '✓' : '›' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 拟物火漆印章盒抽屉 (彻底取代原生弹窗，保持吉卜力手账风格统一) -->
    <view v-if="showSealDrawer" class="custom-drawer-mask" @tap="showSealDrawer = false">
      <view class="custom-drawer-card" @tap.stop>
        <view class="drawer-header-row">
          <view class="drawer-pill-bar" />
          <text class="drawer-main-title">🔏 加盖专属火漆印章</text>
          <text class="drawer-sub-title">私密慢纸条 · 对方需亲手戳破火漆方可拆信</text>
        </view>
        <view class="drawer-items-list seal-list">
          <view
            v-for="s in sealOptions"
            :key="s.name"
            class="seal-item-card"
            :class="{ 'seal-card-active': isSealedMode && activeSealName === s.name }"
            @tap="applySeal(s)"
          >
            <view class="seal-wax-stamp" :style="{ background: s.bg, borderColor: s.border }">
              <text class="seal-stamp-ico">{{ s.icon }}</text>
            </view>
            <view class="seal-text-col">
              <view class="p-title-row">
                <text class="s-name">{{ s.name }}</text>
                <text v-if="isSealedMode && activeSealName === s.name" class="s-badge">已加盖</text>
              </view>
              <text class="s-desc">{{ s.desc }}</text>
            </view>
            <view class="p-select-indicator">
              <text class="indicator-icon">{{ isSealedMode && activeSealName === s.name ? '✓' : '›' }}</text>
            </view>
          </view>
        </view>
        <view v-if="isSealedMode" class="drawer-footer-action" @tap="removeSeal">
          <text class="cancel-seal-btn">✕ 撤下火漆印（改为普通慢纸条）</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAppState } from "../../composables/useAppState";
import {
  sendSlowPaperNote,
  computeFlightProgress
} from "../../services/slowNotesService";
import { formatDistance } from "../../services/geo";
import { ChatMessage } from "../../types";
import { saveUserProfile } from "../../services/storage";
import HandwritingPad from "../common/HandwritingPad.vue";

const showHwPad = ref(false);
const showStickerPicker = ref(false);
const showPaperDrawer = ref(false);
const showSealDrawer = ref(false);

const paperOptions = [
  { name: "京都和纸", colorKey: "yellow", icon: "🌾", desc: "古法棉麻纤维手感，水墨温润微黄底纹" },
  { name: "星空流光纸", colorKey: "blue", icon: "🌌", desc: "幽蓝深邃星辰，适合夜读轻语" },
  { name: "樱花手账纸", colorKey: "pink", icon: "🌸", desc: "柔和落樱微粉，温润少女心事" },
  { name: "古朴牛皮卷", colorKey: "kraft", icon: "🪵", desc: "复古怀旧质感，手感厚重质朴" }
];

const sealOptions = [
  { name: "古铜月相印", icon: "🌙", bg: "linear-gradient(135deg, #78350f, #92400e)", border: "#f59e0b", desc: "复古古铜压痕，月相清冷" },
  { name: "玫瑰金猫爪印", icon: "🐾", bg: "linear-gradient(135deg, #9d174d, #be185d)", border: "#fbcfe8", desc: "治愈肉垫浮雕，温情陪伴" },
  { name: "欧式皇家徽印", icon: "👑", bg: "linear-gradient(135deg, #7f1d1d, #991b1b)", border: "#fbbf24", desc: "双狮展翼纹章，庄重誓约" }
];

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
  previewImage,
  openUserProfileCard,
  switchMainTab
} = useAppState();

const isSealedMode = ref(false);
const isSketchMode = ref(false);
const currentPaperColor = ref<string>("yellow");
const activePaperName = ref<string>("京都和纸");
const activeSealName = ref<string>("古铜月相印");

const stickerList = ["☕ 暖心咖啡", "🌸 浪漫落樱", "🐾 温暖猫爪", "📮 街角邮戳", "💌 悄悄心意", "🍃 窗台微风", "✨ 繁星闪烁"];

let progressTimer: any = null;

onMounted(() => {
  // 同步用户成长中心装备的印章与信纸
  if (myProfile.value?.growth?.activeSeal) {
    activeSealName.value = myProfile.value.growth.activeSeal;
  }
  if (myProfile.value?.growth?.activePaper) {
    activePaperName.value = myProfile.value.growth.activePaper;
  }

  progressTimer = setInterval(() => {
    if (chatSheetVisible.value && currentChatFriend.value) {
      updateFlyingStatus();
    }
  }, 1000);
});

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer);
});

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

function openSealDrawer() {
  showSealDrawer.value = true;
}

function applySeal(s: typeof sealOptions[0]) {
  activeSealName.value = s.name;
  isSealedMode.value = true;
  showSealDrawer.value = false;
  uni.showToast({ title: `已盖上「${s.name}」🔏`, icon: "none" });
}

function removeSeal() {
  isSealedMode.value = false;
  showSealDrawer.value = false;
  uni.showToast({ title: "已撤下火漆印（改为普通纸条）", icon: "none" });
}

function openPaperDrawer() {
  showPaperDrawer.value = true;
}

function applyPaper(p: typeof paperOptions[0]) {
  activePaperName.value = p.name;
  currentPaperColor.value = p.colorKey;
  showPaperDrawer.value = false;
  uni.showToast({ title: `已换上：${p.name} 📜`, icon: "none" });
}

function insertSticker(stk: string) {
  if (newChatMessageText.value.length + stk.length <= 70) {
    newChatMessageText.value += (newChatMessageText.value ? " " : "") + stk;
  } else {
    uni.showToast({ title: "纸条限70字以内哦", icon: "none" });
  }
  showStickerPicker.value = false;
}

function crackWaxSeal(msg: ChatMessage) {
  uni.showLoading({ title: "正在戳破火漆封口..." });
  setTimeout(() => {
    uni.hideLoading();
    msg.isOpened = true;
    uni.showToast({ title: "火漆印已启封，展信悦！💌", icon: "success" });
  }, 400);
}

function pinNoteToDesk(msg: ChatMessage) {
  msg.isPinnedToDesk = true;
  uni.showToast({ title: "已将此小纸条珍藏入你的桌洞！🪟", icon: "success" });
}

function sendPaperNote() {
  const text = newChatMessageText.value.trim();
  if (!text || !currentChatFriend.value) return;

  const newMsg = sendSlowPaperNote(currentChatFriend.value.userId, text, {
    isSealed: isSealedMode.value,
    sealType: isSealedMode.value ? activeSealName.value : undefined,
    paperType: activePaperName.value,
    sketchMode: isSketchMode.value,
    targetDistanceMeters: currentChatFriend.value.distanceMeters || 450
  });

  currentChatMessages.value.push(newMsg);
  newChatMessageText.value = "";
  isSealedMode.value = false;
  showStickerPicker.value = false;
  updateFlyingStatus();
  uni.showToast({ title: "纸条折叠起飞，寄往邻友！🕊️", icon: "success" });
}

function onHwConfirmed(dataUrl: string) {
  showHwPad.value = false;
  if (!currentChatFriend.value) return;

  const newMsg = sendSlowPaperNote(currentChatFriend.value.userId, dataUrl, {
    isSealed: isSealedMode.value,
    sealType: isSealedMode.value ? activeSealName.value : undefined,
    paperType: activePaperName.value,
    sketchMode: false,
    imageUri: dataUrl,
    targetDistanceMeters: currentChatFriend.value.distanceMeters || 450
  });

  currentChatMessages.value.push(newMsg);
  isSealedMode.value = false;
  updateFlyingStatus();
  uni.showToast({ title: "手写纸条已折起，起飞寄出！✈️", icon: "success" });
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
  background-color: #f7f5f0;
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

/* 1. 顶栏 */
.chat-header {
  height: 50px;
  background-color: #ffffff;
  border-bottom: 0.5px solid rgba(220, 210, 198, 0.6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(62, 39, 35, 0.03);

  .chat-back-btn {
    display: flex;
    align-items: center;
    gap: 2px;
    cursor: pointer;
    padding: 6px 4px;

    .back-arrow {
      font-size: 24px;
      color: #5d4037;
      line-height: 1;
      margin-top: -2px;
    }

    .back-label {
      font-size: 15px;
      color: #5d4037;
    }
  }

  .chat-header-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    .chat-header-name {
      font-size: 15px;
      font-weight: 600;
      color: #2c2420;
    }

    .header-sub-row {
      display: flex;
      align-items: center;
      margin-top: 1px;

      .online-tag {
        font-size: 11px;
        color: #8c827a;
      }
    }
  }

  .chat-desk-btn {
    background: #fbf5ea;
    padding: 5px 12px;
    border-radius: 16px;
    border: 1px solid #ebd9c5;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(62, 39, 35, 0.06);

    .desk-icon {
      font-size: 13px;
    }

    .desk-btn-text {
      font-size: 12px;
      color: #8c5835;
      font-weight: 600;
    }
  }
}

/* 2. 飞行航迹状态横幅 */
.flight-radar-banner {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  padding: 10px 16px;
  border-bottom: 1px solid #fde68a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;

  .radar-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .radar-left {
      display: flex;
      align-items: center;
      gap: 6px;

      .airplane-spin {
        font-size: 15px;
      }

      .radar-text {
        font-size: 12px;
        font-weight: 600;
        color: #92400e;
      }
    }

    .slow-flight-pill {
      background: rgba(146, 64, 14, 0.12);
      padding: 2px 8px;
      border-radius: 10px;

      .flight-pill-txt {
        font-size: 11px;
        color: #78350f;
        font-weight: 600;
      }
    }
  }

  .radar-progress-track {
    margin-top: 6px;
    height: 4px;
    background: rgba(0, 0, 0, 0.08);
    border-radius: 2px;
    overflow: hidden;

    .track-fill {
      height: 100%;
      background: #d97706;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
  }
}

/* 3. 消息流 */
.chat-messages-box {
  flex: 1;
  background-color: #f7f5f0;
}

.chat-scroll-inner {
  padding: 14px 14px 20px;

  .chat-security-tip {
    text-align: center;
    padding: 6px 14px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 14px;
    font-size: 11px;
    color: #8c827a;
    margin: 4px auto 16px;
    width: fit-content;
  }

  .chat-bubble-row {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    align-items: flex-start;

    &.row-self {
      flex-direction: row-reverse;

      .msg-paper-card {
        border-radius: 12px 2px 12px 12px;
        background: #fffdf2;
        border-color: #faecc0;

        .card-washi-tape {
          right: 12px;
          left: auto;
        }

        .msg-card-footer {
          flex-direction: row-reverse;
        }
      }
    }

    .msg-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
    }

    /* 纸条卡片 */
    .msg-paper-card {
      max-width: 74%;
      background: #ffffff;
      border-radius: 2px 12px 12px 12px;
      padding: 14px 14px 10px;
      box-shadow: 0 3px 10px rgba(62, 39, 35, 0.06);
      border: 1px solid #ebd9c5;
      position: relative;
      transition: all 0.2s ease;

      /* 和纸胶带修饰 */
      .card-washi-tape {
        position: absolute;
        top: -6px;
        left: 12px;
        width: 36px;
        height: 12px;
        background: rgba(255, 255, 255, 0.85);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-radius: 1px;
        border-left: 1.5px dashed rgba(0, 0, 0, 0.15);
        border-right: 1.5px dashed rgba(0, 0, 0, 0.15);
      }

      /* 未拆开的火漆信封 */
      .sealed-unopened-box {
        padding: 10px 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        .wax-seal-big-stamp {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #b91c1c;
          border: 2px solid #7f1d1d;
          box-shadow: 0 4px 12px rgba(185, 28, 28, 0.35);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .stamp-seal-icon {
            font-size: 18px;
          }

          .stamp-seal-name {
            font-size: 8px;
            color: #ffffff;
            font-weight: bold;
            transform: scale(0.85);
          }
        }

        .unopened-hint {
          font-size: 13px;
          font-weight: 600;
          color: #7f1d1d;
        }

        .crack-seal-btn {
          background: #fee2e2;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          color: #b91c1c;
          font-weight: 500;
        }
      }

      /* 已拆开正文 */
      .msg-content-body {
        .wax-seal-badge {
          display: inline-block;
          background: #fee2e2;
          border: 0.5px solid #fca5a5;
          color: #b91c1c;
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 6px;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .hw-img-wrap {
          margin-bottom: 6px;

          .msg-hw-img {
            width: 100%;
            max-width: 220px;
            border-radius: 6px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          }

          .hw-view-tip {
            display: block;
            font-size: 10px;
            color: #8c827a;
            margin-top: 2px;
          }
        }

        .msg-text {
          font-size: 15px;
          color: #2c2420;
          line-height: 1.55;
          word-break: break-all;
          display: block;
          letter-spacing: 0.3px;
        }

        .msg-card-footer {
          margin-top: 8px;
          padding-top: 6px;
          border-top: 0.5px dashed rgba(0, 0, 0, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;

          .footer-left {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;

            .transit-status {
              font-size: 11px;
              &.status-flying {
                color: #d97706;
                font-weight: 500;
              }
              &.status-delivered {
                color: #8c827a;
              }
            }

            .msg-dot {
              color: #cccccc;
            }

            .msg-timestamp {
              color: #a8a096;
            }
          }

          .footer-pin-btn {
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.03);

            .pin-icon {
              font-size: 10px;
              color: #8c5835;
            }
          }
        }
      }
    }
  }
}

/* 4. 纸条书写托盘 (Redesigned) */
.stationery-tray-panel {
  background: #ffffff;
  border-top: 1px solid rgba(220, 210, 198, 0.7);
  padding: 10px 14px calc(12px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -2px 10px rgba(62, 39, 35, 0.04);
  flex-shrink: 0;

  .stationery-tools-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .tools-left-group {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;

      .tray-chip {
        display: flex;
        align-items: center;
        gap: 3px;
        padding: 4px 9px;
        border-radius: 14px;
        background: #f7f5f0;
        border: 0.5px solid #ebd9c5;
        font-size: 11px;
        color: #6d5b52;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;

        .chip-icon {
          font-size: 12px;
        }

        &.hw-chip {
          background: #fff8eb;
          border-color: #fde047;
          color: #b45309;
          font-weight: 600;
        }

        &.chip-active-seal {
          background: #fee2e2;
          border-color: #f87171;
          color: #b91c1c;
          font-weight: 600;
        }
      }
    }

    .char-counter {
      font-size: 11px;
      color: #a8a096;
      white-space: nowrap;
      margin-left: 6px;

      &.char-warning {
        color: #dc2626;
        font-weight: bold;
      }
    }
  }

  /* 戳印抽屉 */
  .stickers-tray-drawer {
    display: flex;
    gap: 8px;
    padding: 6px 0 8px;
    overflow-x: auto;

    .sticker-item {
      padding: 4px 10px;
      border-radius: 12px;
      background: #fdf6ec;
      border: 1px dashed #fbd38d;
      font-size: 12px;
      color: #7b341e;
      cursor: pointer;
      white-space: nowrap;
    }
  }

  /* 便签书写台与寄出动作行 */
  .stationery-input-box {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 14px;
    background: #fffdf7;
    border: 1.5px solid #e8decb;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;

    &.paper-bg-yellow { background: #fffef2; border-color: #faecc0; }
    &.paper-bg-blue   { background: #f0f7fe; border-color: #cde4fa; }
    &.paper-bg-pink   { background: #fef2f4; border-color: #fad2dc; }
    &.paper-bg-kraft  { background: #f5efe6; border-color: #ded1c1; }

    .note-writing-textarea {
      flex: 1;
      min-height: 40px;
      max-height: 84px;
      font-size: 14px;
      line-height: 1.5;
      color: #2c2420;
      border: none;
      background: transparent;
      padding: 4px 0;
      box-sizing: border-box;
    }

    .note-textarea-ph {
      color: #aba29a;
      font-size: 14px;
    }

    .note-send-btn {
      margin: 0;
      padding: 0 14px;
      height: 36px;
      border-radius: 18px;
      background: #e5e2da;
      color: #a8a096;
      border: none;
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s ease;

      .send-plane-icon {
        font-size: 15px;
      }

      .send-label {
        font-size: 13px;
        font-weight: 600;
      }

      &.send-ready {
        background: #3e2723;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(62, 39, 35, 0.25);

        &:active {
          transform: scale(0.96);
        }
      }
    }
  }
}

/* 拟物手账抽屉 (统一定制设计，杜绝生硬原生白框弹窗) */
.custom-drawer-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 220;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease;
}

.custom-drawer-card {
  background: #fffdf8;
  border-radius: 20px 20px 0 0;
  padding: 16px 18px calc(24px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -8px 24px rgba(62, 39, 35, 0.15);
  border-top: 1px solid rgba(220, 210, 198, 0.8);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  .drawer-header-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 16px;

    .drawer-pill-bar {
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background: #ded8ce;
      margin-bottom: 12px;
    }

    .drawer-main-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c2420;
    }

    .drawer-sub-title {
      font-size: 12px;
      color: #8c827a;
      margin-top: 3px;
    }
  }

  .drawer-items-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .paper-item-card, .seal-item-card {
      display: flex;
      align-items: center;
      padding: 12px 14px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid #ebd9c5;
      box-shadow: 0 2px 6px rgba(62, 39, 35, 0.04);
      cursor: pointer;
      transition: all 0.18s ease;

      &:active {
        transform: scale(0.985);
      }

      &.item-card-active, &.seal-card-active {
        border-color: #3e2723;
        box-shadow: 0 3px 12px rgba(62, 39, 35, 0.12);
        background: #fffef2;
      }

      &.paper-skin-yellow {
        background: #fffdf2;
      }
      &.paper-skin-blue {
        background: #f0f7fe;
        border-color: #cde4fa;
      }
      &.paper-skin-pink {
        background: #fef2f4;
        border-color: #fad2dc;
      }
      &.paper-skin-kraft {
        background: #f7f3ec;
        border-color: #ded1c1;
      }

      .paper-swatch-box {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.03);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;

        .swatch-emoji {
          font-size: 22px;
        }
      }

      .paper-text-col, .seal-text-col {
        flex: 1;
        display: flex;
        flex-direction: column;

        .p-title-row {
          display: flex;
          align-items: center;
          gap: 6px;

          .p-name, .s-name {
            font-size: 15px;
            font-weight: 600;
            color: #2c2420;
          }

          .p-badge, .s-badge {
            font-size: 10px;
            padding: 1px 6px;
            border-radius: 8px;
            background: #3e2723;
            color: #ffffff;
            font-weight: 500;
          }
        }

        .p-desc, .s-desc {
          font-size: 12px;
          color: #8c827a;
          margin-top: 2px;
        }
      }

      .seal-wax-stamp {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fff;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
        margin-right: 12px;
        flex-shrink: 0;

        .seal-stamp-ico {
          font-size: 20px;
        }
      }

      .p-select-indicator {
        font-size: 16px;
        color: #8c827a;
        margin-left: 8px;
        font-weight: bold;
      }
    }
  }

  .drawer-footer-action {
    margin-top: 14px;
    text-align: center;
    padding: 8px 0;
    cursor: pointer;

    .cancel-seal-btn {
      font-size: 13px;
      color: #b91c1c;
      font-weight: 500;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
