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

    <!-- 顶部地标搜索与范围切换栏 -->
    <view class="map-search-bar">
      <view class="search-input-box">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="landmarkSearchText"
          placeholder="搜索附近地标/生活商户/便签..."
          @confirm="onSearchLandmark"
        />
        <text v-if="landmarkSearchText" class="clear-icon" @tap="landmarkSearchText = ''">✕</text>
      </view>
      <view class="range-switch-pill" @tap="toggleRadius">
        <text class="range-label">{{ searchRadius === 500 ? '📍 500米圈' : '🌐 1公里街区' }}</text>
      </view>
    </view>

    <!-- 附近新增便签浮窗提醒 -->
    <view v-if="newNoteAlertVisible && latestNote" class="new-note-float-alert" @tap="openDetailSheet(latestNote)">
      <text class="alert-icon">🔔</text>
      <text class="alert-text">刚刚在周边贴出了一张新便签：《{{ latestNote.content.slice(0, 14) }}...》</text>
      <text class="alert-action">查看 ›</text>
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
      <!-- 方案 B：Zenly 原生轻量磨砂圆钮 AI 交友匹配 -->
      <view
        class="control-btn ai-match-btn"
        @tap="openAiMatchSheet"
        hover-class="btn-hover"
        title="AI 智能交友匹配"
      >
        <text class="btn-icon">🤖</text>
        <text class="ai-badge">AI</text>
      </view>

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

      <view class="control-btn" @tap="refreshNearbyStatuses" hover-class="btn-hover" title="刷新">
        <text class="btn-icon">🔄</text>
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
  openAiMatchSheet
} = useAppState();

const landmarkSearchText = ref("");
const searchRadius = ref<number>(500);
const newNoteAlertVisible = ref(true);

const latestNote = computed(() => {
  if (visibleStatuses.value && visibleStatuses.value.length > 0) {
    return visibleStatuses.value[0];
  }
  return null;
});

function toggleRadius() {
  searchRadius.value = searchRadius.value === 500 ? 1000 : 500;
  uni.showToast({ title: `已切换为 ${searchRadius.value} 米视野`, icon: "none" });
}

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

.map-search-bar {
  position: absolute;
  top: 112rpx;
  left: 16rpx;
  right: 16rpx;
  z-index: 42;
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.search-input-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 32rpx;
  padding: 8rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid rgba(0, 0, 0, 0.06);

  .search-icon {
    font-size: 24rpx;
    opacity: 0.7;
  }

  .search-input {
    flex: 1;
    font-size: 24rpx;
    color: #333;
  }

  .clear-icon {
    font-size: 22rpx;
    color: #999;
    padding: 0 4rpx;
  }
}

.range-switch-pill {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 10rpx 18rpx;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid #ffe082;

  .range-label {
    font-size: 22rpx;
    font-weight: 700;
    color: #d84315;
  }
}

.new-note-float-alert {
  position: absolute;
  bottom: 140rpx;
  left: 20rpx;
  right: 20rpx;
  background: linear-gradient(135deg, #fff9c4, #fff176);
  border: 2rpx solid #fbc02d;
  border-radius: 20rpx;
  padding: 12rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  box-shadow: 0 6rpx 20rpx rgba(251, 192, 45, 0.35);
  z-index: 45;
  cursor: pointer;

  .alert-icon { font-size: 28rpx; }
  .alert-text {
    flex: 1;
    font-size: 22rpx;
    font-weight: 600;
    color: #5d4037;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .alert-action {
    font-size: 22rpx;
    font-weight: 700;
    color: #e65100;
  }
}
</style>
