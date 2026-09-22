<template>
  <view class="top-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav-content">
      <view class="nav-left">
        <view class="tab-switcher">
          <view class="tab-item" :class="{ 'tab-active': activeTab === 'map' }" @tap="activeTab = 'map'">
            <text class="tab-icon">🗺️</text>
            <text class="tab-text">地图</text>
          </view>
          <view class="tab-item" :class="{ 'tab-active': activeTab === 'moments' }" @tap="activeTab = 'moments'">
            <text class="tab-icon">📰</text>
            <text class="tab-text">朋友圈</text>
            <view v-if="visibleStatuses.length > 0" class="tab-badge">{{ visibleStatuses.length }}</view>
          </view>
        </view>
        <view class="nav-subtitle">
          <text>📍 500m生活圈 · {{ activeTab === 'map' ? '地图打点模式' : '发布时间倒序' }}</text>
        </view>
      </view>
      <view class="nav-right-actions">
        <view class="nav-chat-btn" @tap="openFriendsSheet" hover-class="btn-hover">
          <text class="chat-icon">💬</text>
          <text class="chat-label">私聊</text>
          <view v-if="pendingFriendsCount > 0" class="chat-badge">{{ pendingFriendsCount }}</view>
        </view>
        <view class="my-profile-btn" @tap="openMyProfileSheet" hover-class="btn-hover">
          <image class="my-nav-avatar" :src="myProfile.avatar" mode="aspectFill" />
          <view class="my-nav-info">
            <text class="my-nav-name">{{ myProfile.name }}</text>
            <text class="my-nav-tip">我的资料 ›</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";
const {
  statusBarHeight, activeTab, visibleStatuses,
  pendingFriendsCount, myProfile,
  openFriendsSheet, openMyProfileSheet,
} = useAppState();
</script>
