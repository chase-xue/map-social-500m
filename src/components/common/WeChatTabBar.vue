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
  background-color: #faf8f5;
  border-top: 0.5px solid #e0d8cc;
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 60;
  box-sizing: border-box;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.04);
}

.tab-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #8d6e63;
  transition: color 0.15s;
}

.item-active {
  color: #e67e22 !important;
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
  width: 22px;
  height: 22px;
}

.tab-label {
  font-size: 10px;
  margin-top: 3px;
  font-weight: 500;
}

.note-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background-color: #e74c3c;
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
  top: -12px;
}

.brush-circle-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff9f43, #e67e22);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(230, 126, 34, 0.45);
  border: 3px solid #faf8f5;
  transition: transform 0.15s;
}

.brush-circle-btn:active {
  transform: scale(0.92);
}

.brush-icon {
  font-size: 24px;
}

.center-label {
  font-size: 10px;
  color: #e67e22;
  font-weight: bold;
  margin-top: 2px;
}
</style>
