<template>
  <view class="universe-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 1. 顶栏：关注 | 小宇宙 | 漂流瓶 (复刻用户截图红框) -->
    <view class="universe-top-nav">
      <view class="top-nav-tabs">
        <view
          class="nav-tab"
          :class="{ 'tab-active': universeSubTab === 'moments' }"
          @tap="handleNavTab('moments')"
        >
          <text>关注</text>
        </view>
        <view
          class="nav-tab"
          :class="{ 'tab-active': universeSubTab === 'cosmos' }"
          @tap="handleNavTab('cosmos')"
        >
          <text>小宇宙</text>
        </view>
        <view
          class="nav-tab"
          :class="{ 'tab-active': universeSubTab === 'bottle' }"
          @tap="handleNavTab('bottle')"
        >
          <text>小纸条</text>
        </view>
      </view>

      <!-- 右上角贝壳金币 (复刻用户截图) -->
      <view class="shell-coin-box">
        <text class="shell-icon">🐚</text>
        <text class="shell-num">{{ shellCount }}</text>
      </view>
    </view>

    <!-- 2. 唯美海洋主场景 (复刻用户截图大红框) -->
    <view class="ocean-container">
      <!-- 天空飞翔海鸥 -->
      <view class="seagull seagull-1">🕊️</view>
      <view class="seagull seagull-2">🕊️</view>

      <!-- 白色旋转灯塔与灯光 -->
      <view class="lighthouse-glow" />
      <view class="lighthouse-tower" />

      <!-- 在线人数 (复刻用户截图: 197,582人在扔纸条) -->
      <view class="online-counter">
        <text class="counter-num">197,582</text>
        <text class="counter-label">人在发小纸条</text>
      </view>

      <!-- 海面波浪线 -->
      <view class="ocean-wave-glow" />

      <!-- 海面上漂浮的晶莹瓶子群 (真实复刻截图玻璃漂流瓶与信纸) -->
      <view class="drift-bottles-layer">
        <view class="ocean-bottle bottle-pos-1" @tap="handleOpenSpecificBottle(1)">
          <svg class="drift-bottle-svg" viewBox="0 0 60 70" fill="none">
            <rect x="25" y="4" width="10" height="7" rx="2" fill="#d97706" />
            <path d="M24 11 H36 V20 L44 28 C48 33 48 55 42 62 C37 67 23 67 18 62 C12 55 12 33 16 28 L24 20 Z" fill="rgba(255, 255, 255, 0.4)" stroke="rgba(255, 255, 255, 0.95)" stroke-width="2"/>
            <rect x="22" y="32" width="16" height="24" rx="3" fill="#fef08a" transform="rotate(-10 30 44)" />
            <line x1="25" y1="38" x2="35" y2="36" stroke="#ca8a04" stroke-width="1.5"/>
            <line x1="25" y1="44" x2="35" y2="42" stroke="#ca8a04" stroke-width="1.5"/>
            <path d="M18 32 C16 38 16 52 20 58" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="30" cy="65" rx="22" ry="4.5" fill="rgba(255, 255, 255, 0.28)" />
          </svg>
        </view>
        <view class="ocean-bottle bottle-pos-2" @tap="handleOpenSpecificBottle(2)">
          <svg class="drift-bottle-svg" viewBox="0 0 60 70" fill="none">
            <rect x="25" y="4" width="10" height="7" rx="2" fill="#d97706" />
            <path d="M24 11 H36 V20 L44 28 C48 33 48 55 42 62 C37 67 23 67 18 62 C12 55 12 33 16 28 L24 20 Z" fill="rgba(255, 255, 255, 0.4)" stroke="rgba(255, 255, 255, 0.95)" stroke-width="2"/>
            <rect x="22" y="32" width="16" height="24" rx="3" fill="#fbcfe8" transform="rotate(8 30 44)" />
            <line x1="25" y1="38" x2="35" y2="39" stroke="#db2777" stroke-width="1.5"/>
            <line x1="25" y1="44" x2="35" y2="45" stroke="#db2777" stroke-width="1.5"/>
            <path d="M18 32 C16 38 16 52 20 58" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="30" cy="65" rx="22" ry="4.5" fill="rgba(255, 255, 255, 0.28)" />
          </svg>
        </view>
        <view class="ocean-bottle bottle-pos-3" @tap="handleOpenSpecificBottle(3)">
          <svg class="drift-bottle-svg" viewBox="0 0 60 70" fill="none">
            <rect x="25" y="4" width="10" height="7" rx="2" fill="#d97706" />
            <path d="M24 11 H36 V20 L44 28 C48 33 48 55 42 62 C37 67 23 67 18 62 C12 55 12 33 16 28 L24 20 Z" fill="rgba(255, 255, 255, 0.4)" stroke="rgba(255, 255, 255, 0.95)" stroke-width="2"/>
            <rect x="22" y="32" width="16" height="24" rx="3" fill="#a7f3d0" transform="rotate(-6 30 44)" />
            <line x1="25" y1="38" x2="35" y2="37" stroke="#059669" stroke-width="1.5"/>
            <line x1="25" y1="44" x2="35" y2="43" stroke="#059669" stroke-width="1.5"/>
            <path d="M18 32 C16 38 16 52 20 58" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="30" cy="65" rx="22" ry="4.5" fill="rgba(255, 255, 255, 0.28)" />
          </svg>
        </view>
        <view class="ocean-bottle bottle-pos-4" @tap="handleOpenSpecificBottle(4)">
          <svg class="drift-bottle-svg" viewBox="0 0 60 70" fill="none">
            <rect x="25" y="4" width="10" height="7" rx="2" fill="#d97706" />
            <path d="M24 11 H36 V20 L44 28 C48 33 48 55 42 62 C37 67 23 67 18 62 C12 55 12 33 16 28 L24 20 Z" fill="rgba(255, 255, 255, 0.4)" stroke="rgba(255, 255, 255, 0.95)" stroke-width="2"/>
            <rect x="22" y="32" width="16" height="24" rx="3" fill="#bae6fd" transform="rotate(12 30 44)" />
            <line x1="25" y1="38" x2="35" y2="40" stroke="#0284c7" stroke-width="1.5"/>
            <line x1="25" y1="44" x2="35" y2="46" stroke="#0284c7" stroke-width="1.5"/>
            <path d="M18 32 C16 38 16 52 20 58" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="30" cy="65" rx="22" ry="4.5" fill="rgba(255, 255, 255, 0.28)" />
          </svg>
        </view>
        <view class="ocean-bottle bottle-pos-5" @tap="handleOpenSpecificBottle(5)">
          <svg class="drift-bottle-svg" viewBox="0 0 60 70" fill="none">
            <rect x="25" y="4" width="10" height="7" rx="2" fill="#d97706" />
            <path d="M24 11 H36 V20 L44 28 C48 33 48 55 42 62 C37 67 23 67 18 62 C12 55 12 33 16 28 L24 20 Z" fill="rgba(255, 255, 255, 0.4)" stroke="rgba(255, 255, 255, 0.95)" stroke-width="2"/>
            <rect x="22" y="32" width="16" height="24" rx="3" fill="#fed7aa" transform="rotate(-8 30 44)" />
            <line x1="25" y1="38" x2="35" y2="36" stroke="#ea580c" stroke-width="1.5"/>
            <line x1="25" y1="44" x2="35" y2="42" stroke="#ea580c" stroke-width="1.5"/>
            <path d="M18 32 C16 38 16 52 20 58" stroke="rgba(255, 255, 255, 0.9)" stroke-width="2.5" stroke-linecap="round"/>
            <ellipse cx="30" cy="65" rx="22" ry="4.5" fill="rgba(255, 255, 255, 0.28)" />
          </svg>
        </view>
      </view>

      <!-- 底部三大核心操作胶囊 (复刻用户截图红框) -->
      <view class="ocean-action-bar">
        <button class="action-btn btn-throw" @tap="openThrowBottleModal">
          <text class="btn-icon">🌊</text>
          <text class="btn-text">扔一个</text>
        </button>

        <button class="action-btn btn-fish" @tap="handleFishBottle">
          <view v-if="shellCount > 0" class="fish-bonus-tag">
            <text>赠送{{ shellCount }}次</text>
          </view>
          <text class="btn-icon">🔍</text>
          <text class="btn-text">随机捞</text>
        </button>

        <button class="action-btn btn-msg" @tap="bottleMsgModalVisible = true">
          <text class="btn-icon">💬</text>
          <text class="btn-text">消息</text>
        </button>
      </view>
    </view>

    <!-- 弹窗 1：写心愿小纸条 -->
    <view v-if="throwBottleModalVisible" class="bottle-modal-mask" @tap="closeThrowBottleModal(false)">
      <view class="letter-card-box" @tap.stop>
        <view class="card-header">
          <view class="header-title-row">
            <text class="title-icon">📜</text>
            <text class="title-text">写一张心愿小纸条</text>
          </view>
          <view class="close-x" @tap="closeThrowBottleModal(true)">✕</view>
        </view>

        <!-- 标签选择 -->
        <view class="tags-row">
          <view
            v-for="t in BOTTLE_TAGS"
            :key="t"
            class="tag-chip"
            :class="{ 'tag-active': selectedTag === t }"
            @tap="selectedTag = t"
          >
            <text>{{ t }}</text>
          </view>
        </view>

        <!-- 纸条输入区 -->
        <textarea
          class="letter-textarea"
          v-model="inputContent"
          placeholder="把你的心事、日常或寻觅搭子的愿望写在纸条上，折好投向大海..."
          maxlength="200"
        />

        <view class="modal-actions-row">
          <button class="btn-secondary" @tap="closeThrowBottleModal(true)">取消</button>
          <button class="btn-primary" @tap="confirmThrow">🌊 折好投进大海</button>
        </view>
      </view>
    </view>

    <!-- 弹窗 2：捞起小纸条展开阅读 -->
    <view v-if="readBottleModalVisible && fishedBottle" class="bottle-modal-mask" @tap="closeReadBottleModal">
      <view class="letter-card-box read-card" @tap.stop>
        <view class="card-header">
          <view class="header-title-row">
            <text class="title-icon">📜</text>
            <text class="title-text">{{ fishedBottle.userName }}的心情小纸条</text>
          </view>
          <view class="status-pill">{{ fishedBottle.tag }}</view>
        </view>

        <view class="letter-body-content">
          <text class="letter-text">{{ fishedBottle.content }}</text>
        </view>

        <view class="letter-meta-row">
          <text class="meta-item">📍 距你约 {{ fishedBottle.distanceMeters }} 米</text>
          <text class="meta-item">🌊 刚刚漂流过海域</text>
        </view>

        <!-- 回复输入区 -->
        <input
          v-if="isReplying"
          class="reply-input"
          v-model="replyText"
          placeholder="写下温暖回信..."
          focus
          @confirm="confirmReply"
        />

        <view class="modal-actions-row">
          <button class="btn-secondary" @tap="closeReadBottleModal">放回大海 🌊</button>
          <button class="btn-primary" @tap="confirmReply">
            {{ isReplying ? '发送回信 🕊️' : '💬 立即回信交流' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 弹窗 3：消息信箱列表 -->
    <view v-if="bottleMsgModalVisible" class="bottle-modal-mask" @tap="bottleMsgModalVisible = false">
      <view class="letter-card-box msg-list-card" @tap.stop>
        <view class="card-header">
          <view class="header-title-row">
            <text class="title-icon">📬</text>
            <text class="title-text">我的小纸条信箱</text>
          </view>
          <view class="close-x" @tap="bottleMsgModalVisible = false">✕</view>
        </view>

        <scroll-view scroll-y class="msg-list-scroll">
          <view v-if="allDriftBottles.length === 0" class="empty-tip">海面很静，还没有收到小纸条～</view>
          <view
            v-for="b in allDriftBottles"
            :key="b.id"
            class="msg-item"
            @tap="viewSpecificBottle(b)"
          >
            <view class="msg-author-row">
              <text class="msg-author">{{ b.userName }}</text>
              <text class="msg-tag">{{ b.tag }}</text>
            </view>
            <text class="msg-content">{{ b.content }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAppState } from '../../composables/useAppState';
import { DriftBottleItem } from '../../types';

const {
  statusBarHeight,
  universeSubTab,
  shellCount,
  allDriftBottles,
  fishedBottle,
  throwBottleModalVisible,
  readBottleModalVisible,
  bottleMsgModalVisible,
  openThrowBottleModal,
  closeThrowBottleModal,
  handleThrowBottle,
  handleFishBottle,
  closeReadBottleModal,
  handleReplyBottle,
  mapSubTab,
  switchMainTab,
} = useAppState();

function handleNavTab(tab: 'moments' | 'cosmos' | 'bottle') {
  if (tab === 'moments') {
    switchMainTab('map');
    mapSubTab.value = 'moments';
    return;
  }
  universeSubTab.value = tab;
  if (tab === 'cosmos') {
    uni.showToast({ title: '🌌 正在穿梭于星际小宇宙...', icon: 'none' });
  }
}

const BOTTLE_TAGS = ['💌 心事随想', '🌸 二次元安利', '☕ 周边交友', '🌟 盲盒心愿'];
const selectedTag = ref('💌 心事随想');
const inputContent = ref('');
const isReplying = ref(false);
const replyText = ref('');

function confirmThrow() {
  if (!inputContent.value.trim()) {
    uni.showToast({ title: '写点什么再投向大海吧～', icon: 'none' });
    return;
  }
  handleThrowBottle(inputContent.value, selectedTag.value);
  inputContent.value = '';
}

function handleOpenSpecificBottle(idx: number) {
  if (allDriftBottles.value.length > 0) {
    fishedBottle.value = allDriftBottles.value[idx % allDriftBottles.value.length];
    readBottleModalVisible.value = true;
    isReplying.value = false;
  }
}

function viewSpecificBottle(b: DriftBottleItem) {
  fishedBottle.value = b;
  bottleMsgModalVisible.value = false;
  readBottleModalVisible.value = true;
  isReplying.value = false;
}

function confirmReply() {
  if (!isReplying.value) {
    isReplying.value = true;
    return;
  }
  if (!replyText.value.trim()) {
    uni.showToast({ title: '请填写回信内容', icon: 'none' });
    return;
  }
  if (fishedBottle.value) {
    handleReplyBottle(fishedBottle.value.id, replyText.value);
    replyText.value = '';
    isReplying.value = false;
  }
}
</script>

<style lang="scss" scoped>
.universe-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #7fd3f7;
}

/* 顶栏 */
.universe-top-nav {
  height: 48px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.6) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 0.5px solid rgba(226, 232, 240, 0.8);
  z-index: 50;

  .top-nav-tabs {
    display: flex;
    align-items: center;
    gap: 20px;

    .nav-tab {
      font-size: 15px;
      color: #64748b;
      font-weight: 500;
      position: relative;
      cursor: pointer;
      padding: 4px 2px;

      &.tab-active {
        font-size: 17px;
        color: #0f172a;
        font-weight: 800;

        &::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 10%;
          width: 80%;
          height: 3px;
          background: #0284c7;
          border-radius: 2px;
        }
      }
    }
  }

  .shell-coin-box {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #e2e8f0;
    padding: 4px 12px;
    border-radius: 16px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

    .shell-icon { font-size: 14px; }
    .shell-num { font-size: 13px; font-weight: 800; color: #d97706; }
  }
}

/* 蔚蓝海洋主场景 */
.ocean-container {
  flex: 1;
  position: relative;
  background: linear-gradient(180deg, #bfe7fb 0%, #7fd3f7 32%, #38bdf8 62%, #0284c7 90%, #fef3c7 97%, #fde68a 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .seagull {
    position: absolute;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.85);
    animation: flySeagull 18s infinite linear;
  }
  .seagull-1 { top: 60px; }
  .seagull-2 { top: 110px; animation-delay: 9s; }

  @keyframes flySeagull {
    0% { transform: translate(-40px, 0) scale(0.7); }
    100% { transform: translate(420px, 40px) scale(0.9); }
  }

  .lighthouse-tower {
    position: absolute;
    top: 140px;
    right: 75px;
    width: 26px;
    height: 76px;
    background: linear-gradient(to right, #ffffff 45%, #cbd5e1 100%);
    clip-path: polygon(28% 0%, 72% 0%, 92% 100%, 8% 100%);
    opacity: 0.9;

    &::before {
      content: "";
      position: absolute;
      top: -6px;
      left: 3px;
      width: 20px;
      height: 8px;
      background: #ef4444;
      border-radius: 4px 4px 0 0;
    }
  }

  .lighthouse-glow {
    position: absolute;
    top: 136px;
    right: 70px;
    width: 65px;
    height: 25px;
    background: radial-gradient(circle, rgba(254, 240, 138, 0.7) 0%, rgba(254, 240, 138, 0) 80%);
    filter: blur(2px);
    animation: beaconFlash 3.5s infinite alternate ease-in-out;
  }

  @keyframes beaconFlash {
    0% { opacity: 0.3; transform: scale(0.8); }
    100% { opacity: 0.9; transform: scale(1.3); }
  }

  .online-counter {
    position: absolute;
    top: 155px;
    left: 20px;
    display: flex;
    align-items: baseline;
    gap: 8px;
    z-index: 10;

    .counter-num {
      font-size: 28px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .counter-label {
      font-size: 13px;
      color: #334155;
      font-weight: 600;
    }
  }

  .ocean-wave-glow {
    position: absolute;
    top: 45%;
    left: 0;
    right: 0;
    height: 40px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 20%, transparent 70%);
  }
}

/* 漂浮的玻璃瓶 */
.drift-bottles-layer {
  position: absolute;
  inset: 0;

  .ocean-bottle {
    position: absolute;
    cursor: pointer;
    transition: transform 0.2s;
    filter: drop-shadow(0 6px 14px rgba(2, 132, 199, 0.4));

    .bottle-emoji {
      display: block;
      font-size: 34px;
    }

    .drift-bottle-svg {
      width: 48px;
      height: 56px;
      display: block;
    }
  }

  .bottle-pos-1 { top: 220px; left: 80px; animation: floatAnim1 4.2s infinite ease-in-out; }
  .bottle-pos-2 { top: 230px; right: 65px; animation: floatAnim2 4.8s infinite ease-in-out 0.8s; }
  .bottle-pos-3 { top: 305px; left: 165px; animation: floatAnim1 5.2s infinite ease-in-out 1.5s; }
  .bottle-pos-4 { top: 335px; left: 60px; animation: floatAnim2 4s infinite ease-in-out 0.4s; }
  .bottle-pos-5 { top: 375px; right: 85px; animation: floatAnim1 4.5s infinite ease-in-out 2s; }
}

@keyframes floatAnim1 {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes floatAnim2 {
  0%, 100% { transform: translateY(0) rotate(8deg); }
  50% { transform: translateY(-12px) rotate(-4deg); }
}

/* 底部操作胶囊栏 (扔一个 / 随机捞 / 消息) */
.ocean-action-bar {
  position: absolute;
  bottom: calc(68px + env(safe-area-inset-bottom, 0px));
  left: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  z-index: 30;

  .action-btn {
    height: 48px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 15px;
    font-weight: 700;
    border: none;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
    overflow: visible;

    .btn-icon { font-size: 16px; }
    .btn-text { font-size: 15px; }

    &.btn-throw {
      flex: 1;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
    }

    &.btn-fish {
      flex: 1.25;
      background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
      color: #ffffff;
      position: relative;
      overflow: visible;
      box-shadow: 0 6px 18px rgba(234, 88, 12, 0.4);

      .fish-bonus-tag {
        position: absolute;
        top: -12px;
        right: 12px;
        background: #ef4444;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 12px;
        border: 2px solid #ffffff;
        line-height: 1.1;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        z-index: 10;
        pointer-events: none;
      }
    }

    &.btn-msg {
      flex: 1;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: #ffffff;
      box-shadow: 0 6px 18px rgba(59, 130, 246, 0.4);
    }
  }
}

/* 弹窗通用遮罩 */
.bottle-modal-mask {
  position: absolute;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(5px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.letter-card-box {
  width: 100%;
  max-width: 340px;
  background-color: #fffdf5;
  border-radius: 24px;
  border: 2px solid #fed7aa;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.25);
  padding: 24px 20px;
  box-sizing: border-box;
  animation: cardPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
      .title-icon { font-size: 18px; }
      .title-text { font-size: 16px; font-weight: 800; color: #7c2d12; }
    }

    .close-x {
      font-size: 18px;
      color: #9a3412;
      cursor: pointer;
      padding: 4px;
    }

    .status-pill {
      font-size: 11px;
      color: #ea580c;
      background: #ffedd5;
      padding: 2px 8px;
      border-radius: 8px;
      font-weight: 700;
    }
  }

  .tags-row {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
    flex-wrap: wrap;

    .tag-chip {
      font-size: 11px;
      padding: 4px 10px;
      background: #ffedd5;
      color: #c2410c;
      border-radius: 12px;
      cursor: pointer;

      &.tag-active {
        background: #ea580c;
        color: #ffffff;
        font-weight: 700;
      }
    }
  }

  .letter-textarea {
    width: 100%;
    height: 120px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px dashed #fdba74;
    border-radius: 12px;
    padding: 12px;
    font-size: 13px;
    color: #431407;
    margin-bottom: 16px;
    box-sizing: border-box;
  }

  .letter-body-content {
    background: rgba(255, 255, 255, 0.85);
    border-left: 3px solid #ea580c;
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 14px;

    .letter-text {
      font-size: 13px;
      color: #7c2d12;
      line-height: 1.6;
    }
  }

  .letter-meta-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #9a3412;
    margin-bottom: 16px;
  }

  .reply-input {
    width: 100%;
    height: 38px;
    background: #ffffff;
    border: 1px solid #fdba74;
    border-radius: 10px;
    padding: 0 12px;
    font-size: 12px;
    margin-bottom: 14px;
    box-sizing: border-box;
  }

  .modal-actions-row {
    display: flex;
    gap: 10px;

    .btn-secondary {
      flex: 1;
      height: 42px;
      background: #f1f5f9;
      color: #475569;
      font-size: 13px;
      font-weight: 600;
      border-radius: 21px;
      border: 1px solid #e2e8f0;
    }

    .btn-primary {
      flex: 1.5;
      height: 42px;
      background: #ea580c;
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      border-radius: 21px;
      border: none;
      box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35);
    }
  }
}

.msg-list-card {
  max-height: 70vh;
  display: flex;
  flex-direction: column;

  .msg-list-scroll {
    max-height: 50vh;

    .empty-tip {
      text-align: center;
      padding: 30px 0;
      font-size: 13px;
      color: #94a3b8;
    }

    .msg-item {
      background: #ffffff;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 10px;
      border: 1px solid #fed7aa;
      cursor: pointer;

      .msg-author-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        .msg-author { font-size: 13px; font-weight: 700; color: #7c2d12; }
        .msg-tag { font-size: 11px; color: #ea580c; }
      }

      .msg-content {
        font-size: 12px;
        color: #475569;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
      }
    }
  }
}

@keyframes cardPop {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
