<template>
  <view class="map-wrapper">
    <!-- 1. 我发起的活跃求助：置顶专属直达卡片 (无需在地图搜寻，随时一键查看与关闭) -->
    <view
      v-if="myActiveHelp"
      class="my-active-help-banner"
      :class="{ 'life-saving-banner': myActiveHelp.isEmergency }"
      @tap="openDetailSheet(myActiveHelp)"
    >
      <view class="banner-badge">
        <text class="badge-icon">{{ myActiveHelp.isEmergency ? '🚨 我的救命呼救' : '🆘 我的急事求助' }}</text>
      </view>
      <text class="banner-text">【我发起的求助·进行中】{{ myActiveHelp.content }}</text>
      <view class="banner-action">
        <text>查看/关闭 ›</text>
      </view>
    </view>

    <!-- 2. 全局活跃求助/救命广播横幅 -->
    <view
      v-else-if="topEmergencyHelp"
      class="global-emergency-banner"
      :class="{ 'life-saving-banner': topEmergencyHelp.isEmergency }"
      @tap="openDetailSheet(topEmergencyHelp)"
    >
      <view class="banner-badge">
        <text class="badge-icon">{{ topEmergencyHelp.isEmergency ? '🚨 救命呼救' : '🆘 急事求助' }}</text>
      </view>
      <text class="banner-text">{{ topEmergencyHelp.userName }}: {{ topEmergencyHelp.content }}</text>
      <view class="banner-action">
        <text>前往救援 ›</text>
      </view>
    </view>

    <map
      id="mainMap"
      class="map-view"
      :latitude="mapCenter.latitude"
      :longitude="mapCenter.longitude"
      :scale="mapScale"
      :markers="mapMarkers"
      :circles="mapCircles"
      :show-location="true"
      @markertap="onMarkerTap"
      @callouttap="onCalloutTap"
      @regionchange="onRegionChange"
    />

    <!-- 右侧控制按钮组 -->
    <view class="right-controls">
      <!-- 醒目的全局 HELP 按钮 -->
      <view
        class="control-btn help-btn"
        :class="{ 'emergency-pulsing': hasActiveEmergency }"
        @tap="openHelpSheet(false)"
        hover-class="btn-hover"
        title="急事 / 救命求助"
      >
        <text class="btn-icon">🆘</text>
        <text class="help-btn-label">HELP</text>
      </view>

      <view class="control-btn" @tap="recenterToUser" hover-class="btn-hover" title="我的位置">
        <text class="btn-icon">🎯</text>
      </view>
      <view class="control-btn" @tap="refreshNearbyStatuses" hover-class="btn-hover" title="刷新">
        <text class="btn-icon">🔄</text>
      </view>
      <view class="control-btn debug-btn" @tap="simulateUserMove" hover-class="btn-hover" title="模拟走动">
        <text class="btn-icon">🚶</text>
        <text class="debug-text">走动</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-action-bar">
      <view class="summary-info">
        <text class="count-highlight">附近 {{ visibleStatuses.length }} 条动态</text>
        <text class="sub-tip">严格按 500m 地理范围圈可见</text>
      </view>
      <button class="publish-trigger-btn" @tap="openPublishSheet" hover-class="btn-hover">
        <text class="btn-plus">＋</text>
        <text class="btn-label">在此发状态</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppState } from "../composables/useAppState";
const {
  mapCenter, mapScale, mapMarkers, mapCircles,
  onMarkerTap, onCalloutTap, onRegionChange,
  recenterToUser, refreshNearbyStatuses, simulateUserMove,
  visibleStatuses, openPublishSheet, openDetailSheet, locationClusters,
  activeHelpStatuses, hasActiveEmergency, openHelpSheet, myActiveHelp,
} = useAppState();

const topEmergencyHelp = computed(() => {
  if (!activeHelpStatuses.value.length) return null;
  const emergency = activeHelpStatuses.value.find((s) => s.isEmergency);
  return emergency || activeHelpStatuses.value[0];
});
</script>

<style lang="scss" scoped>
.global-emergency-banner,
.my-active-help-banner {
  position: absolute;
  top: 130rpx;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48rpx);
  max-width: 680px;
  z-index: 45;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 2rpx solid #f59e0b;
  border-radius: 20rpx;
  padding: 12rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(245, 158, 11, 0.25);
  cursor: pointer;

  &.my-active-help-banner {
    border: 2rpx solid #6366f1;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    box-shadow: 0 8rpx 24rpx rgba(99, 102, 241, 0.25);

    .banner-badge {
      background-color: #4f46e5;
      .badge-icon { color: #ffffff; }
    }
    .banner-text { color: #1e40af; font-weight: 700; }
    .banner-action text { color: #4338ca; font-weight: 700; }
  }

  &.life-saving-banner {
    background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
    border-color: #f87171;
    box-shadow: 0 8rpx 30rpx rgba(220, 38, 38, 0.45);
    animation: emergency-banner-glow 1.5s infinite alternate ease-in-out;

    .banner-badge {
      background-color: #ffffff;
      .badge-icon { color: #dc2626; font-weight: 800; }
    }
    .banner-text { color: #ffffff; font-weight: 700; }
    .banner-action text { color: #fee2e2; font-weight: 700; }
  }

  .banner-badge {
    padding: 4rpx 12rpx;
    background-color: #f59e0b;
    border-radius: 12rpx;
    flex-shrink: 0;

    .badge-icon { font-size: 20rpx; color: #ffffff; font-weight: 700; }
  }

  .banner-text {
    flex: 1;
    font-size: 22rpx;
    color: #92400e;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .banner-action {
    flex-shrink: 0;
    font-size: 20rpx;
    color: #b45309;
    font-weight: 700;
  }
}

@keyframes emergency-banner-glow {
  0% { transform: scale(1); box-shadow: 0 8rpx 24rpx rgba(220, 38, 38, 0.4); }
  100% { transform: scale(1.01); box-shadow: 0 12rpx 36rpx rgba(220, 38, 38, 0.7); }
}

.help-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  color: #ffffff !important;
  border: 2rpx solid #fbbf24 !important;
  box-shadow: 0 8rpx 24rpx rgba(245, 158, 11, 0.4) !important;
  flex-direction: column !important;
  gap: 2rpx !important;

  .btn-icon { font-size: 30rpx !important; }
  .help-btn-label {
    font-size: 16rpx !important;
    font-weight: 800 !important;
    color: #ffffff !important;
    line-height: 1;
  }

  &.emergency-pulsing {
    background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%) !important;
    border-color: #fca5a5 !important;
    box-shadow: 0 8rpx 30rpx rgba(220, 38, 38, 0.6) !important;
    animation: help-pulse 1.5s infinite ease-in-out;
  }
}

@keyframes help-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
