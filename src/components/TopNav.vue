<template>
  <view class="top-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav-content">
      <!-- 微信风格居中胶囊切换器 [ 地图 | 朋友圈 ] -->
      <view class="nav-left">
        <view class="tab-switcher">
          <view
            class="tab-item"
            :class="{ 'tab-active': mapSubTab === 'map' }"
            @tap="mapSubTab = 'map'"
          >
            <text class="tab-icon">🗺️</text>
            <text class="tab-text">地图</text>
          </view>
          <view
            class="tab-item"
            :class="{ 'tab-active': mapSubTab === 'moments' }"
            @tap="mapSubTab = 'moments'"
          >
            <text class="tab-icon">📰</text>
            <text class="tab-text">朋友圈</text>
            <view v-if="visibleStatuses.length > 0" class="tab-badge">{{ visibleStatuses.length }}</view>
          </view>
        </view>
        <view class="nav-subtitle">
          <text>📍 500m生活圈 · {{ mapSubTab === 'map' ? 'Zenly地图雷达' : '发布时间倒序' }}</text>
        </view>
      </view>

      <!-- 右侧快捷功能：发动态 / 相机 -->
      <view class="nav-right-actions">
        <view class="nav-camera-btn" @tap="openPublishSheet" hover-class="btn-hover" title="发动态/发朋友圈">
          <text class="camera-icon">📷</text>
          <text class="camera-label">{{ mapSubTab === 'map' ? '发状态' : '发朋友圈' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";
const {
  statusBarHeight, mapSubTab, visibleStatuses, openPublishSheet
} = useAppState();
</script>

<style lang="scss" scoped>
.top-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.85) 100%);
  backdrop-filter: blur(12px);
  border-bottom: 0.5px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);

  .nav-content {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;

    .nav-left {
      display: flex;
      flex-direction: column;
      gap: 3px;

      .tab-switcher {
        display: flex;
        background-color: #ededed;
        border-radius: 16px;
        padding: 2px;
        border: 0.5px solid #dcdcdc;

        .tab-item {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s ease;
          position: relative;
          cursor: pointer;

          .tab-icon { font-size: 13px; }

          .tab-badge {
            font-size: 10px;
            background-color: #fa5151;
            color: #ffffff;
            padding: 1px 5px;
            border-radius: 8px;
            font-weight: 700;
            line-height: 1;
          }

          &.tab-active {
            background-color: #ffffff;
            color: #07c160;
            box-shadow: 0 1px 4px rgba(7, 193, 96, 0.2);
            font-weight: 700;
          }
        }
      }

      .nav-subtitle {
        font-size: 10px;
        color: #7f7f7f;
        padding-left: 4px;
      }
    }

    .nav-right-actions {
      display: flex;
      align-items: center;

      .nav-camera-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        background-color: #ffffff;
        border: 0.5px solid #dcdcdc;
        padding: 5px 12px;
        border-radius: 16px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        cursor: pointer;

        .camera-icon { font-size: 14px; }
        .camera-label { font-size: 12px; font-weight: 600; color: #191919; }

        &:active {
          background-color: #f5f5f5;
        }
      }
    }
  }
}
</style>
