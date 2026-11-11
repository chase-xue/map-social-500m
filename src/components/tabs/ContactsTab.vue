<template>
  <view class="contacts-tab-page">
    <!-- 微信浅灰标准顶栏 -->
    <view class="wechat-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-inner">
        <text class="header-title">通讯录</text>
        <view class="header-right-actions">
          <view class="header-icon-btn" @tap="switchMainTab('map')" title="在地图上发现邻友">
            <svg class="action-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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
          placeholder="搜索邻友昵称、手机号..."
          placeholder-class="search-placeholder"
        />
        <text v-if="searchQuery" class="clear-search-btn" @tap="searchQuery = ''">✕</text>
      </view>
    </view>

    <!-- 联系人内容滚动区 -->
    <scroll-view scroll-y class="contacts-scroll-view">
      <!-- 微信经典顶部门户入口组 -->
      <view class="wechat-portal-group">
        <!-- 1. 新的朋友 -->
        <view class="portal-cell" @tap="showPendingOnly = !showPendingOnly">
          <view class="portal-icon-box bg-orange">
            <svg class="portal-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </view>
          <view class="portal-content">
            <text class="portal-label">新的朋友</text>
            <view v-if="pendingFriendsCount > 0" class="portal-badge">
              {{ pendingFriendsCount }}
            </view>
            <text v-else class="portal-arrow">›</text>
          </view>
        </view>

        <!-- 2. 500米圈邻友 -->
        <view class="portal-cell" @tap="switchMainTab('map')">
          <view class="portal-icon-box bg-green">
            <svg class="portal-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </view>
          <view class="portal-content">
            <text class="portal-label">500米圈邻友雷达</text>
            <text class="portal-tip">当前活跃 {{ visibleStatuses.length }} 条动态</text>
            <text class="portal-arrow">›</text>
          </view>
        </view>

        <!-- 3. 急事求助通道 -->
        <view class="portal-cell" @tap="openHelpSheet(false)">
          <view class="portal-icon-box bg-red">
            <text class="portal-emoji">🆘</text>
          </view>
          <view class="portal-content">
            <text class="portal-label">急事与救命呼救</text>
            <text v-if="hasActiveEmergency" class="portal-emergency-tag">🚨 紧急进行中</text>
            <text class="portal-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 微信通讯录分组头 -->
      <view class="contacts-section-header">
        <text class="section-title">我的邻友 ({{ displayFriends.length }})</text>
      </view>

      <!-- 邻友列表 -->
      <view class="contacts-list-group">
        <view v-if="displayFriends.length === 0" class="empty-contacts">
          <text class="empty-icon">👥</text>
          <text class="empty-title">{{ showPendingOnly ? '暂无待处理的好友申请' : '通讯录暂无邻友' }}</text>
          <text class="empty-desc">在 500 米地图上点击邻居头像，即可发送好友申请！</text>
          <button class="add-neighbor-btn" @tap="switchMainTab('map')">前往地图添加邻友</button>
        </view>

        <view
          v-for="friend in displayFriends"
          :key="friend.userId"
          class="contact-cell-item"
          @tap="friend.status === 'accepted' ? openChatSheet(friend) : openUserProfileCard(friend, undefined)"
        >
          <image class="contact-avatar" :src="friend.avatar" mode="aspectFill" />
          <view class="contact-content">
            <view class="contact-name-row">
              <text class="contact-name">{{ friend.name }}</text>
              <text v-if="friend.phone" class="contact-phone">📱 {{ friend.phone }}</text>
            </view>
            <text class="contact-bio">{{ friend.bio || '500米物理生活圈邻友' }}</text>
          </view>
          <view class="contact-action">
            <button
              v-if="friend.status === 'pending'"
              class="accept-btn"
              @tap.stop="handleAcceptFriend(friend.userId)"
            >
              通过
            </button>
            <button
              v-else
              class="wechat-chat-btn"
              @tap.stop="openChatSheet(friend)"
            >
              发消息
            </button>
          </view>
        </view>
      </view>

      <view class="contacts-bottom-padding" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAppState } from "../../composables/useAppState";

const {
  statusBarHeight, friendsList, pendingFriendsCount, visibleStatuses,
  hasActiveEmergency, switchMainTab, openChatSheet, openUserProfileCard,
  handleAcceptFriend, openHelpSheet
} = useAppState();

const searchQuery = ref("");
const showPendingOnly = ref(false);

const displayFriends = computed(() => {
  let list = friendsList.value;
  if (showPendingOnly.value) {
    list = list.filter(f => f.status === "pending");
  }
  const query = searchQuery.value.trim().toLowerCase();
  if (query) {
    list = list.filter(
      f => f.name.toLowerCase().includes(query) || (f.phone && f.phone.includes(query))
    );
  }
  return list;
});
</script>

<style lang="scss" scoped>
.contacts-tab-page {
  width: 100%;
  height: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7;
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

/* 滚动区 */
.contacts-scroll-view {
  flex: 1;
  background-color: #f7f7f7;

  /* 经典顶部门户入口 */
  .wechat-portal-group {
    background-color: #ffffff;
    margin-bottom: 10px;

    .portal-cell {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      cursor: pointer;

      &:active {
        background-color: #ececec;
      }

      .portal-icon-box {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        margin-right: 12px;
        flex-shrink: 0;

        &.bg-orange { background-color: #fa9d3b; }
        &.bg-green { background-color: #07c160; }
        &.bg-red { background-color: #fa5151; }

        .portal-icon { width: 22px; height: 22px; }
        .portal-emoji { font-size: 20px; }
      }

      .portal-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 0.5px solid #ededed;
        padding: 10px 0;

        .portal-label {
          font-size: 16px;
          color: #191919;
          font-weight: 500;
        }

        .portal-tip {
          font-size: 12px;
          color: #999999;
          margin-right: 6px;
        }

        .portal-emergency-tag {
          font-size: 11px;
          background-color: #fef2f2;
          color: #ef4444;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }

        .portal-badge {
          background-color: #fa5151;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          line-height: 18px;
          border-radius: 9px;
          text-align: center;
          padding: 0 4px;
        }

        .portal-arrow {
          font-size: 18px;
          color: #b2b2b2;
          margin-left: 6px;
        }
      }

      &:last-child .portal-content {
        border-bottom: none;
      }
    }
  }

  /* 微信通讯录分组头 */
  .contacts-section-header {
    padding: 6px 16px;
    background-color: #f7f7f7;

    .section-title {
      font-size: 12px;
      color: #7f7f7f;
      font-weight: 600;
    }
  }

  /* 邻友列表 */
  .contacts-list-group {
    background-color: #ffffff;

    .empty-contacts {
      padding: 48px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .empty-icon { font-size: 40px; margin-bottom: 8px; }
      .empty-title { font-size: 15px; font-weight: 600; color: #191919; margin-bottom: 4px; }
      .empty-desc { font-size: 12px; color: #888888; line-height: 1.5; margin-bottom: 16px; }

      .add-neighbor-btn {
        background-color: #07c160;
        color: #ffffff;
        font-size: 13px;
        font-weight: 600;
        padding: 0 20px;
        height: 36px;
        line-height: 36px;
        border-radius: 6px;
        border: none;
      }
    }

    .contact-cell-item {
      display: flex;
      align-items: center;
      padding: 10px 16px;
      cursor: pointer;

      &:active {
        background-color: #ececec;
      }

      .contact-avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
        margin-right: 12px;
        flex-shrink: 0;
        background-color: #f0f0f0;
      }

      .contact-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        border-bottom: 0.5px solid #ededed;
        padding: 8px 0;

        .contact-name-row {
          display: flex;
          align-items: center;
          gap: 8px;

          .contact-name {
            font-size: 15px;
            font-weight: 500;
            color: #191919;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .contact-phone {
            font-size: 11px;
            color: #64748b;
          }
        }

        .contact-bio {
          font-size: 12px;
          color: #999999;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .contact-action {
        margin-left: 8px;
        flex-shrink: 0;

        .accept-btn {
          margin: 0;
          padding: 0 14px;
          height: 28px;
          line-height: 28px;
          background-color: #07c160;
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          border-radius: 4px;
          border: none;
        }

        .wechat-chat-btn {
          margin: 0;
          padding: 0 12px;
          height: 28px;
          line-height: 28px;
          background-color: #f1f5f9;
          color: #334155;
          font-size: 12px;
          font-weight: 500;
          border-radius: 4px;
          border: 0.5px solid #e2e8f0;
        }
      }

      &:last-child .contact-content {
        border-bottom: none;
      }
    }
  }

  .contacts-bottom-padding {
    height: calc(60px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
