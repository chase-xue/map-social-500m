<template>
  <view class="top-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav-content-row">
      <!-- 微信风格一级核心导航胶囊 (全局固定稳重，一眼看清全局，绝不横向卷动与切字) -->
      <view class="tab-switcher">
        <view
          class="tab-item"
          :class="{ 'tab-active': mapSubTab === 'map' }"
          @tap="mapSubTab = 'map'"
        >
          <text class="tab-icon">📍</text>
          <text class="tab-text">附近</text>
        </view>
        <view
          v-if="myProfile.showRecommendTab !== false"
          class="tab-item"
          :class="{ 'tab-active': mapSubTab === 'recommend' }"
          @tap="mapSubTab = 'recommend'"
        >
          <text class="tab-icon">✨</text>
          <text class="tab-text">推荐</text>
        </view>
        <view
          class="tab-item"
          :class="{ 'tab-active': mapSubTab === 'moments' }"
          @tap="mapSubTab = 'moments'"
        >
          <text class="tab-icon">👥</text>
          <text class="tab-text">关注</text>
          <view v-if="visibleStatuses.length > 0" class="tab-badge">{{ visibleStatuses.length }}</view>
        </view>
        <view
          v-if="myProfile.showAcgnTab !== false"
          class="tab-item tab-acgn"
          :class="{ 'tab-active': mapSubTab === 'acgn' }"
          @tap="mapSubTab = 'acgn'"
        >
          <text class="tab-icon">🌸</text>
          <text class="tab-text">二次元</text>
          <view v-if="acgnStatuses.length > 0" class="tab-badge acgn-tab-badge">{{ acgnStatuses.length }}</view>
        </view>
      </view>

      <!-- 同行右侧快捷功能：微信经典圆形相机发动态按钮 -->
      <view class="nav-right-actions">
        <view class="nav-camera-btn" @tap="openPublishSheet" hover-class="btn-hover" title="发动态">
          <text class="camera-icon">📷</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../../composables/useAppState";
const {
  statusBarHeight, mapSubTab, visibleStatuses, acgnStatuses, myProfile, openPublishSheet
} = useAppState();
</script>

<style lang="scss" scoped>
.top-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%);
  backdrop-filter: blur(12px);
  border-bottom: 0.5px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);

  .nav-content-row {
    height: 48px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    box-sizing: border-box;

    /* 一级导航全宽自适应固定容器 */
    .tab-switcher {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      background-color: #ededed;
      border-radius: 20px;
      padding: 3px;
      border: 0.5px solid #dcdcdc;
      box-sizing: border-box;

      .tab-item {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 2px;
        padding: 5px 4px;
        border-radius: 17px;
        font-size: 13px;
        font-weight: 500;
        color: #64748b;
        transition: all 0.2s ease;
        position: relative;
        cursor: pointer;
        white-space: nowrap;
        box-sizing: border-box;

        .tab-icon { 
          font-size: 12px;
          line-height: 1;
          flex-shrink: 0;
        }

        .tab-text {
          font-size: 12px;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tab-badge {
          font-size: 10px;
          background-color: #fa5151;
          color: #ffffff;
          padding: 1px 4px;
          border-radius: 8px;
          font-weight: 700;
          line-height: 1;
          flex-shrink: 0;

          &.acgn-tab-badge {
            background-color: #ec4899;
          }
        }

        &.tab-active {
          background-color: #ffffff;
          color: #07c160;
          box-shadow: 0 1px 4px rgba(7, 193, 96, 0.2);
          font-weight: 700;
        }

        &.tab-acgn.tab-active {
          color: #db2777;
          box-shadow: 0 1px 4px rgba(219, 39, 119, 0.2);
        }
      }
    }

    /* 右侧精致微信小相机图标 */
    .nav-right-actions {
      flex-shrink: 0;
      display: flex;
      align-items: center;

      .nav-camera-btn {
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #ffffff;
        border: 0.5px solid #dcdcdc;
        border-radius: 17px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        cursor: pointer;
        transition: all 0.15s ease;

        .camera-icon { 
          font-size: 16px;
          line-height: 1;
        }

        &:active {
          background-color: #f0f0f0;
          transform: scale(0.96);
        }
      }
    }
  }
}
</style>
