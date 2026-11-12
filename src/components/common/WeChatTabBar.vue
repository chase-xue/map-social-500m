<template>
  <view class="note-tab-bar">
    <!-- 1. 小便签 (首页高德地图与附近便签) -->
    <view
      class="tab-bar-item"
      :class="{ 'item-active': mainTab === 'map' || mainTab === 'notes' }"
      @tap="switchMainTab('map')"
    >
      <view class="icon-box">
        <!-- 小便签便贴图标 -->
        <svg class="tab-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10l6-6V5c0-1.1-.9-2-2-2zm-5 15.5V14h4.5L14 18.5zM17 11H7V9h10v2zm-4-4H7V5h6v2z"/>
        </svg>
        <view v-if="visibleStatuses.length > 0 && mainTab !== 'map' && mainTab !== 'notes'" class="note-badge">
          {{ visibleStatuses.length }}
        </view>
      </view>
      <text class="tab-label">小便签</text>
    </view>

    <!-- 2. 小纸条 (慢节奏聊天) -->
    <view
      class="tab-bar-item"
      :class="{ 'item-active': mainTab === 'chats' || mainTab === 'slowNotes' }"
      @tap="switchMainTab('slowNotes')"
    >
      <view class="icon-box">
        <!-- 折叠小纸条/信封纸飞机图标 -->
        <svg class="tab-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
        <view v-if="unreadChatsCount > 0" class="note-badge">
          {{ unreadChatsCount > 99 ? '99+' : unreadChatsCount }}
        </view>
      </view>
      <text class="tab-label">小纸条</text>
    </view>

    <!-- 3. 小刷子 (居中拟物化毛刷发布键) -->
    <view class="tab-bar-center" @tap="triggerBrushPublish">
      <view class="brush-circle-btn">
        <text class="brush-icon">🖌️</text>
      </view>
      <text class="center-label">小刷子</text>
    </view>

    <!-- 4. 我的桌洞 (面对窗户的写字台拟物空间) -->
    <view
      class="tab-bar-item"
      :class="{ 'item-active': mainTab === 'deskHole' }"
      @tap="switchMainTab('deskHole')"
    >
      <view class="icon-box">
        <!-- 书桌/抽屉桌洞图标 -->
        <svg class="tab-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 18v-1c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2v1H2v2h20v-2h-2zM4 7h16v6H4V7zm2 8h12v1H6v-1z"/>
        </svg>
      </view>
      <text class="tab-label">我的桌洞</text>
    </view>

    <!-- 5. 设置 / 成长 -->
    <view
      class="tab-bar-item"
      :class="{ 'item-active': mainTab === 'me' || mainTab === 'settings' }"
      @tap="switchMainTab('settings')"
    >
      <view class="icon-box">
        <!-- 徽章与个人中心图标 -->
        <svg class="tab-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </view>
      <text class="tab-label">设置</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../../composables/useAppState";

const {
  mainTab,
  switchMainTab,
  unreadChatsCount,
  visibleStatuses,
  openPublishSheet
} = useAppState();

function triggerBrushPublish() {
  openPublishSheet();
}
</script>

<style lang="scss" scoped>
.note-tab-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(56px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: rgba(254, 252, 248, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 0.5px solid rgba(215, 204, 196, 0.7);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 60;
  box-sizing: border-box;
  box-shadow: 0 -2px 14px rgba(62, 39, 35, 0.06);
}

.tab-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8d6e63;
  transition: all 0.2s cubic-bezier(0.25, 1, 0.5, 1);
  position: relative;
  cursor: pointer;

  &:active {
    transform: scale(0.95);
  }
}

.item-active {
  color: #d97706 !important;

  .tab-label {
    font-weight: 700;
    color: #b45309;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 3px);
    width: 14px;
    height: 3px;
    background: #d97706;
    border-radius: 2px;
  }
}

.icon-box {
  position: relative;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-svg {
  width: 21px;
  height: 21px;
  transition: transform 0.2s;
}

.tab-label {
  font-size: 10.5px;
  margin-top: 2px;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.note-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #ffffff;
  font-size: 10px;
  font-weight: bold;
  height: 16px;
  min-width: 16px;
  line-height: 16px;
  border-radius: 8px;
  text-align: center;
  padding: 0 4px;
  box-sizing: border-box;
  box-shadow: 0 2px 5px rgba(220, 38, 38, 0.35);
}

/* 居中小刷子突出按钮 */
.tab-bar-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  top: -14px;
  cursor: pointer;
}

.brush-circle-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 60%, #b45309 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(217, 119, 6, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.6);
  border: 3.5px solid #fefcf8;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.92);
  }
}

.brush-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
}

.center-label {
  font-size: 10.5px;
  color: #b45309;
  font-weight: 700;
  margin-top: 3px;
  letter-spacing: 0.3px;
}
</style>
