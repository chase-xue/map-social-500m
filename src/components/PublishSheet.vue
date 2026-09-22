<template>
  <view v-if="publishVisible" class="modal-mask" @tap="closePublishSheet">
    <view class="publish-sheet" @tap.stop>
      <view class="publish-header">
        <text class="publish-title">在当前位置发布状态</text>
        <view class="close-btn" @tap="closePublishSheet">✕</view>
      </view>
      <view class="publisher-profile-bar" @tap="openMyProfileSheet">
        <image class="bar-avatar" :src="myProfile.avatar" mode="aspectFill" />
        <view class="bar-text">
          <text class="bar-name">{{ myProfile.name }} ({{ myProfile.gender }}, {{ myProfile.age }}岁)</text>
          <text class="bar-bio">{{ myProfile.bio }}</text>
        </view>
        <text class="bar-edit-btn">修改资料 ›</text>
      </view>
      <view class="location-badge">
        <text class="loc-icon">📍</text>
        <text class="loc-text">已绑定当前坐标：{{ userLocation.latitude.toFixed(4) }}, {{ userLocation.longitude.toFixed(4) }} (自动打点)</text>
      </view>
      <textarea class="status-textarea" v-model="newPostContent" placeholder="写下此刻周边的风景、心情或留言... (发布后将自动打点在地图上)" maxlength="300" placeholder-class="input-placeholder" :cursor-spacing="20" />
      <view class="quick-tags-row">
        <text class="quick-tip">快捷填入:</text>
        <text class="tag-chip" @tap="newPostContent = '巷口拐角的手冲咖啡今天新到了埃塞豆，柑橘香气超浓☕'">☕ 咖啡飘香</text>
        <text class="tag-chip" @tap="newPostContent = '沿河公园步道的桂花全开了🌸散步好舒服'">🌸 桂花真香</text>
        <text class="tag-chip" @tap="newPostContent = '今天在草坪偶遇一只超级活泼的小柴犬🐾'">🐾 偶遇小狗</text>
      </view>
      <view class="media-picker-area">
        <view v-for="(img, index) in pickedImages" :key="index" class="picked-img-box">
          <image class="picked-img" :src="img" mode="aspectFill" @tap="previewImage(img, pickedImages)" />
          <view class="img-delete-btn" @tap="removePickedImage(index)">✕</view>
        </view>
        <view v-if="pickedImages.length < 3" class="pick-btn" @tap="chooseImages" hover-class="btn-hover">
          <text class="pick-camera-icon">📷</text>
          <text class="pick-tip">本地相册/拍照</text>
          <text class="pick-count">({{ pickedImages.length }}/3)</text>
        </view>
        <view v-if="pickedImages.length === 0" class="sample-img-btn" @tap="usePresetImage" hover-class="btn-hover">
          <text class="sample-icon">🌄</text>
          <text class="sample-tip">选用精美配图</text>
        </view>
      </view>
      <view class="storage-tip">
        <text class="tip-icon">💾</text>
        <text class="tip-text">发布时将自动附带您的个人资料卡，别人点击头像即可查看</text>
      </view>
      <button class="submit-publish-btn" :loading="isPublishing" :disabled="isPublishing || (!newPostContent.trim() && pickedImages.length === 0)" @tap="submitNewPost" hover-class="btn-hover">
        立即发布并打点展示
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";
const {
  publishVisible, myProfile, userLocation, newPostContent, pickedImages, isPublishing,
  closePublishSheet, openMyProfileSheet, previewImage, removePickedImage, chooseImages,
  usePresetImage, submitNewPost,
} = useAppState();
</script>
