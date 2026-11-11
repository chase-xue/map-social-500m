<template>
  <view class="chats-tab-page">
    <!-- 微信浅灰标准顶栏 -->
    <view class="wechat-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-inner">
        <text class="header-title">
          聊天{{ unreadChatsCount > 0 ? ` (${unreadChatsCount})` : '' }}
        </text>
        <view class="header-right-actions">
          <view class="header-icon-btn" @tap="openPublishSheet('moments')" title="发动态 / 朋友圈">
            <svg class="action-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
            </svg>
          </view>
        </view>
      </view>
    </view>

    <!-- 微信搜索栏 -->
    <view class="wechat-search-bar">
      <view class="search-input-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          class="search-input"
          v-model="searchQuery"
          placeholder="搜索邻友与聊天记录..."
          placeholder-class="search-placeholder"
        />
        <text v-if="searchQuery" class="clear-search-btn" @tap="searchQuery = ''">✕</text>
      </view>
    </view>

    <!-- 会话列表 -->
    <scroll-view scroll-y class="chat-list-scroll">
      <view v-if="filteredFriends.length === 0" class="empty-chats">
        <text class="empty-icon">💬</text>
        <text class="empty-title">暂无聊天记录</text>
        <text class="empty-desc">前往地图或通讯录，与周边 500 米内的邻居打个招呼吧~</text>
        <button class="go-map-btn" @tap="switchMainTab('map')">去地图逛逛</button>
      </view>

      <view
        v-for="friend in filteredFriends"
        :key="friend.userId"
        class="chat-cell-item"
        @tap="openChatSheet(friend)"
      >
        <view class="avatar-wrapper">
          <image class="chat-cell-avatar" :src="friend.avatar" mode="aspectFill" />
          <view v-if="friend.unreadCount && friend.unreadCount > 0" class="cell-unread-badge">
            {{ friend.unreadCount }}
          </view>
        </view>

        <view class="chat-cell-content">
          <view class="cell-top-row">
            <text class="cell-name">{{ friend.name }}</text>
            <text class="cell-time">{{ friend.lastMessageTime ? formatTime(friend.lastMessageTime) : '' }}</text>
          </view>
          <view class="cell-bottom-row">
            <text class="cell-last-msg">
              {{ friend.lastMessage || (friend.status === 'pending' ? '【好友申请】点击通过' : '打个招呼吧') }}
            </text>
            <text v-if="friend.status === 'pending'" class="pending-pill">申请中</text>
          </view>
        </view>
      </view>

      <view class="chats-bottom-padding" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAppState } from "../composables/useAppState";

const {
  statusBarHeight, unreadChatsCount, friendsList,
  openChatSheet, switchMainTab, formatTime, openPublishSheet,
} = useAppState();

const searchQuery = ref("");

const filteredFriends = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return friendsList.value;
  return friendsList.value.filter(
    f => f.name.toLowerCase().includes(query) || (f.lastMessage && f.lastMessage.toLowerCase().includes(query))
  );
});
</script>

<style lang="scss" scoped>
.chats-tab-page {
  width: 100%;
  height: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  position: relative;
  overflow: hidden;
}

/* 微信标准浅灰顶栏 */
.wechat-header {
  background-color: #ededed;
  border-bottom: 0.5px solid #dcdcdc;
  position: relative;
  z-index: 50;

  .header-inner {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;

    .header-title {
      font-size: 17px;
      font-weight: 600;
      color: #191919;
      letter-spacing: -0.3px;
    }

    .header-right-actions {
      display: flex;
      align-items: center;

      .header-icon-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #191919;

        .action-svg {
          width: 22px;
          height: 22px;
        }
      }
    }
  }

}

/* 微信搜索栏 */
.wechat-search-bar {
  background-color: #ededed;
  padding: 8px 12px;
  box-sizing: border-box;

  .search-input-box {
    background-color: #ffffff;
    border-radius: 6px;
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    gap: 8px;

    .search-icon {
      width: 16px;
      height: 16px;
      color: #999999;
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      height: 100%;
      font-size: 14px;
      color: #191919;
    }

    .search-placeholder {
      color: #999999;
      font-size: 14px;
    }

    .clear-search-btn {
      color: #999999;
      font-size: 14px;
      padding: 4px;
      cursor: pointer;
    }
  }
}

/* 会话列表 */
.chat-list-scroll {
  flex: 1;
  background-color: #ffffff;

  .empty-chats {
    padding: 60px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .empty-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-title { font-size: 17px; font-weight: 600; color: #191919; margin-bottom: 6px; }
    .empty-desc { font-size: 13px; color: #888888; line-height: 1.5; margin-bottom: 20px; }

    .go-map-btn {
      background-color: #07c160;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      padding: 0 24px;
      height: 38px;
      line-height: 38px;
      border-radius: 8px;
      border: none;
    }
  }

  .chat-cell-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    background-color: #ffffff;
    position: relative;
    user-select: none;

    &:active {
      background-color: #ececec;
    }

    .avatar-wrapper {
      position: relative;
      margin-right: 12px;
      flex-shrink: 0;

      .chat-cell-avatar {
        width: 48px;
        height: 48px;
        border-radius: 6px;
        background-color: #f0f0f0;
      }

      .cell-unread-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background-color: #fa5151;
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        min-width: 16px;
        height: 16px;
        line-height: 16px;
        border-radius: 8px;
        text-align: center;
        padding: 0 4px;
        border: 1px solid #ffffff;
      }
    }

    .chat-cell-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
      border-bottom: 0.5px solid #ededed;
      padding-bottom: 12px;

      .cell-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .cell-name {
          font-size: 16px;
          font-weight: 500;
          color: #191919;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cell-time {
          font-size: 11px;
          color: #b2b2b2;
          flex-shrink: 0;
          margin-left: 8px;
        }
      }

      .cell-bottom-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;

        .cell-last-msg {
          font-size: 13px;
          color: #999999;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        .pending-pill {
          font-size: 11px;
          background-color: #fef2f2;
          color: #ef4444;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          flex-shrink: 0;
        }
      }
    }
  }

  .chats-bottom-padding {
    height: calc(60px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
