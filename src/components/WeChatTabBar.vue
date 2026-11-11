<template>
  <view class="wechat-tab-bar">
    <!-- 1. 聊天 (微信) -->
    <view
      class="tab-bar-item"
      :class="{ 'item-active': mainTab === 'chats' }"
      @tap="switchMainTab('chats')"
    >
      <view class="icon-box">
        <!-- 聊天 Active 选中态: 微信官方实色气泡 -->
        <svg v-if="mainTab === 'chats'" class="tab-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.5 3C4.36 3 1 5.86 1 9.4c0 1.95.98 3.7 2.5 4.9L3 18.5l4.3-1.42c.38.1.78.16 1.2.16.27 0 .54-.03.8-.08A6.38 6.38 0 0 1 9 15.5c0-3.59 3.36-6.5 7.5-6.5.6 0 1.18.06 1.74.18C17.4 5.3 13.3 3 8.5 3zm-2.25 5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm4.5 0a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/>
          <path d="M16.5 10.5c-3.59 0-6.5 2.46-6.5 5.5 0 1.66.86 3.16 2.2 4.2L12 23l3.5-1.16c.32.1.66.16 1 .16 3.59 0 6.5-2.46 6.5-5.5s-2.91-5.5-6.5-5.5zm-2 4.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
        </svg>
        <!-- 聊天 Inactive 未选中态: 微信 8.0 线性优雅双气泡 -->
        <svg v-else class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.5 3C4.36 3 1 5.86 1 9.4c0 1.95.98 3.7 2.5 4.9L3 18.5l4.3-1.42c.38.1.78.16 1.2.16.27 0 .54-.03.8-.08A6.38 6.38 0 0 1 9 15.5c0-3.59 3.36-6.5 7.5-6.5.6 0 1.18.06 1.74.18C17.4 5.3 13.3 3 8.5 3z"/>
          <path d="M16.5 10.5c-3.59 0-6.5 2.46-6.5 5.5 0 1.66.86 3.16 2.2 4.2L12 23l3.5-1.16c.32.1.66.16 1 .16 3.59 0 6.5-2.46 6.5-5.5s-2.91-5.5-6.5-5.5z"/>
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
        <!-- 通讯录 Active 选中态: 微信官方实色通讯录 -->
        <svg v-if="mainTab === 'contacts'" class="tab-svg" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="2.5" width="14" height="19" rx="2"/>
          <circle cx="10" cy="9.5" r="2.5" fill="#f7f7f7"/>
          <path d="M6.5 16.5c0-1.8 1.6-3 3.5-3s3.5 1.2 3.5 3" fill="none" stroke="#f7f7f7" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="20" y1="6" x2="20" y2="8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="20" y1="10.5" x2="20" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="20" y1="15" x2="20" y2="17.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <!-- 通讯录 Inactive 未选中态: 微信官方线性通讯录 -->
        <svg v-else class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="3" width="13" height="18" rx="2"/>
          <circle cx="10.5" cy="9.5" r="2.5"/>
          <path d="M7 16c0-1.8 1.6-3 3.5-3s3.5 1.2 3.5 3"/>
          <line x1="20" y1="7" x2="20" y2="9"/>
          <line x1="20" y1="11" x2="20" y2="13"/>
          <line x1="20" y1="15" x2="20" y2="17"/>
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
        <!-- 地图 Active 选中态: 高光微信绿定位图钉 -->
        <svg v-if="mainTab === 'map'" class="tab-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
        </svg>
        <!-- 地图 Inactive 未选中态: 优雅线性定位图钉 -->
        <svg v-else class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
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
        <!-- 我 Active 选中态: 微信官方实色用户 -->
        <svg v-if="mainTab === 'me'" class="tab-svg" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="7.5" r="3.8"/>
          <path d="M4.5 19.5c0-3.6 3.4-6.5 7.5-6.5s7.5 2.9 7.5 6.5v.5h-15v-.5z"/>
        </svg>
        <!-- 我 Inactive 未选中态: 微信官方线性用户 -->
        <svg v-else class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="7.5" r="3.5"/>
          <path d="M5.5 19.5c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6"/>
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
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;

      .tab-svg {
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

      .tab-svg {
        transform: scale(1.05);
      }

      .tab-label {
        font-weight: 600;
      }
    }
  }
}
</style>
