<template>
  <scroll-view
    scroll-y
    class="moments-scroll-view"
    :style="{ paddingTop: (statusBarHeight + 58) + 'px' }"
  >
    <view class="moments-cover-section">
      <image class="moments-cover-img" src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1000&auto=format&fit=crop&q=80" mode="aspectFill" />
      <view class="moments-cover-overlay" />
      <view class="moments-user-badge" @tap="openMyProfileSheet">
        <text class="moments-my-name">{{ myProfile.name }}</text>
        <image class="moments-my-avatar" :src="myProfile.avatar" mode="aspectFill" />
      </view>
    </view>

    <view class="moments-info-banner">
      <view class="banner-left">
        <view class="banner-title-row">
          <text class="banner-title">⏱️ 500米朋友圈</text>
          <text class="banner-badge">发布时间倒序</text>
        </view>
        <text class="banner-desc">仅展示当前500米范围内邻友动态 · 新发布排在最前面</text>
      </view>
      <button class="moments-quick-post-btn" @tap="openPublishSheet" hover-class="btn-hover">
        <text class="post-icon">📷</text>
        <text class="post-text">发圈</text>
      </button>
    </view>

    <view v-if="sortedMomentsStatuses.length === 0" class="moments-empty-card">
      <text class="empty-icon">🍃</text>
      <text class="empty-title">周边 500 米内暂无动态</text>
      <text class="empty-desc">成为这里第一个发朋友圈的人吧，500米内的邻友都能看到！</text>
      <button class="empty-post-btn" @tap="openPublishSheet">立即发布第一条动态</button>
    </view>

    <view class="moments-feed-list">
      <view v-for="item in sortedMomentsStatuses" :key="item.id" class="moment-card">
        <view class="moment-avatar-col" @tap="viewAuthorProfile(item)">
          <image class="moment-author-avatar" :src="item.userAvatar" mode="aspectFill" />
        </view>
        <view class="moment-main-col">
          <view class="moment-author-header">
            <view class="author-name-row" @tap="viewAuthorProfile(item)">
              <text class="moment-author-name">{{ item.userName }}</text>
              <text v-if="item.userId === myProfile.id" class="moment-my-tag">我发的</text>
              <text v-if="item.authorProfile?.gender" class="moment-gender-tag" :class="item.authorProfile.gender === '女' ? 'female' : 'male'">
                {{ item.authorProfile.gender === '女' ? '♀' : '♂' }} {{ item.authorProfile.age }}岁
              </text>
            </view>
            <view class="moment-distance-tag"><text>📍 {{ item.distance }}米</text></view>
          </view>
          <view class="moment-content-text"><text>{{ item.content }}</text></view>
          <view v-if="item.images && item.images.length > 0" class="moment-media-grid" :class="item.images.length === 1 ? 'single-image' : item.images.length === 4 ? 'grid-4' : 'grid-multi'">
            <image v-for="(img, idx) in item.images" :key="idx" class="moment-grid-img" :src="img" mode="aspectFill" @tap="previewImage(img, item.images)" />
          </view>
          <view class="moment-meta-row">
            <view class="meta-left">
              <text class="moment-time">{{ formatTime(item.createdAt) }}</text>
              <text class="meta-dot">·</text>
              <text class="moment-loc-text">距离你 {{ item.distance }}m</text>
            </view>
            <view class="moment-action-tools">
              <view class="action-tool-btn like-tool-btn" :class="{ liked: (item.likes || []).includes(myProfile.name) }" @tap="toggleLikeStatus(item)" hover-class="btn-hover">
                <text class="tool-icon">{{ (item.likes || []).includes(myProfile.name) ? '❤️' : '🤍' }}</text>
                <text class="tool-text">{{ (item.likes || []).length > 0 ? (item.likes || []).length : '赞' }}</text>
              </view>
              <view class="action-tool-btn comment-tool-btn" @tap="openDetailSheet(item)" hover-class="btn-hover">
                <text class="tool-icon">💬</text>
                <text class="tool-text">{{ (item.comments || []).length > 0 ? (item.comments || []).length : '留言' }}</text>
              </view>
            </view>
          </view>
          <view v-if="((item.likes && item.likes.length > 0) || (item.comments && item.comments.length > 0))" class="moment-interactions-box">
            <view class="bubble-arrow" />
            <view v-if="item.likes && item.likes.length > 0" class="moment-likes-list">
              <text class="heart-icon">❤️</text>
              <text class="likes-names">{{ item.likes.join('、') }}</text>
            </view>
            <view v-if="item.likes && item.likes.length > 0 && item.comments && item.comments.length > 0" class="interactions-divider" />
            <view v-if="item.comments && item.comments.length > 0" class="moment-comments-list">
              <view v-for="cmt in item.comments" :key="cmt.id" class="moment-comment-line">
                <view class="cmt-text-block">
                  <text class="cmt-user" @tap.stop="viewCommenterProfile(cmt)">{{ cmt.userName }}</text>
                  <text class="cmt-colon">：</text>
                  <text class="cmt-content">{{ cmt.content }}</text>
                </view>
                <view v-if="cmt.images && cmt.images.length > 0" class="cmt-attached-img-box">
                  <image class="cmt-attached-img" :src="cmt.images[0]" mode="aspectFill" @tap.stop="previewImage(cmt.images[0], cmt.images)" />
                  <text class="cmt-img-zoom-hint" @tap.stop="previewImage(cmt.images[0], cmt.images)">🔍 点击放大</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="moments-bottom-padding" />
  </scroll-view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";
const {
  statusBarHeight, myProfile, sortedMomentsStatuses,
  openMyProfileSheet, openPublishSheet, viewAuthorProfile, viewCommenterProfile,
  previewImage, toggleLikeStatus, openDetailSheet, formatTime,
} = useAppState();
</script>
