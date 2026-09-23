<template>
  <view v-if="detailVisible" class="modal-mask" @tap="closeDetailSheet(false)">
    <view class="detail-sheet" @tap.stop>
      <!-- 固定顶部栏：拖动把手 + 明显的右上角关闭按钮 -->
      <view class="detail-header-bar">
        <view class="sheet-handle" @tap="closeDetailSheet(true)" />
        <view class="detail-close-btn" @tap="closeDetailSheet(true)" hover-class="btn-hover" title="关闭详情">✕</view>
      </view>

      <scroll-view scroll-y class="detail-scroll-content">
        <view class="detail-scroll-inner">
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
          </view>

          <!-- 求助帖专属状态卡片 (解决2小时后自动消失) -->
          <view
            v-if="activeStatus?.isHelp && isHelpResolvedPromptVisible(activeStatus)"
            class="help-status-card"
            :class="{ 'is-emergency-card': activeStatus.isEmergency && !activeStatus.helpResolved, 'is-resolved-card': activeStatus.helpResolved }"
          >
            <view class="help-status-top">
              <view class="status-indicator">
                <text class="status-badge-icon">{{ activeStatus.helpResolved ? '✅' : activeStatus.isEmergency ? '🚨' : '🆘' }}</text>
                <text class="status-badge-text">
                  {{ activeStatus.helpResolved ? '求助已圆满解决 · 发起人已关闭 (提示将于2小时后隐去)' : activeStatus.isEmergency ? '救命紧急呼救进行中！' : '邻里急事求助中' }}
                </text>
              </view>
              <!-- 仅发起人可见的解决关闭按钮 -->
              <button
                v-if="activeStatus.userId === myProfile.id && !activeStatus.helpResolved"
                class="close-help-btn"
                @tap="handleCloseHelp(activeStatus.id)"
                hover-class="btn-hover"
              >
                ✅ 问题已解决，关闭求助
              </button>
            </view>
            <view v-if="activeStatus.helpContactPhone && !activeStatus.helpResolved" class="help-phone-line" @tap="makePhoneCall(activeStatus.helpContactPhone)">
              <text class="phone-label">📞 紧急联系电话：</text>
              <text class="phone-num">{{ activeStatus.helpContactPhone }}</text>
              <text class="phone-dial-tag">立即拨打 ›</text>
            </view>
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
            </view>
            <view v-if="!activeStatus?.comments || activeStatus.comments.length === 0" class="empty-comments">
              <text>暂无留言，在下方写下第一条真实评价吧~</text>
            </view>
            <view v-else class="comments-list">
              <view v-for="cmt in activeStatus.comments" :key="cmt.id" class="comment-card" :class="{ 'my-comment-card': cmt.userId === myProfile.id }">
                <view @tap="viewCommenterProfile(cmt)">
                  <image class="comment-avatar" :src="cmt.userAvatar" mode="aspectFill" />
                </view>
                <view class="comment-body">
                  <view class="comment-top">
                    <text class="comment-user">{{ cmt.userName }}</text>
                    <text v-if="cmt.userId === myProfile.id" class="my-comment-tag">我</text>
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
        </view>
      </scroll-view>
      <view v-if="pickedCommentImage" class="comment-img-preview-bar">
        <view class="comment-preview-box">
          <image class="comment-preview-img" :src="pickedCommentImage" mode="aspectFill" @tap="previewImage(pickedCommentImage, [pickedCommentImage])" />
          <view class="comment-img-del" @tap="removeCommentImage">✕</view>
        </view>
        <text class="comment-img-tip">已添加评论配图 (点击查看大图 / ✕ 删除)</text>
      </view>
      <view class="comment-input-bar">
        <view class="current-user-avatar-tag" title="当前发表身份">
          <image class="comment-my-avatar" :src="myProfile.avatar" mode="aspectFill" />
        </view>
        <input
          class="comment-input"
          v-model="newCommentText"
          :placeholder="activeStatus?.userId === myProfile.id ? '我是发布者，写下最新进展或回复...' : '写下你的真实评价...'"
          placeholder-class="input-placeholder"
          confirm-type="send"
          @confirm="handleSendComment"
        />
        <view class="comment-media-btns">
          <view class="comment-cam-btn" @tap="chooseCommentImage" title="从相册上传照片">
            <text>📷</text>
          </view>
        </view>
        <button class="comment-send-btn" :disabled="(!newCommentText || !newCommentText.trim()) && !pickedCommentImage" @tap="handleSendComment" hover-class="btn-hover">
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
  newCommentText, pickedCommentImage,
  closeDetailSheet, viewAuthorProfile, viewCommenterProfile, previewImage,
  formatTime, removeCommentImage,
  chooseCommentImage, handleSendComment, handleCloseHelp, makePhoneCall, isHelpResolvedPromptVisible,
} = useAppState();
</script>

<style lang="scss" scoped>
.help-status-card {
  margin: 16rpx 0;
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background-color: #fffbeb;
  border: 2rpx solid #f59e0b;

  &.is-emergency-card {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border-color: #ef4444;
    box-shadow: 0 4rpx 16rpx rgba(239, 68, 68, 0.2);

    .status-badge-text { color: #b91c1c; font-weight: 800; }
  }

  &.is-resolved-card {
    background-color: #ecfdf5;
    border-color: #10b981;

    .status-badge-text { color: #047857; }
  }

  .help-status-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .status-badge-icon { font-size: 28rpx; }
      .status-badge-text { font-size: 24rpx; font-weight: 700; color: #b45309; }
    }

    .close-help-btn {
      margin: 0;
      padding: 0 20rpx;
      height: 56rpx;
      line-height: 56rpx;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      font-size: 20rpx;
      font-weight: 700;
      border-radius: 28rpx;
      box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.35);
      flex-shrink: 0;
    }
  }

  .help-phone-line {
    margin-top: 14rpx;
    padding-top: 12rpx;
    border-top: 1rpx dashed rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;

    .phone-label { font-size: 22rpx; color: #475569; font-weight: 600; }
    .phone-num { font-size: 24rpx; color: #2563eb; font-weight: 700; }
    .phone-dial-tag { font-size: 20rpx; color: #2563eb; font-weight: 600; }
  }
}
</style>
