<template>
  <view v-if="clusterVisible" class="modal-mask" @tap.self="closeClusterSheet(false)">
    <view class="cluster-sheet" @tap.stop>
      <view class="sheet-handle-bar" @tap="closeClusterSheet(true)">
        <view class="sheet-handle" />
      </view>
      <view class="cluster-header">
        <view class="cluster-header-title-box">
          <text class="cluster-title">📍 同地点聚合：共 {{ activeCluster?.count }} 条动态</text>
          <text class="cluster-tag">展示首发人照片 · 多动态聚合</text>
        </view>
        <view class="close-btn" @tap="closeClusterSheet(true)">✕</view>
      </view>
      <view v-if="activeCluster?.firstStatus.images && activeCluster.firstStatus.images.length > 0" class="cluster-cover-card">
        <image
          class="cluster-cover-img"
          :src="activeCluster.firstStatus.images[0]"
          mode="aspectFill"
          @tap="previewImage(activeCluster.firstStatus.images[0], activeCluster.firstStatus.images)"
        />
        <view class="cluster-cover-info">
          <text class="cover-badge">⭐ 首发人配图 · {{ activeCluster.firstStatus.userName }}</text>
          <text class="cover-hint">🔍 点击可放大查看首发原图</text>
        </view>
      </view>
      <view class="jump-moments-banner" @tap="jumpToMomentsFromCluster" hover-class="btn-hover">
        <view class="jump-left">
          <view class="jump-title-row">
            <text class="jump-title">📰 跳转到朋友圈模式浏览全部</text>
            <text class="jump-badge">新需求</text>
          </view>
          <text class="jump-desc">按时间倒序沉浸式浏览周边所有邻里动态与完整大图</text>
        </view>
        <text class="jump-arrow-btn">立即前往 ›</text>
      </view>
      <scroll-view scroll-y class="cluster-scroll-list">
        <view
          v-for="(st, sIdx) in activeCluster?.statuses"
          :key="st.id"
          class="cluster-item-card"
          @tap="closeClusterSheet(true); openDetailSheet(st)"
        >
          <view class="cluster-item-top">
            <view class="flex-row">
              <image class="cluster-item-avatar" :src="st.userAvatar" mode="aspectFill" />
              <view>
                <view class="flex-row">
                  <text class="cluster-item-name">{{ st.userName }}</text>
                  <text v-if="sIdx === 0" class="first-tag">首发者</text>
                </view>
                <text class="cluster-item-time">{{ formatTime(st.createdAt) }} · 距你 {{ st.distance }}m</text>
              </view>
            </view>
            <text class="cluster-arrow">查看详情 ›</text>
          </view>
          <text class="cluster-item-content">{{ st.content }}</text>
          <view v-if="st.images && st.images.length > 0" class="cluster-imgs-row">
            <image
              v-for="(cImg, cIdx) in st.images"
              :key="cIdx"
              class="cluster-thumb-img"
              :src="cImg"
              mode="aspectFill"
              @tap.stop="previewImage(cImg, st.images)"
            />
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";
const {
  clusterVisible, activeCluster,
  closeClusterSheet, previewImage, jumpToMomentsFromCluster,
  formatTime, openDetailSheet,
} = useAppState();
</script>
