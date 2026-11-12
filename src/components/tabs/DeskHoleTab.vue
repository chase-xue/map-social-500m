<template>
  <view class="desk-hole-container" :class="'theme-' + currentDesk.theme">
    <!-- 顶部状态与访客信息栏 -->
    <view class="desk-top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="desk-user-info">
        <image class="owner-avatar" :src="currentDesk.ownerAvatar" mode="aspectFill" />
        <view class="owner-meta">
          <view class="owner-name-row">
            <text class="owner-name">{{ currentDesk.ownerName }}</text>
            <text class="desk-tag">{{ isVisitingOther ? '客座桌洞' : '我的书桌' }}</text>
          </view>
          <text class="owner-sub">访客 {{ currentDesk.visitorCount }} · 天气 {{ weatherLabel }}</text>
        </view>
      </view>

      <view class="desk-actions-top">
        <view v-if="isVisitingOther" class="action-pill-btn" @tap="exitVisiting">
          <text>‹ 回我桌洞</text>
        </view>
        <view v-else class="action-pill-btn" @tap="cycleWeather" title="切换窗外天气">
          <text class="pill-icon">{{ weatherIcon }}</text>
          <text class="pill-text">{{ weatherLabel }}</text>
        </view>
        <view v-if="!isVisitingOther" class="action-pill-btn theme-btn" @tap="themeSelectorVisible = !themeSelectorVisible">
          <text>🎨 装扮</text>
        </view>
      </view>
    </view>

    <!-- 主体区域：面对窗户的写字台拟物全景 -->
    <view class="desk-scene-viewport">
      <!-- 1. 吉卜力治愈系窗户与窗外景致 -->
      <view class="ghibli-window" :class="'weather-' + currentDesk.weather">
        <!-- 窗外自然景致层 -->
        <view class="sky-scenery">
          <view v-if="currentDesk.weather === 'sunny'" class="sun-glow" />
          <view v-if="currentDesk.weather === 'sunny'" class="sun-flare-rays" />
          <view v-if="currentDesk.weather === 'night'" class="night-sky">
            <view class="crescent-moon" />
            <view class="star star-1">✦</view>
            <view class="star star-2">★</view>
            <view class="star star-3">✦</view>
          </view>
          <view v-if="currentDesk.weather === 'rainy'" class="rain-canvas">
            <view v-for="i in 16" :key="i" class="rain-line" :style="{ left: (i * 6.2) + '%', animationDelay: (i * 0.12) + 's' }" />
          </view>
          <view class="distant-landscape" />
          <view class="soft-cloud cloud-1" />
          <view class="soft-cloud cloud-2" />
        </view>

        <!-- 飘动的两翼轻盈半透明白纱窗帘 -->
        <view class="sheer-curtain curtain-left" />
        <view class="sheer-curtain curtain-right" />

        <!-- 窗棂十字实木格条 -->
        <view class="window-wood-frame">
          <view class="crossbar-h" />
          <view class="crossbar-v" />
        </view>

        <!-- 纸飞机折纸飞入动画 (写完手写纸条时的沉浸动效) -->
        <view v-if="isFoldingFlying" class="paper-airplane-anim">
          <view class="airplane-body">✈️</view>
          <text class="airplane-trail">正在折起飞向窗台...</text>
        </view>

        <!-- 窗户上的手绘和纸便签墙 (支持真实手写真迹渲染与微翘撕取) -->
        <view class="window-notes-stream">
          <view
            v-for="note in currentDesk.windowNotes"
            :key="note.id"
            class="washi-sticky-note"
            :class="['paper-' + note.color, { 'my-note': note.isMine, 'note-peeling': peelingNoteId === note.id }]"
            :style="{ transform: 'rotate(' + note.rotationDeg + 'deg)' }"
            @tap="peelAndInspectNote(note)"
          >
            <view class="washi-tape-strip" />
            <view class="note-author-row">
              <text class="note-author-txt">{{ note.authorName }}</text>
              <text class="note-heart">❤️ {{ note.likes }}</text>
            </view>

            <!-- 如果是真实手写图片，展示手写真迹 -->
            <image
              v-if="isHandwritingImg(note.content)"
              class="handwritten-note-img"
              :src="note.content"
              mode="aspectFit"
            />
            <!-- 普通文字便签 -->
            <text v-else class="note-body-txt">{{ note.content }}</text>
          </view>
        </view>

        <!-- 窗台搁板与生活情调摆件 -->
        <view class="window-shelf">
          <view class="shelf-left-item">
            <text class="item-emoji">🪴</text>
            <text class="shelf-label">春日多肉</text>
          </view>
          <view class="shelf-right-item">
            <view class="coffee-steaming">
              <view class="steam steam-1" />
              <view class="steam steam-2" />
              <text class="coffee-cup">☕</text>
            </view>
            <text class="shelf-label">热手冲</text>
          </view>
        </view>
      </view>

      <!-- 2. 实木写字台面与实体跟手拖拽滑出抽屉 -->
      <view class="solid-wood-desk">
        <!-- 窗外柔和阳光投射在桌面的斜向光束与光斑 -->
        <view v-if="currentDesk.weather === 'sunny'" class="desk-sunlight-beam" pointer-events="none" />

        <view class="desk-linen-mat">
          <!-- 桌面物件行：生活回忆录日记本 + 真实手写笔筒 -->
          <view class="desk-items-row">
            <!-- 📖 生活回忆录日记本 (复古装订缝线与侧边多层纸质感) -->
            <view class="vintage-journal-book" @tap="diaryModalVisible = true">
              <view class="journal-spine-leather" />
              <view class="journal-stitch-line" />
              <view class="journal-ribbon" />
              <view class="deckled-pages-edge" />
              <view class="journal-cover-title">
                <text class="journal-icon">📖</text>
                <text class="journal-txt">生活回忆录</text>
                <text class="journal-meta">{{ currentDesk.diaryEntries.length }} 篇便签足迹 ›</text>
              </view>
            </view>

            <!-- ✍️ 真实手写笔筒 (点击立即弹出真迹画板) -->
            <view class="desk-pen-caddy" @tap="openHandwritingPad">
              <view class="pen-caddy-brim" />
              <text class="caddy-icon">✍️</text>
              <view class="caddy-meta">
                <text class="caddy-title">手写新纸条</text>
                <text class="caddy-tip">真迹笔画涂鸦</text>
              </view>
            </view>
          </view>

          <!-- 🗄️ 真实跟手拖拽物理抽屉 (支持上下按住拖动 + 点击切换) -->
          <view class="physical-drawer-unit" :class="{ 'drawer-is-pulled': isDrawerPulled || drawerDragY > 30 }">
            <!-- 抽屉外部实木面板与黄铜拉手 (支持 Touch/Mouse 拖拽手势) -->
            <view
              class="drawer-face-panel"
              :style="{ transform: `translateY(${drawerDragY}px)` }"
              @touchstart="onDrawerTouchStart"
              @touchmove="onDrawerTouchMove"
              @touchend="onDrawerTouchEnd"
              @mousedown="onDrawerMouseDown"
              @tap="toggleDrawerPull"
            >
              <view class="brass-handle-box">
                <view class="brass-curved-pull" />
                <view class="brass-label-plate">
                  <text class="drawer-plate-text">📥 我的桌洞抽屉</text>
                  <text class="drawer-count-badge">{{ currentDesk.drawerNotes.length }} 封信</text>
                </view>
              </view>
              <view class="drawer-pull-hint">
                <text class="hint-arrow">{{ isDrawerPulled ? '▲ 轻推闭合' : '▼ 按住下拉抽屉' }}</text>
              </view>
            </view>

            <!-- 抽屉拉出后露出的内部暗格绒布收纳箱 -->
            <view v-if="isDrawerPulled || drawerDragY > 30" class="drawer-inner-compartment">
              <view class="compartment-header">
                <text class="comp-title">🕯️ 抽屉暗格收纳的小纸条信物</text>
                <text class="comp-close" @tap.stop="closeDrawer">✕ 推回</text>
              </view>

              <scroll-view scroll-y class="drawer-letters-scroll">
                <view v-if="currentDesk.drawerNotes.length === 0" class="drawer-empty-state">
                  <text class="empty-icon">📮</text>
                  <text class="empty-txt">抽屉内铺着柔软毛毡，等待朋友塞进第一封手写纸条～</text>
                </view>

                <view
                  v-for="dn in currentDesk.drawerNotes"
                  :key="dn.id"
                  class="drawer-letter-envelope"
                  :class="{ 'wax-sealed': dn.isSealed }"
                  @tap="openDrawerNoteDetail(dn)"
                >
                  <view class="envelope-stamp-box">
                    <image class="letter-avatar" :src="dn.senderAvatar" mode="aspectFill" />
                    <view v-if="dn.isSealed" class="real-wax-seal">印</view>
                  </view>
                  <view class="envelope-body">
                    <view class="env-top">
                      <text class="env-sender">{{ dn.senderName }}</text>
                      <text class="env-time">{{ dn.receivedTime }}</text>
                    </view>
                    <text class="env-preview">{{ dn.preview }}</text>
                  </view>
                  <view class="env-open-arrow">›</view>
                </view>
              </scroll-view>
            </view>
          </view>

          <!-- 桌面底部快捷操作条 (高出 TabBar 充足高度，100% 杜绝遮挡) -->
          <view class="desk-action-dock">
            <button class="cozy-dock-btn post-btn" @tap="openHandwritingPad">
              <text class="dock-btn-icon">✍️</text>
              <text class="dock-btn-label">{{ isVisitingOther ? '在TA窗台写便签' : '手写便签贴窗台' }}</text>
            </button>
            <button v-if="isVisitingOther" class="cozy-dock-btn send-btn" @tap="openSendPaperToUser">
              <text class="dock-btn-icon">✉️</text>
              <text class="dock-btn-label">给TA塞小纸条</text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 真实手写笔迹画板组件 (Handwriting Canvas) -->
    <HandwritingPad
      v-if="handwritingPadVisible"
      actionConfirmText="💌 折起贴上窗台"
      defaultPattern="yellow"
      @confirm="onHandwritingConfirmed"
      @close="handwritingPadVisible = false"
    />

    <!-- 装扮皮肤切换浮窗 -->
    <view v-if="themeSelectorVisible" class="theme-selector-pop">
      <view class="theme-pop-header">
        <text class="pop-title">切换桌洞书桌风格</text>
        <text class="pop-close" @tap="themeSelectorVisible = false">✕</text>
      </view>
      <view class="theme-options">
        <view
          v-for="t in themeList"
          :key="t.key"
          class="theme-chip"
          :class="{ 'chip-active': currentDesk.theme === t.key }"
          @tap="selectTheme(t.key)"
        >
          <text class="theme-chip-icon">{{ t.icon }}</text>
          <text class="theme-chip-label">{{ t.name }}</text>
        </view>
      </view>
    </view>

    <!-- 弹窗：生活回忆录日记本 (Diary Book Modal) -->
    <view v-if="diaryModalVisible" class="desk-modal-mask" @tap.self="diaryModalVisible = false">
      <view class="diary-book-wrapper">
        <view class="diary-header">
          <text class="diary-book-title">📖 生活回忆录 · 手账足迹</text>
          <text class="modal-close-btn" @tap="diaryModalVisible = false">✕</text>
        </view>
        <scroll-view scroll-y class="diary-scroll">
          <view v-for="d in currentDesk.diaryEntries" :key="d.id" class="diary-entry-card" :class="'paper-' + d.color">
            <view class="diary-date-row">
              <text class="diary-date">{{ d.dateStr }}</text>
              <text class="diary-loc">📍 {{ d.locationName }}</text>
            </view>
            <text class="diary-title">{{ d.title }}</text>
            <text class="diary-body">{{ d.content }}</text>
            <view class="diary-tag-box">
              <text class="diary-tag"># {{ d.tag }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { DeskTheme, NotePaperColor } from "../../types";
import {
  getMyDeskData,
  saveMyDeskData,
  getOtherUserDeskData,
  postWindowNote,
  DeskHoleData,
  WindowNoteItem,
  DrawerSecretNote
} from "../../services/deskService";
import { useAppState } from "../../composables/useAppState";
import HandwritingPad from "../common/HandwritingPad.vue";

const { statusBarHeight, openChatWithFriend, getFriendsList } = useAppState();

const currentDesk = ref<DeskHoleData>(getMyDeskData());
const isVisitingOther = ref(false);

const isDrawerPulled = ref(false);
const drawerDragY = ref(0);
let isDraggingDrawer = false;
let startDragY = 0;

const themeSelectorVisible = ref(false);
const diaryModalVisible = ref(false);
const handwritingPadVisible = ref(false);
const isFoldingFlying = ref(false);
const peelingNoteId = ref<string | null>(null);

const themeList = [
  { key: "wood" as DeskTheme, name: "温暖橡木", icon: "🪵" },
  { key: "cherry" as DeskTheme, name: "樱花手账", icon: "🌸" },
  { key: "retro" as DeskTheme, name: "复古墨绿", icon: "🌲" },
  { key: "modern" as DeskTheme, name: "极简素白", icon: "☁️" }
];

const weatherIcon = computed(() => {
  switch (currentDesk.value.weather) {
    case "sunny": return "☀️";
    case "rainy": return "🌧️";
    case "night": return "🌙";
    default: return "⛅";
  }
});

const weatherLabel = computed(() => {
  switch (currentDesk.value.weather) {
    case "sunny": return "午后暖阳";
    case "rainy": return "窗前细雨";
    case "night": return "星空静谧";
    default: return "晴间多云";
  }
});

function cycleWeather() {
  const weathers: DeskHoleData["weather"][] = ["sunny", "rainy", "night", "cloudy"];
  const currIdx = weathers.indexOf(currentDesk.value.weather);
  const next = weathers[(currIdx + 1) % weathers.length];
  currentDesk.value.weather = next;
  saveMyDeskData(currentDesk.value);
}

function selectTheme(theme: DeskTheme) {
  currentDesk.value.theme = theme;
  saveMyDeskData(currentDesk.value);
  themeSelectorVisible.value = false;
}

function exitVisiting() {
  currentDesk.value = getMyDeskData();
  isVisitingOther.value = false;
}

// 触摸/拖拽抽屉物理机制
function onDrawerTouchStart(e: any) {
  isDraggingDrawer = true;
  startDragY = e.touches[0].clientY;
}

function onDrawerTouchMove(e: any) {
  if (!isDraggingDrawer) return;
  const currentY = e.touches[0].clientY;
  const diff = currentY - startDragY;
  if (!isDrawerPulled.value) {
    drawerDragY.value = Math.max(0, Math.min(80, diff));
  } else {
    drawerDragY.value = Math.max(-80, Math.min(0, diff));
  }
}

function onDrawerTouchEnd() {
  if (!isDraggingDrawer) return;
  isDraggingDrawer = false;
  if (!isDrawerPulled.value) {
    if (drawerDragY.value > 25) {
      isDrawerPulled.value = true;
      uni.showToast({ title: "抽屉已滑开 📬", icon: "none" });
    }
  } else {
    if (drawerDragY.value < -25) {
      isDrawerPulled.value = false;
    }
  }
  drawerDragY.value = 0;
}

// 电脑端鼠标拖拽支持
function onDrawerMouseDown(e: MouseEvent) {
  isDraggingDrawer = true;
  startDragY = e.clientY;
  const onMouseMove = (ev: MouseEvent) => {
    if (!isDraggingDrawer) return;
    const diff = ev.clientY - startDragY;
    if (!isDrawerPulled.value) {
      drawerDragY.value = Math.max(0, Math.min(80, diff));
    } else {
      drawerDragY.value = Math.max(-80, Math.min(0, diff));
    }
  };
  const onMouseUp = () => {
    isDraggingDrawer = false;
    if (!isDrawerPulled.value) {
      if (drawerDragY.value > 25) {
        isDrawerPulled.value = true;
        uni.showToast({ title: "抽屉已滑开 📬", icon: "none" });
      }
    } else {
      if (drawerDragY.value < -25) {
        isDrawerPulled.value = false;
      }
    }
    drawerDragY.value = 0;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}

function toggleDrawerPull() {
  isDrawerPulled.value = !isDrawerPulled.value;
  drawerDragY.value = 0;
  if (isDrawerPulled.value) {
    uni.showToast({ title: "抽屉已滑开 📬", icon: "none" });
  }
}

function closeDrawer() {
  isDrawerPulled.value = false;
  drawerDragY.value = 0;
}

// 撕取并检视便签 (带物理剥离微翘动画)
function peelAndInspectNote(note: WindowNoteItem) {
  peelingNoteId.value = note.id;
  setTimeout(() => {
    peelingNoteId.value = null;
  }, 400);

  note.likes += 1;
  uni.showToast({ title: "轻轻撕角揭开 · 为便签点赞 ❤️", icon: "none" });
  saveMyDeskData(currentDesk.value);
}

function isHandwritingImg(content: string): boolean {
  return content.startsWith("data:image/") || content.startsWith("http");
}

function openHandwritingPad() {
  handwritingPadVisible.value = true;
}

// 确认手写真迹便签
function onHandwritingConfirmed(dataUrl: string) {
  handwritingPadVisible.value = false;
  isFoldingFlying.value = true;

  // 播放折纸飞机飞向窗台动画
  setTimeout(() => {
    isFoldingFlying.value = false;
    const note = postWindowNote(currentDesk.value.ownerId, dataUrl, "yellow");
    currentDesk.value.windowNotes.unshift(note);
    uni.showToast({ title: "手写纸条已折起，贴上窗台！✨", icon: "success" });
  }, 1000);
}

function openDrawerNoteDetail(dn: DrawerSecretNote) {
  dn.read = true;
  uni.showModal({
    title: `来自 ${dn.senderName} 的私信纸条`,
    content: dn.fullContent,
    showCancel: false,
    confirmText: "收回抽屉"
  });
}

function openSendPaperToUser() {
  const friends = getFriendsList();
  const f = friends.find(item => item.userId === currentDesk.value.ownerId) || friends[0];
  if (f) {
    openChatWithFriend(f);
  }
}

function visitUserDesk(userId: string, name: string, avatar: string) {
  currentDesk.value = getOtherUserDeskData(userId, name, avatar);
  isVisitingOther.value = true;
}

defineExpose({
  visitUserDesk
});
</script>

<style lang="scss" scoped>
.desk-hole-container {
  width: 100%;
  height: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  /* 严格预留底部 TabBar（56px + 安全区）的高度，彻底告别遮盖 */
  padding-bottom: calc(58px + env(safe-area-inset-bottom, 0px));
  background: #2b1f1d;
  color: #333;
}

.theme-wood   { background: #3b2823; }
.theme-cherry { background: #45242d; }
.theme-retro  { background: #1a2f26; }
.theme-modern { background: #232a35; }

/* 顶部信息条 */
.desk-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  z-index: 25;
}

.desk-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.owner-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #ffd54f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.owner-meta {
  display: flex;
  flex-direction: column;
}

.owner-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.owner-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.desk-tag {
  font-size: 10px;
  background: rgba(255, 213, 79, 0.25);
  color: #ffd54f;
  border: 0.5px solid #ffd54f;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.owner-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
}

.desk-actions-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-pill-btn {
  background: rgba(255, 255, 255, 0.18);
  border: 0.5px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.theme-btn {
  background: rgba(255, 183, 77, 0.3);
  border-color: #ffb74d;
  color: #ffe0b2;
}

/* 主视口 */
.desk-scene-viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 1. 吉卜力治愈窗户 */
.ghibli-window {
  flex: 1.15;
  position: relative;
  margin: 8px 12px 0;
  border-radius: 16px 16px 0 0;
  border: 6px solid #6d4c41;
  border-bottom: 8px solid #5d4037;
  overflow: hidden;
  box-shadow: inset 0 0 25px rgba(0, 0, 0, 0.45);
}

.weather-sunny .sky-scenery {
  background: linear-gradient(180deg, #64b5f6 0%, #bbdefb 50%, #fff9c4 85%, #dcedc8 100%);
}

.weather-night .sky-scenery {
  background: linear-gradient(180deg, #0d1b2a 0%, #1b263b 50%, #415a77 100%);
}

.weather-rainy .sky-scenery {
  background: linear-gradient(180deg, #455a64 0%, #607d8b 55%, #90a4ae 100%);
}

.weather-cloudy .sky-scenery {
  background: linear-gradient(180deg, #90caf9 0%, #e3f2fd 55%, #f1f8e9 100%);
}

.sky-scenery {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.sun-glow {
  position: absolute;
  top: 18px;
  right: 32px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff59d;
  box-shadow: 0 0 35px #fff176, 0 0 60px rgba(255, 238, 88, 0.6);
}

.sun-flare-rays {
  position: absolute;
  top: 0;
  right: 0;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle at top right, rgba(255, 245, 157, 0.35) 0%, transparent 70%);
  pointer-events: none;
}

.crescent-moon {
  position: absolute;
  top: 22px;
  right: 36px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  box-shadow: 5px 5px 0 0 #fff9c4;
}

.star {
  position: absolute;
  color: #fff9c4;
  font-size: 10px;
  opacity: 0.8;
  animation: star-blink 2s infinite ease-in-out alternate;
}

.star-1 { top: 25px; left: 40px; }
.star-2 { top: 60px; left: 120px; animation-delay: 0.8s; }
.star-3 { top: 35px; right: 90px; animation-delay: 1.4s; }

@keyframes star-blink {
  0% { opacity: 0.3; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.15); }
}

.rain-canvas {
  position: absolute;
  inset: 0;
}

.rain-line {
  position: absolute;
  top: -20px;
  width: 1.5px;
  height: 22px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.7));
  animation: rain-fall 0.75s linear infinite;
}

@keyframes rain-fall {
  to { transform: translateY(260px); }
}

.soft-cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.45);
  border-radius: 20px;
  filter: blur(4px);
}

.cloud-1 {
  top: 45px;
  left: 20px;
  width: 90px;
  height: 26px;
}

.cloud-2 {
  top: 70px;
  right: 40px;
  width: 70px;
  height: 20px;
}

.distant-landscape {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35px;
  background: linear-gradient(to top, rgba(104, 159, 56, 0.45), transparent);
}

/* 折纸飞机飞行动画 */
.paper-airplane-anim {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: airplane-soar 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

.airplane-body {
  font-size: 38px;
}

.airplane-trail {
  font-size: 11px;
  color: #fff;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 4px;
}

@keyframes airplane-soar {
  0% { transform: translate(-50%, 40px) scale(0.5); opacity: 0; }
  50% { transform: translate(-50%, -60px) scale(1.2); opacity: 1; }
  100% { transform: translate(-20%, -140px) scale(0.8); opacity: 0; }
}

/* 窗帘 */
.sheer-curtain {
  position: absolute;
  top: 0;
  bottom: 24px;
  width: 32px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.15));
  backdrop-filter: blur(1px);
  z-index: 3;
  pointer-events: none;
}

.curtain-left {
  left: 0;
  border-radius: 0 16px 16px 0;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.08);
}

.curtain-right {
  right: 0;
  border-radius: 16px 0 0 16px;
  box-shadow: -4px 0 10px rgba(0, 0, 0, 0.08);
}

/* 窗框木条 */
.window-wood-frame {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.crossbar-h {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background: #6d4c41;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.crossbar-v {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #6d4c41;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.3);
}

/* 便签流 */
.window-notes-stream {
  position: absolute;
  inset: 8px 14px 28px 14px;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  overflow-y: auto;
  align-content: flex-start;
}

.washi-sticky-note {
  width: 96px;
  min-height: 76px;
  border-radius: 4px;
  padding: 8px;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.note-peeling {
  transform: rotate(-10deg) scale(1.15) !important;
  box-shadow: 6px 12px 20px rgba(0, 0, 0, 0.35) !important;
}

.washi-tape-strip {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 38px;
  height: 10px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  border-left: 1px dashed rgba(0, 0, 0, 0.2);
  border-right: 1px dashed rgba(0, 0, 0, 0.2);
}

.paper-yellow { background: #fff9c4; color: #4e342e; }
.paper-pink   { background: #fce4ec; color: #4a148c; }
.paper-blue   { background: #e1f5fe; color: #01579b; }
.paper-green  { background: #e8f5e9; color: #1b5e20; }
.paper-kraft  { background: #efebe9; color: #3e2723; }

.note-author-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
  margin-top: 3px;
  font-weight: 700;
  opacity: 0.85;
}

.note-author-txt {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
}

.handwritten-note-img {
  width: 100%;
  height: 44px;
  margin-top: 4px;
  border-radius: 2px;
}

.note-body-txt {
  font-size: 10px;
  line-height: 1.35;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.window-shelf {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: #5d4037;
  border-top: 2px solid #795548;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.25);
}

.shelf-left-item, .shelf-right-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-emoji {
  font-size: 15px;
}

.shelf-label {
  font-size: 9px;
  color: #d7ccc8;
  font-weight: 500;
}

.coffee-steaming {
  position: relative;
  display: flex;
  align-items: center;
}

.coffee-cup {
  font-size: 15px;
}

.steam {
  position: absolute;
  top: -8px;
  width: 4px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  filter: blur(1px);
  animation: steam-rise 1.5s infinite ease-out;
}

.steam-1 { left: 4px; }
.steam-2 { left: 10px; animation-delay: 0.7s; }

@keyframes steam-rise {
  0% { transform: translateY(0) scale(0.8); opacity: 0.7; }
  100% { transform: translateY(-10px) scale(1.4); opacity: 0; }
}

/* 2. 实木写字台面与实体滑动抽屉 */
.solid-wood-desk {
  flex: 0.95;
  background: linear-gradient(180deg, #8d6e63 0%, #6d4c41 60%, #4e342e 100%);
  border-top: 6px solid #a1887f;
  box-shadow: inset 0 8px 16px rgba(0, 0, 0, 0.35);
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 窗外阳光漫射在桌面的柔和光束 */
.desk-sunlight-beam {
  position: absolute;
  top: -40px;
  left: 20%;
  width: 140px;
  height: 220px;
  background: linear-gradient(135deg, rgba(255, 249, 196, 0.28) 0%, rgba(255, 238, 88, 0.08) 60%, transparent 100%);
  transform: rotate(-25deg);
  pointer-events: none;
  filter: blur(8px);
  z-index: 2;
}

.desk-linen-mat {
  background: rgba(255, 248, 240, 0.95);
  border-radius: 12px;
  padding: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  border: 1px solid #d7ccc8;
  position: relative;
  z-index: 3;
}

.desk-items-row {
  display: flex;
  gap: 10px;
}

.vintage-journal-book {
  flex: 1.3;
  background: linear-gradient(135deg, #4e342e 0%, #3e2723 60%, #2e1c18 100%);
  border-radius: 6px 10px 10px 6px;
  padding: 10px 12px 10px 18px;
  display: flex;
  align-items: center;
  position: relative;
  box-shadow: 3px 5px 12px rgba(0, 0, 0, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  overflow: hidden;

  &:active {
    transform: scale(0.97);
  }
}

/* 书脊皮革包边与金属暗纹 */
.journal-spine-leather {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 10px;
  background: linear-gradient(90deg, #6d4c41 0%, #8d6e63 50%, #4e342e 100%);
  border-right: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.25);
}

/* 缝合线质感 */
.journal-stitch-line {
  position: absolute;
  left: 13px;
  top: 4px;
  bottom: 4px;
  width: 1px;
  border-left: 1px dashed rgba(255, 213, 79, 0.4);
}

/* 侧边多层做旧米色纸张层叠效果 */
.deckled-pages-edge {
  position: absolute;
  right: 0;
  top: 3px;
  bottom: 3px;
  width: 5px;
  background: repeating-linear-gradient(
    180deg,
    #fff8e1,
    #fff8e1 1.5px,
    #d7ccc8 1.5px,
    #d7ccc8 3px
  );
  border-radius: 0 4px 4px 0;
  box-shadow: inset 1px 0 2px rgba(0, 0, 0, 0.25);
}

.journal-ribbon {
  position: absolute;
  top: 0;
  right: 18px;
  width: 8px;
  height: 22px;
  background: linear-gradient(180deg, #d32f2f, #b71c1c);
  border-radius: 0 0 3px 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.journal-cover-title {
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.journal-icon {
  font-size: 20px;
}

.journal-txt {
  font-size: 13px;
  font-weight: 700;
  color: #fff8e1;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
  margin-top: 2px;
}

.journal-meta {
  font-size: 10px;
  color: #ffe082;
  margin-top: 2px;
  opacity: 0.9;
}

.desk-pen-caddy {
  flex: 0.9;
  background: linear-gradient(135deg, #fffde7 0%, #fff9c4 100%);
  border-radius: 10px;
  padding: 10px;
  border: 1px solid #ffd54f;
  box-shadow: 2px 3px 10px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  cursor: pointer;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.97);
  }
}

.pen-caddy-brim {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ffa000, #ffd54f, #ffa000);
  border-radius: 10px 10px 0 0;
}

.caddy-icon {
  font-size: 22px;
}

.caddy-meta {
  display: flex;
  flex-direction: column;
}

.caddy-title {
  font-size: 12px;
  font-weight: 700;
  color: #e65100;
}

.caddy-tip {
  font-size: 9px;
  color: #bf360c;
  margin-top: 1px;
}

/* 🗄️ 方式一：跟手拖拽物理抽屉 */
.physical-drawer-unit {
  margin-top: 8px;
  border-radius: 10px;
  background: #5d4037;
  box-shadow: inset 0 4px 10px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.2);
  padding: 5px;
  transition: background 0.3s;
}

.drawer-face-panel {
  background: linear-gradient(180deg, #8d6e63 0%, #795548 50%, #5d4037 100%);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.35);
  border: 1px solid #a1887f;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: space-between;
  user-select: none;
  touch-action: none;
  transition: transform 0.1s ease-out;

  &:active {
    cursor: grabbing;
  }
}

.brass-handle-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 黄铜立体拉手 */
.brass-curved-pull {
  width: 26px;
  height: 12px;
  border-radius: 0 0 13px 13px;
  border: 3.5px solid;
  border-color: #ffd54f #ffb300 #ff8f00 #ffd54f;
  border-top: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6);
  position: relative;

  &::before, &::after {
    content: "";
    position: absolute;
    top: -3px;
    width: 6px;
    height: 4px;
    background: #ffd54f;
    border-radius: 2px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  &::before { left: -4px; }
  &::after { right: -4px; }
}

.brass-label-plate {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.2);
  padding: 3px 8px;
  border-radius: 6px;
  border: 0.5px solid rgba(255, 213, 79, 0.3);
}

.drawer-plate-text {
  font-size: 12px;
  font-weight: 700;
  color: #fff9c4;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.drawer-count-badge {
  font-size: 9px;
  background: linear-gradient(135deg, #e65100, #bf360c);
  color: #fff;
  padding: 1px 6px;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.drawer-pull-hint .hint-arrow {
  font-size: 10px;
  color: #ffe082;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.drawer-inner-compartment {
  margin-top: 6px;
  background: #2e151b; /* 暗红色复古丝绒内衬 */
  border-radius: 6px;
  padding: 8px 10px;
  box-shadow: inset 0 6px 14px rgba(0, 0, 0, 0.7);
  animation: drawer-slide-down 0.25s ease-out;
  border: 1px solid rgba(255, 213, 79, 0.15);
}

@keyframes drawer-slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.compartment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 6px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.15);
}

.comp-title {
  font-size: 11px;
  color: #ffe082;
  font-weight: 600;
}

.comp-close {
  font-size: 10px;
  color: #bcaaa4;
  padding: 2px 6px;
  cursor: pointer;
}

.drawer-letters-scroll {
  max-height: 120px;
  margin-top: 6px;
}

.drawer-empty-state {
  padding: 16px;
  text-align: center;
  color: #bcaaa4;
  font-size: 11px;
}

.drawer-letter-envelope {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #5d4037;
  border-radius: 6px;
  padding: 6px 8px;
  margin-bottom: 6px;
  border: 0.5px solid #795548;
  cursor: pointer;
}

.envelope-stamp-box {
  position: relative;
}

.letter-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.real-wax-seal {
  position: absolute;
  bottom: -3px;
  right: -3px;
  background: #c62828;
  color: #fff;
  font-size: 8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.envelope-body {
  flex: 1;
}

.env-top {
  display: flex;
  justify-content: space-between;
}

.env-sender {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

.env-time {
  font-size: 9px;
  color: #d7ccc8;
}

.env-preview {
  font-size: 10px;
  color: #ffcc80;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 2px;
}

.env-open-arrow {
  color: #ffb74d;
  font-size: 14px;
}

/* 底部防遮盖快捷操作条 */
.desk-action-dock {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  padding-bottom: 2px;
}

.cozy-dock-btn {
  flex: 1;
  height: 38px;
  border-radius: 20px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
  cursor: pointer;
}

.post-btn {
  background: linear-gradient(135deg, #ff9800 0%, #e65100 100%);
  color: #fff;
}

.send-btn {
  background: linear-gradient(135deg, #43a047 0%, #1b5e20 100%);
  color: #fff;
}

.dock-btn-icon {
  font-size: 15px;
}

.dock-btn-label {
  line-height: 1;
}

/* 弹窗通用 */
.desk-modal-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(5px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.diary-book-wrapper {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.diary-header {
  padding: 12px 16px;
  background: #fdfaf6;
  border-bottom: 1px solid #ebd9c5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  color: #4e342e;
}

.modal-close-btn {
  font-size: 16px;
  color: #999;
  padding: 4px 8px;
}

.diary-scroll {
  padding: 12px;
  max-height: 55vh;
  box-sizing: border-box;
}

.diary-entry-card {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.diary-date-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  opacity: 0.75;
  margin-bottom: 4px;
}

.diary-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
  display: block;
}

.diary-body {
  font-size: 12px;
  line-height: 1.5;
  display: block;
}

.diary-tag-box {
  margin-top: 6px;
}

.diary-tag {
  font-size: 10px;
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
}

.theme-selector-pop {
  position: absolute;
  top: 65px;
  right: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  z-index: 50;
  width: 170px;
}

.theme-pop-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.theme-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  background: #f7f7f7;
}

.chip-active {
  background: #fff3e0;
  color: #e65100;
  font-weight: 700;
}
</style>
