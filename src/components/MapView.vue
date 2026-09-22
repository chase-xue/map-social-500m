<template>
  <view class="map-wrapper">
    <!-- #ifdef H5 -->
    <!-- H5 模式：地图占位视图（需要配置高德 Web JS API Key 才能显示真实地图） -->
    <view class="map-h5-fallback">
      <view class="map-h5-grid">
        <view class="map-h5-road map-h5-road-h1" />
        <view class="map-h5-road map-h5-road-h2" />
        <view class="map-h5-road map-h5-road-v1" />
        <view class="map-h5-road map-h5-road-v2" />
        <view class="map-h5-block block-1" />
        <view class="map-h5-block block-2" />
        <view class="map-h5-block block-3" />
        <view class="map-h5-block block-4" />
        <view class="map-h5-block block-5" />
        <view class="map-h5-block block-6" />
      </view>
      <!-- 500m 覆盖圈 -->
      <view class="map-h5-circle" />
      <!-- 用户位置标记 -->
      <view class="map-h5-user-marker">
        <view class="user-marker-dot" />
        <view class="user-marker-pulse" />
      </view>
      <!-- 状态打点标记 -->
      <view
        v-for="(marker, idx) in statusMarkers"
        :key="idx"
        class="map-h5-status-marker"
        :style="marker.style"
        @tap="onMarkerTap({ detail: { markerId: marker.id } })"
      >
        <view class="status-pin">
          <text class="pin-emoji">📍</text>
        </view>
        <view class="status-callout">
          <text class="callout-text">{{ marker.label }}</text>
        </view>
      </view>
      <view class="map-h5-watermark">
        <text>H5 预览模式 · 小程序/App 中显示真实地图</text>
      </view>
    </view>
    <!-- #endif -->
    <!-- #ifndef H5 -->
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
    <!-- #endif -->
    <view class="right-controls">
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
  visibleStatuses, openPublishSheet, locationClusters,
} = useAppState();

// H5 模式：将状态点转为可视化标记（模拟地图上的相对位置）
const statusMarkers = computed(() => {
  return locationClusters.value.map((cluster, idx) => {
    // 将经纬度差值映射为像素偏移（模拟地图视图）
    const dLat = cluster.latitude - mapCenter.value.latitude;
    const dLng = cluster.longitude - mapCenter.value.longitude;
    // 大约 1 度 ≈ 111km, 在 scale=16 下 500m ≈ 150px
    const pxPerDeg = 150 / (500 / 111000);
    const x = 50 + (dLng * pxPerDeg / window.innerWidth) * 100;
    const y = 50 - (dLat * pxPerDeg / window.innerHeight) * 100;
    const first = cluster.firstStatus;
    const label = cluster.count > 1
      ? `${first.userName}等 · 共${cluster.count}条`
      : `${first.userName} (${first.distance}m)`;
    return {
      id: idx + 1,
      style: `left: ${Math.max(10, Math.min(90, x))}%; top: ${Math.max(15, Math.min(85, y))}%;`,
      label,
    };
  });
});
</script>
