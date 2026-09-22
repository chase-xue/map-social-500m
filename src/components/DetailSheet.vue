<template>
  <view v-if="detailVisible" class="modal-mask" @tap="closeDetailSheet">
    <view class="detail-sheet" @tap.stop>
      <view class="sheet-handle-bar" @tap="closeDetailSheet">
        <view class="sheet-handle" />
      </view>
      <scroll-view scroll-y class="detail-scroll-content">
        <view class="author-row">
          <view class="avatar-clickable-wrapper" @tap="viewAuthorProfile(activeStatus)">
            <image class="author-avatar" :src="activeStatus?.userAvatar" mode="aspectFill" />
            <text class="click-avatar-hint">查资料</text>
          </view>
          <view class="author-meta" @tap="viewAuthorProfile(activeStatus)">
            <view class="name-box">
              <text class="author-name">{{ activeStatus?.userName }}</text>
              <text v-if="activeStatus?.userId === myProfile.id" class="my-badge">我发的</text>
              <text v-if="activeStatus?.authorProfile?.gender" class="gender-badge" :class="activeStatus.authorProfile.gender === '女' ? 'gender-female' : 'gender-male'">
                {{ activeStatus.authorProfile.gender === '女' ? '♀' : '♂' }} {{ activeStatus.authorProfile.age }}岁
              </text>
            </view>
            <view class="meta-sub">
              <text class="meta-time">{{ activeStatus?.createdAt ? formatTime(activeStatus.createdAt) : '' }}</text>
              <text class="meta-dot">•</text>
              <text class="meta-distance">📍 距离你 {{ activeStatus?.distance }} 米</text>
            </view>
          </view>
          <view class="close-btn" @tap="closeDetailSheet">✕</view>
        </view>
        <view class="status-content">
          <text class="status-text">{{ activeStatus?.content }}</text>
        </view>
        <view v-if="activeStatus?.images && activeStatus.images.length > 0" class="image-gallery">
          <image v-for="(img, idx) in activeStatus.images" :key="idx" class="gallery-image" :src="img" mode="aspectFill" @tap="previewImage(img, activeStatus.images)" />
        </view>
        <view class="comments-section">
          <view class="comments-header">
            <text class="comments-title">留言互动 ({{ activeStatus?.comments?.length || 0 }})</text>
            <view class="mock-comment-btn" @tap="triggerMockStrangerComment">
              <text>🤖 模拟路人评价</text>
            </view>
          </view>
          <view v-if="!activeStatus?.comments || activeStatus.comments.length === 0" class="empty-comments">
            <text>暂无留言，可在下方输入评价或点击"模拟路人评价"测试互动~</text>
          </view>
          <view v-else class="comments-list">
            <view v-for="cmt in activeStatus.comments" :key="cmt.id" class="comment-card" :class="{ 'my-comment-card': cmt.userId === myProfile.id }">
              <view @tap="viewCommenterProfile(cmt)">
                <image class="comment-avatar" :src="cmt.userAvatar" mode="aspectFill" />
              </view>
              <view class="comment-body">
                <view class="comment-top">
                  <text class="comment-user">{{ cmt.userName }}</text>
                  <text class="comment-time">{{ formatTime(cmt.createdAt) }}</text>
                </view>
                <text class="comment-text">{{ cmt.content }}</text>
                <view v-if="cmt.images && cmt.images.length > 0" class="comment-photo-row">
                  <image v-for="(cImg, ci) in cmt.images" :key="ci" class="comment-attached-photo" :src="cImg" mode="aspectFill" @tap.stop="previewImage(cImg, cmt.images)" />
                  <text class="photo-zoom-tag" @tap.stop="previewImage(cmt.images[0], cmt.images)">🔍 点击放大</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
      <view v-if="pickedCommentImage" class="comment-img-preview-bar">
        <view class="comment-preview-box">
          <image class="comment-preview-img" :src="pickedCommentImage" mode="aspectFill" @tap="previewImage(pickedCommentImage, [pickedCommentImage])" />
          <view class="comment-img-del" @tap="removeCommentImage">✕</view>
        </view>
        <text class="comment-img-tip">已添加评论配图 (点击可查看大图 / ✕ 删除)</text>
      </view>
      <view class="comment-input-bar">
        <picker :range="commentRoleOptions" :value="selectedRoleIndex" @change="onRoleChange" class="role-picker">
          <view class="role-badge">
            <text>{{ commentRoleOptions[selectedRoleIndex] }}</text>
            <text class="arrow-down">▾</text>
          </view>
        </picker>
        <input class="comment-input" v-model="newCommentText" placeholder="写下留言评价..." placeholder-class="input-placeholder" confirm-type="send" @confirm="handleSendComment" />
        <view class="comment-media-btns">
          <view class="comment-cam-btn" @tap="chooseCommentImage" title="从相册上传照片">
            <text>📷</text>
          </view>
          <view v-if="!pickedCommentImage" class="comment-preset-btn" @tap="usePresetCommentImage" title="示例配图">
            <text>🌄</text>
          </view>
        </view>
        <button class="comment-send-btn" :disabled="!newCommentText.trim() && !pickedCommentImage" @tap="handleSendComment" hover-class="btn-hover">
          发送
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";
const {
  detailVisible, activeStatus, myProfile,
  pickedCommentImage, commentRoleOptions, selectedRoleIndex,
  closeDetailSheet, viewAuthorProfile, viewCommenterProfile, previewImage,
  formatTime, triggerMockStrangerComment, removeCommentImage,
  onRoleChange, chooseCommentImage, usePresetCommentImage, handleSendComment,
} = useAppState();
</script>
