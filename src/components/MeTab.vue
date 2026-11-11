<template>
  <view class="me-tab-page">
    <!-- 微信浅灰标准顶栏 -->
    <view class="wechat-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-inner">
        <text class="header-title">更多</text>
        <!-- 微信原生「更多」页面顶栏纯净无多余齿轮图标 -->
        <view class="header-right-actions" />
      </view>
    </view>

    <!-- 微信内容滚动区 -->
    <scroll-view scroll-y class="me-scroll-view">
      <!-- 微信经典顶层个人名片大卡片 -->
      <view class="wechat-me-profile-card" @tap="openMyProfileSheet">
        <image class="profile-big-avatar" :src="myProfile.avatar" mode="aspectFill" />
        <view class="profile-main-info">
          <view class="profile-name-row">
            <text class="profile-name">{{ myProfile.name }}</text>
            <text class="profile-gender-badge">{{ myProfile.gender === '男' ? '♂' : '♀' }} {{ myProfile.age }}岁</text>
          </view>
          <text class="profile-wechat-id">邻友号：500m_{{ myProfile.id.slice(0, 8) }}</text>
          <view class="profile-status-pill">
            <text class="status-dot">🟢</text>
            <text class="status-text">500米生活圈 · 活跃中</text>
          </view>
        </view>
        <view class="profile-qr-box">
          <svg class="qr-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v3h-2v-3zm3 3h3v5h-2v-3h-1v-2zm-3 2h2v3h-2v-3zm-2-2h2v2h-2v-2z"/>
          </svg>
          <text class="profile-arrow">›</text>
        </view>
      </view>

      <!-- 微信经典单元格组 1: 朋友圈与求助 -->
      <view class="wechat-cell-group">
        <view class="wechat-cell-item" @tap="jumpToMoments">
          <view class="cell-icon-box bg-purple">
            <text class="cell-emoji">📷</text>
          </view>
          <view class="cell-content">
            <text class="cell-label">关注动态</text>
            <view class="cell-right-info">
              <text class="cell-tip">关注邻友时间线</text>
              <text class="cell-arrow">›</text>
            </view>
          </view>
        </view>

        <view class="wechat-cell-item" @tap="openHelpSheet(false)">
          <view class="cell-icon-box bg-red">
            <text class="cell-emoji">🆘</text>
          </view>
          <view class="cell-content">
            <text class="cell-label">急事求助与救命通道</text>
            <view class="cell-right-info">
              <text v-if="myActiveHelp" class="cell-emergency-badge">
                {{ myActiveHelp.isEmergency ? '🚨 救命中' : '🆘 进行中' }}
              </text>
              <text v-else class="cell-tip">{{ myHelpHistory.length > 0 ? `${myHelpHistory.length}条历史` : '发起求助' }}</text>
              <text class="cell-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 微信经典单元格组 2: 位置与隐私 -->
      <view class="wechat-cell-group">
        <view class="wechat-cell-item" @tap="handleRecenterMap">
          <view class="cell-icon-box bg-blue">
            <text class="cell-emoji">📍</text>
          </view>
          <view class="cell-content">
            <text class="cell-label">500米地理物理圈</text>
            <view class="cell-right-info">
              <text class="cell-tip">经纬度已对齐 · 查看</text>
              <text class="cell-arrow">›</text>
            </view>
          </view>
        </view>

        <view class="wechat-cell-item" @tap="openMyProfileSheet">
          <view class="cell-icon-box bg-green">
            <text class="cell-emoji">📱</text>
          </view>
          <view class="cell-content">
            <text class="cell-label">手机号展示与隐私</text>
            <view class="cell-right-info">
              <text class="cell-privacy-tag" :class="{ 'tag-public': editingProfile.showPhone }">
                {{ editingProfile.showPhone ? '🟢 已公开' : '🔒 已保密' }}
              </text>
              <text class="cell-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 微信经典单元格组 3: 模拟调试与设置 -->
      <view class="wechat-cell-group">
        <view class="wechat-cell-item" @tap="handleSimulateWalk">
          <view class="cell-icon-box bg-amber">
            <text class="cell-emoji">🚶</text>
          </view>
          <view class="cell-content">
            <text class="cell-label">模拟走动测试</text>
            <view class="cell-right-info">
              <text class="cell-tip">位移30米</text>
              <text class="cell-arrow">›</text>
            </view>
          </view>
        </view>

        <view class="wechat-cell-item" @tap="openMyProfileSheet">
          <view class="cell-icon-box bg-gray">
            <text class="cell-emoji">🪪</text>
          </view>
          <view class="cell-content">
            <text class="cell-label">个人资料设置</text>
            <view class="cell-right-info">
              <text class="cell-tip">更换头像/昵称</text>
              <text class="cell-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <view class="me-bottom-padding" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";

const {
  statusBarHeight, myProfile, editingProfile, openMyProfileSheet,
  switchMainTab, openHelpSheet, myActiveHelp, myHelpHistory,
  recenterToUser, simulateUserMove
} = useAppState();

function jumpToMoments() {
  switchMainTab("map");
  const { activeTab } = useAppState();
  activeTab.value = "moments";
}

function handleRecenterMap() {
  switchMainTab("map");
  const { activeTab } = useAppState();
  activeTab.value = "map";
  recenterToUser();
}

function handleSimulateWalk() {
  simulateUserMove();
}
</script>

<style lang="scss" scoped>
.me-tab-page {
  width: 100%;
  height: 100%;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #ededed;
  position: relative;
  overflow: hidden;
}

/* 微信标准浅灰顶栏 */
.wechat-header {
  background-color: #ededed;
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
          width: 20px;
          height: 20px;
        }
      }
    }
  }
}

/* 滚动区 */
.me-scroll-view {
  flex: 1;
  background-color: #ededed;

  /* 微信经典大头像卡片 */
  .wechat-me-profile-card {
    background-color: #ffffff;
    padding: 24px 20px 28px;
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 10px;

    &:active {
      background-color: #f7f7f7;
    }

    .profile-big-avatar {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      background-color: #f0f0f0;
      margin-right: 16px;
      flex-shrink: 0;
    }

    .profile-main-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;

      .profile-name-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .profile-name {
          font-size: 19px;
          font-weight: 700;
          color: #191919;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profile-gender-badge {
          font-size: 11px;
          background-color: #f1f5f9;
          color: #64748b;
          padding: 2px 6px;
          border-radius: 4px;
        }
      }

      .profile-wechat-id {
        font-size: 13px;
        color: #7f7f7f;
      }

      .profile-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background-color: #f2f3f5;
        padding: 2px 8px;
        border-radius: 12px;
        width: fit-content;
        margin-top: 2px;

        .status-dot { font-size: 8px; }
        .status-text { font-size: 11px; color: #576b95; font-weight: 500; }
      }
    }

    .profile-qr-box {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 10px;
      flex-shrink: 0;

      .qr-svg {
        width: 18px;
        height: 18px;
        color: #7f7f7f;
      }

      .profile-arrow {
        font-size: 20px;
        color: #b2b2b2;
      }
    }
  }

  /* 微信经典单元格组 */
  .wechat-cell-group {
    background-color: #ffffff;
    margin-bottom: 10px;

    .wechat-cell-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;

      &:active {
        background-color: #f7f7f7;
      }

      .cell-icon-box {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 14px;
        flex-shrink: 0;

        &.bg-purple { background-color: #6366f1; }
        &.bg-red { background-color: #fa5151; }
        &.bg-blue { background-color: #10aeff; }
        &.bg-green { background-color: #07c160; }
        &.bg-amber { background-color: #fa9d3b; }
        &.bg-gray { background-color: #7f7f7f; }

        .cell-emoji { font-size: 16px; }
      }

      .cell-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 0.5px solid #ededed;
        padding: 4px 0;

        .cell-label {
          font-size: 16px;
          color: #191919;
          font-weight: 500;
        }

        .cell-right-info {
          display: flex;
          align-items: center;
          gap: 6px;

          .cell-tip {
            font-size: 13px;
            color: #999999;
          }

          .cell-emergency-badge {
            font-size: 11px;
            background-color: #fef2f2;
            color: #ef4444;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
          }

          .cell-privacy-tag {
            font-size: 12px;
            color: #64748b;
            background-color: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;

            &.tag-public {
              color: #07c160;
              background-color: #f0fdf4;
            }
          }

          .cell-arrow {
            font-size: 18px;
            color: #b2b2b2;
          }
        }
      }

      &:last-child .cell-content {
        border-bottom: none;
      }
    }
  }

  .me-bottom-padding {
    height: calc(64px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
