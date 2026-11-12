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

    <!-- 附近新增便签轻量悬浮胶囊 (位于顶栏下方) -->
    <view v-if="newNoteAlertVisible && latestNote" class="new-note-float-capsule" @tap="openDetailSheet(latestNote)">
      <text class="capsule-icon">🔔</text>
      <text class="capsule-text">周边新便签：《{{ latestNote.content.slice(0, 16) }}...》</text>
      <text class="capsule-action">查看 ›</text>
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

    <!-- 右侧极简毛玻璃控制组 (Apple / Zenly 级垂直坞) -->
    <view class="right-vertical-dock">
      <view class="dock-circle-btn" @tap="recenterToUser" hover-class="btn-hover" title="定位回当前位置">
        <text class="dock-btn-icon">🎯</text>
      </view>

      <view
        class="dock-circle-btn help-dock-btn"
        :class="{ 'emergency-pulsing': hasActiveEmergency }"
        @tap="openHelpSheet(false)"
        hover-class="btn-hover"
        title="急事/求助便签"
      >
        <text class="dock-btn-icon">🆘</text>
      </view>

      <view class="dock-circle-btn" @tap="refreshNearbyStatuses" hover-class="btn-hover" title="刷新便签">
        <text class="dock-btn-icon">🔄</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-action-bar">
      <view class="summary-info">
        <text class="count-highlight">附近 {{ visibleStatuses.length }} 张便签</text>
        <text class="sub-tip">严格按 {{ searchRadius }}m 精准圈可见 · 支持现场回复</text>
      </view>
      <button class="publish-trigger-btn" @tap="openPublishSheet" hover-class="btn-hover">
        <text class="btn-plus">🖌️</text>
        <text class="btn-label">在此贴便签</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAppState } from "../../composables/useAppState";
const {
  mapCenter, mapScale, mapMarkers, mapCircles,
  onMarkerTap, onCalloutTap, onRegionChange,
  recenterToUser, refreshNearbyStatuses, simulateUserMove,
  visibleStatuses, openPublishSheet, openDetailSheet, locationClusters,
  activeHelpStatuses, hasActiveEmergency, openHelpSheet, myActiveHelp,
  openAiMatchSheet,
  searchRadius,
  toggleSearchRadius
} = useAppState();

const landmarkSearchText = ref("");
const newNoteAlertVisible = ref(true);

const latestNote = computed(() => {
  if (visibleStatuses.value && visibleStatuses.value.length > 0) {
    return visibleStatuses.value[0];
  }
  return null;
});

function onSearchLandmark() {
  if (!landmarkSearchText.value.trim()) return;
  uni.showToast({ title: `正在探索“${landmarkSearchText.value}”周边便签...`, icon: "none" });
}

const topEmergencyHelp = computed(() => {
  if (!activeHelpStatuses.value.length) return null;
  const emergency = activeHelpStatuses.value.find((s) => s.isEmergency);
  return emergency || activeHelpStatuses.value[0];
});

let logoClearTimer: any = null;

onMounted(() => {
  const purgeAMapWatermark = () => {
    if (typeof document === "undefined") return;
    const selectors = [
      ".amap-logo", ".amap-copyright", ".amap-mcode",
      "div[class*='amap-logo']", "div[class*='amap-copyright']", "a[class*='amap-logo']"
    ];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        (el as HTMLElement).style.setProperty("display", "none", "important");
        (el as HTMLElement).style.setProperty("visibility", "hidden", "important");
        (el as HTMLElement).style.setProperty("opacity", "0", "important");
        (el as HTMLElement).style.setProperty("pointer-events", "none", "important");
      });
    });
  };

  purgeAMapWatermark();
  logoClearTimer = setInterval(purgeAMapWatermark, 400);
  setTimeout(() => {
    if (logoClearTimer) clearInterval(logoClearTimer);
  }, 12000);
});

onUnmounted(() => {
  if (logoClearTimer) clearInterval(logoClearTimer);
});
</script>

<style lang="scss" scoped>
.global-emergency-banner,
.my-active-help-banner {
  position: absolute;
  top: 112rpx;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32rpx);
  max-width: 100%;
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

.ai-match-btn {
  position: relative;
  border: 2rpx solid #c4b5fd !important;
  background: #ffffff !important;

  .btn-icon {
    font-size: 34rpx !important;
  }

  .ai-badge {
    position: absolute;
    top: -6rpx;
    right: -6rpx;
    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
    color: #ffffff;
    font-size: 16rpx;
    font-weight: 800;
    padding: 1rpx 8rpx;
    border-radius: 10rpx;
    border: 2rpx solid #ffffff;
    line-height: 1.2;
    box-shadow: 0 2rpx 6rpx rgba(139, 92, 246, 0.35);
  }
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

.new-note-float-capsule {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 249, 196, 0.94);
  backdrop-filter: blur(10px);
  border: 1px solid #fbc02d;
  border-radius: 20px;
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(251, 192, 45, 0.3);
  z-index: 45;
  cursor: pointer;
  max-width: 90%;

  .capsule-icon { font-size: 13px; }
  .capsule-text {
    font-size: 11px;
    font-weight: 600;
    color: #5d4037;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .capsule-action {
    font-size: 11px;
    font-weight: 700;
    color: #e65100;
  }
}

.right-vertical-dock {
  position: absolute;
  right: 14px;
  bottom: 84px;
  z-index: 45;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dock-circle-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border: 0.5px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s;

  .dock-btn-icon {
    font-size: 18px;
  }

  &:active {
    transform: scale(0.92);
  }
}

.help-dock-btn {
  background: linear-gradient(135deg, #ffa726, #fb8c00);
  border-color: #ffe082;
  box-shadow: 0 4px 14px rgba(251, 140, 0, 0.35);

  &.emergency-pulsing {
    background: linear-gradient(135deg, #ef5350, #c62828);
    animation: help-pulse 1.5s infinite ease-in-out;
  }
}
</style>
