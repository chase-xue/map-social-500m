<template>
  <view class="wechat-tab-bar">
    <!-- 1. 地图 (500米圈) - 居首位 -->
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

    <!-- 2. 聊天 (微信) -->
    <view
      class="tab-bar-item"
      :class="{ 'item-active': mainTab === 'chats' }"
      @tap="switchMainTab('chats')"
    >
      <view class="icon-box">
        <!-- 聊天 Active 选中态: 高清实色圆润对话气泡带 3 点 -->
        <svg v-if="mainTab === 'chats'" class="tab-svg" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.03 2 11c0 2.45 1.1 4.67 2.91 6.27-.27 1.72-.94 3.48-1.95 4.73 1.95 0 4.12-.86 5.66-2.02.45.08.91.12 1.38.12 5.52 0 10-4.03 10-9S17.52 2 12 2z" fill="currentColor"/>
          <circle cx="8" cy="11" r="1.3" fill="white"/>
          <circle cx="12" cy="11" r="1.3" fill="white"/>
          <circle cx="16" cy="11" r="1.3" fill="white"/>
        </svg>
        <!-- 聊天 Inactive 未选中态: 极简线性圆润对话气泡 -->
        <svg v-else class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2C6.48 2 2 6.03 2 11c0 2.45 1.1 4.67 2.91 6.27-.27 1.72-.94 3.48-1.95 4.73 1.95 0 4.12-.86 5.66-2.02.45.08.91.12 1.38.12 5.52 0 10-4.03 10-9S17.52 2 12 2z"/>
          <circle cx="8" cy="11" r="1" fill="currentColor"/>
          <circle cx="12" cy="11" r="1" fill="currentColor"/>
          <circle cx="16" cy="11" r="1" fill="currentColor"/>
        </svg>

        <view v-if="unreadChatsCount > 0" class="wechat-badge">
          {{ unreadChatsCount > 99 ? '99+' : unreadChatsCount }}
        </view>
      </view>
      <text class="tab-label">聊天</text>
    </view>

    <!-- 3. 通讯录 -->
    <view
      class="tab-bar-item"
      :class="{ 'item-active': mainTab === 'contacts' }"
      @tap="switchMainTab('contacts')"
    >
      <view class="icon-box">
        <!-- 通讯录 Active 选中态: 层次分明的优雅双人联系人 (👥) -->
        <svg v-if="mainTab === 'contacts'" class="tab-svg" viewBox="0 0 24 24" fill="currentColor">
          <!-- 后排同伴 -->
          <circle cx="15.5" cy="8" r="3.2"/>
          <path d="M12 20.5c0-2.6 1.8-4.5 4.2-4.5 2.3 0 4.2 1.9 4.2 4.5v.5h-8.4v-.5z"/>
          <!-- 前排主人物分层衬底 (与底色一致，杜绝任何碎裂悬挂物) -->
          <circle cx="8.5" cy="8.5" r="4.3" fill="#f7f7f7"/>
          <path d="M2.2 21c0-3.5 2.8-6.3 6.3-6.3 3.5 0 6.3 2.8 6.3 6.3v.8H2.2v-.8z" fill="#f7f7f7"/>
          <!-- 前排主人物 -->
          <circle cx="8.5" cy="8.5" r="3.4" fill="currentColor"/>
          <path d="M3 21c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5v.5H3v-.5z" fill="currentColor"/>
        </svg>
        <!-- 通讯录 Inactive 未选中态: 极简线性双人联系人 (👥) -->
        <svg v-else class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>

        <view v-if="pendingFriendsCount > 0" class="wechat-badge">
          {{ pendingFriendsCount }}
        </view>
      </view>
      <text class="tab-label">通讯录</text>
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
