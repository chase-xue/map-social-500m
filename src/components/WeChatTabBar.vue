<template>
  <view class="wechat-tab-bar">
    <!-- 1. 聊天 (微信) -->
    <view
      class="tab-bar-item"
      :class="{ 'item-active': mainTab === 'chats' }"
      @tap="switchMainTab('chats')"
    >
      <view class="icon-box">
        <!-- 微信双对话气泡 SVG -->
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.5 3C5.36 3 2 5.91 2 9.5c0 1.98.98 3.75 2.53 4.96-.11.75-.43 2.05-1.28 3.12-.11.14-.06.34.11.41.36.14 1.83.61 3.79-.53.76.24 1.57.37 2.42.37.28 0 .56-.02.83-.05C10.15 17.15 10 16.35 10 15.5c0-3.59 3.36-6.5 7.5-6.5.52 0 1.02.05 1.5.14C18.66 5.56 14.47 3 9.5 3zm-2.25 5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm4.5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM17.5 10.5c-3.59 0-6.5 2.46-6.5 5.5 0 1.68.86 3.19 2.21 4.22-.1.64-.38 1.74-1.12 2.65-.09.12-.05.29.1.35.31.12 1.56.52 3.23-.45.65.2 1.34.31 2.08.31 3.59 0 6.5-2.46 6.5-5.5s-2.91-5.5-6.5-5.5zm-2 4.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
        <view v-if="unreadChatsCount > 0" class="wechat-badge">
          {{ unreadChatsCount > 99 ? '99+' : unreadChatsCount }}
        </view>
      </view>
      <text class="tab-label">聊天</text>
    </view>

    <!-- 2. 通讯录 -->
    <view
      class="tab-bar-item"
      :class="{ 'item-active': mainTab === 'contacts' }"
      @tap="switchMainTab('contacts')"
    >
      <view class="icon-box">
        <!-- 微信通讯录 / 名片夹 SVG -->
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V18z"/>
        </svg>
        <view v-if="pendingFriendsCount > 0" class="wechat-badge">
          {{ pendingFriendsCount }}
        </view>
      </view>
      <text class="tab-label">通讯录</text>
    </view>

    <!-- 3. 地图 (500米圈) -->
    <view
      class="tab-bar-item"
      :class="{ 'item-active': mainTab === 'map' }"
      @tap="switchMainTab('map')"
    >
      <view class="icon-box">
        <!-- 地图 / 发现指南针雷达 SVG -->
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.19l-4.5 1.5 1.5-4.5 4.5-1.5-1.5 4.5zm1.5-6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
        </svg>
        <view v-if="visibleStatuses.length > 0 && mainTab !== 'map'" class="wechat-badge">
          {{ visibleStatuses.length }}
        </view>
      </view>
      <text class="tab-label">地图</text>
    </view>

    <!-- 4. 我 -->
    <view
      class="tab-bar-item"
      :class="{ 'item-active': mainTab === 'me' }"
      @tap="switchMainTab('me')"
    >
      <view class="icon-box">
        <!-- 微信用户剪影 SVG -->
        <svg class="tab-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
        <view v-if="hasActiveEmergency" class="wechat-dot" />
      </view>
      <text class="tab-label">我</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";
const {
  mainTab, switchMainTab, unreadChatsCount, pendingFriendsCount,
  visibleStatuses, hasActiveEmergency
} = useAppState();
</script>

<style lang="scss" scoped>
.wechat-tab-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(52px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background-color: #f7f7f7;
  border-top: 0.5px solid #dcdcdc;
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 60;
  box-sizing: border-box;

  .tab-bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #191919;
    cursor: pointer;
    transition: color 0.15s ease;
    user-select: none;

    .icon-box {
      position: relative;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;

      .tab-icon {
        width: 24px;
        height: 24px;
        transition: transform 0.15s ease;
      }

      .wechat-badge {
        position: absolute;
        top: -4px;
        right: -8px;
        background-color: #fa5151;
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        min-width: 16px;
        height: 16px;
        line-height: 16px;
        padding: 0 4px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      }

      .wechat-dot {
        position: absolute;
        top: 0px;
        right: -2px;
        width: 8px;
        height: 8px;
        background-color: #fa5151;
        border-radius: 50%;
      }
    }

    .tab-label {
      font-size: 10px;
      margin-top: 3px;
      line-height: 1;
      font-weight: 500;
    }

    &.item-active {
      color: #07c160;

      .tab-icon {
        transform: scale(1.05);
      }

      .tab-label {
        font-weight: 600;
      }
    }
  }
}
</style>
