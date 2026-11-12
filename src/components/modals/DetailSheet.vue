<template>
  <view
    v-if="detailVisible"
    class="wechat-detail-page"
    :style="{ paddingTop: statusBarHeight + 'px' }"
  >
    <!-- 1. 微信原生顶栏: ‹ 返回 | 详情 | 点赞/更多 -->
    <view class="wechat-detail-header">
      <view class="header-back-btn" @tap="closeDetailSheet(true)">
        <text class="back-arrow">‹</text>
        <text class="back-text">返回</text>
      </view>

      <view class="header-title-box">
        <text class="header-title">
          {{ activeStatus?.isEmergency ? '救命呼救详情' : activeStatus?.isHelp ? '急事求助详情' : '动态详情' }}
        </text>
      </view>

      <view class="header-action-box">
        <view
          v-if="activeStatus"
          class="header-like-btn"
          :class="{ 'is-liked': isLiked }"
          @tap="handleToggleLike"
        >
          <text class="like-icon">{{ isLiked ? '❤️' : '🤍' }}</text>
          <text class="like-text">{{ isLiked ? '已赞' : '点赞' }}</text>
        </view>
      </view>
    </view>

    <!-- 2. 微信朋友圈原生风格滚动内容区 -->
    <scroll-view scroll-y class="detail-scroll-view">
      <view class="detail-content-wrap">
        <!-- 作者信息栏 -->
        <view class="wechat-author-row">
          <image
            class="wechat-author-avatar"
            :src="activeStatus?.userAvatar"
            mode="aspectFill"
            @tap="viewAuthorProfile(activeStatus)"
          />
          <view class="author-info-col" @tap="viewAuthorProfile(activeStatus)">
            <view class="author-name-row">
              <text class="author-name">{{ activeStatus?.userName }}</text>
              <text v-if="activeStatus?.isAcgn" class="acgn-badge">🌸 二次元 · {{ activeStatus.acgnTag || '同好' }}</text>
              <text v-if="activeStatus?.userId === myProfile.id" class="author-badge-me">我</text>
              <text
                v-if="activeStatus?.authorProfile?.gender"
                class="gender-pill"
                :class="activeStatus.authorProfile.gender === '女' ? 'gender-female' : 'gender-male'"
              >
                {{ activeStatus.authorProfile.gender === '女' ? '♀' : '♂' }} {{ activeStatus.authorProfile.age }}岁
              </text>
            </view>
            <view class="author-meta-row">
              <text class="meta-time">{{ activeStatus?.createdAt ? formatTime(activeStatus.createdAt) : '' }}</text>
              <text class="meta-dot">·</text>
              <text class="meta-dist">📍 {{ distanceText }}</text>
            </view>
          </view>

          <!-- 进TA桌洞按钮 (精致木窗拟物图标，杜绝日字乱码) -->
          <view class="desk-entry-btn" @tap.stop="goToAuthorDesk">
            <svg class="desk-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
            <text class="desk-btn-label">进TA桌洞</text>
          </view>
        </view>

        <!-- 商户优惠福利便签横幅 -->
        <view v-if="activeStatus?.isMerchant" class="merchant-badge-banner">
          <text class="m-icon">🏪</text>
          <text class="m-text">【商户福利便签】{{ activeStatus?.merchantDiscount || '凭500米圈便签立享专属打卡优惠！' }}</text>
        </view>

        <!-- 3. 急事/救命求助服务提醒横幅 (如果是求助帖) -->
        <view
          v-if="activeStatus?.isHelp && isHelpResolvedPromptVisible(activeStatus)"
          class="wechat-service-banner"
          :class="{
            'banner-emergency': activeStatus.isEmergency && !activeStatus.helpResolved,
            'banner-resolved': activeStatus.helpResolved,
            'banner-help': !activeStatus.isEmergency && !activeStatus.helpResolved
          }"
        >
          <view class="banner-top-row">
            <view class="banner-badge-title">
              <text class="banner-icon">{{ activeStatus.helpResolved ? '✅' : activeStatus.isEmergency ? '🚨' : '🆘' }}</text>
              <text class="banner-main-text">
                {{
                  activeStatus.helpResolved
                    ? '求助已圆满解决 · 发起人已关闭'
                    : activeStatus.isEmergency
                    ? '救命紧急呼救进行中！'
                    : '邻里急事求助中'
                }}
              </text>
            </view>

            <!-- 仅发起人可见的微信绿解决按钮 -->
            <button
              v-if="activeStatus.userId === myProfile.id && !activeStatus.helpResolved"
              class="banner-resolve-btn"
              @tap="handleCloseHelp(activeStatus.id)"
            >
              ✅ 问题已解决，关闭求助
            </button>
          </view>

          <!-- 紧急联系电话行 -->
          <view
            v-if="activeStatus.helpContactPhone && !activeStatus.helpResolved"
            class="banner-phone-row"
            @tap="makePhoneCall(activeStatus.helpContactPhone)"
          >
            <text class="phone-label">📞 紧急联系电话：</text>
            <text class="phone-number">{{ activeStatus.helpContactPhone }}</text>
            <text class="phone-dial-btn">立即拨打 ›</text>
          </view>
        </view>

        <!-- 4. 正文文字内容 或 手写真迹纸条 -->
        <view v-if="isHandwritingImg(activeStatus?.content)" class="status-handwriting-card" :class="'paper-' + (activeStatus?.paperColor || 'yellow')">
          <view class="washi-tape-strip" />
          <image
            class="status-hw-full-img"
            :src="activeStatus?.content"
            mode="widthFix"
            @tap="previewImage(activeStatus?.content, [activeStatus?.content])"
          />
        </view>
        <view v-else class="status-body-text">
          <text>{{ activeStatus?.content }}</text>
        </view>

        <!-- 5. 微信九宫格 / 单图媒体展示区 -->
        <view
          v-if="activeStatus?.images && activeStatus.images.length > 0"
          class="media-gallery-box"
          :class="{
            'single-image-mode': activeStatus.images.length === 1,
            'four-grid-mode': activeStatus.images.length === 4
          }"
        >
          <image
            v-for="(img, idx) in activeStatus.images"
            :key="idx"
            class="gallery-thumb"
            :src="img"
            :mode="activeStatus.images.length === 1 ? 'aspectFit' : 'aspectFill'"
            @tap="previewImage(img, activeStatus.images)"
          />
        </view>

        <!-- 6. 微信位置与 500m 空间胶囊 -->
        <view class="location-capsule-row">
          <text class="location-text">📍 北京 · 500米地理生活圈 ›</text>
        </view>

        <!-- 7. 微信朋友圈点赞名单灰框 -->
        <view class="likes-summary-box">
          <text class="likes-heart-icon">❤️</text>
          <text class="likes-user-names">
            {{ likesSummaryText }}
          </text>
        </view>

        <!-- 8. 微信原生留言互动评论流 -->
        <view class="wechat-comments-block">
          <view class="comments-section-header">
            <text class="comments-section-title">留言互动 ({{ activeStatus?.comments?.length || 0 }})</text>
          </view>

          <!-- 空留言提示 -->
          <view v-if="!activeStatus?.comments || activeStatus.comments.length === 0" class="empty-comments-box">
            <text class="empty-text">暂无留言，在下方写下第一条真实评价吧~</text>
          </view>

          <!-- 评论列表 -->
          <view v-else class="comments-stream">
            <view
              v-for="cmt in activeStatus.comments"
              :key="cmt.id"
              class="comment-row-item"
            >
              <image
                class="comment-author-avatar"
                :src="cmt.userAvatar"
                mode="aspectFill"
                @tap="viewCommenterProfile(cmt)"
              />
              <view class="comment-content-col">
                <view class="comment-author-top">
                  <view class="comment-name-badge-wrap">
                    <text class="comment-author-name" @tap="viewCommenterProfile(cmt)">{{ cmt.userName }}</text>
                    <text class="reply-type-tag" :class="cmt.isLocalReply !== false ? 'tag-local' : 'tag-remote'">
                      {{ cmt.isLocalReply !== false ? '📍 现场回复' : '🌐 远程留言' }}
                    </text>
                    <text v-if="cmt.userId === activeStatus?.userId" class="author-owner-tag">作者</text>
                    <text v-else-if="cmt.userId === myProfile.id" class="author-me-tag">我</text>
                  </view>
                  <text class="comment-post-time">{{ formatTime(cmt.createdAt) }}</text>
                </view>

                <!-- 评论正文 -->
                <view class="comment-text-box">
                  <text class="comment-text">{{ cmt.content }}</text>
                </view>

                <!-- 评论配图 (如果有) -->
                <view v-if="cmt.images && cmt.images.length > 0" class="comment-photo-wrap">
                  <image
                    v-for="(cImg, ci) in cmt.images"
                    :key="ci"
                    class="comment-photo-thumb"
                    :src="cImg"
                    mode="aspectFill"
                    @tap.stop="previewImage(cImg, cmt.images)"
                  />
                  <text class="photo-zoom-hint" @tap.stop="previewImage(cmt.images[0], cmt.images)">🔍 点击查看大图</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 9. 微信原生固定底部评论回复栏 -->
    <view class="wechat-bottom-bar-wrap">
      <!-- 评论待上传配图预览条 -->
      <view v-if="pickedCommentImage" class="comment-img-preview-bar">
        <view class="comment-preview-box">
          <image
            class="comment-preview-img"
            :src="pickedCommentImage"
            mode="aspectFill"
            @tap="previewImage(pickedCommentImage, [pickedCommentImage])"
          />
          <view class="comment-img-del" @tap="removeCommentImage">✕</view>
        </view>
        <text class="comment-img-tip">已添加评论配图 (点击查看大图 / ✕ 删除)</text>
      </view>

      <!-- 输入栏主体 -->
      <view class="wechat-reply-input-bar">
        <image
          class="reply-user-avatar"
          :src="myProfile.avatar"
          mode="aspectFill"
          title="当前回复身份"
        />

        <input
          class="reply-text-input"
          v-model="newCommentText"
          :placeholder="activeStatus?.userId === myProfile.id ? '我是发布者，写下最新进展或回复...' : '写下你的真实评价...'"
          placeholder-class="wechat-input-placeholder"
          confirm-type="send"
          @confirm="handleSendComment"
        />

        <view class="reply-cam-btn" @tap="chooseCommentImage" title="从相册上传配图">
          <text class="cam-icon">📷</text>
        </view>

        <button
          class="reply-send-btn"
          :class="{ 'btn-send-active': canSendComment }"
          :disabled="!canSendComment"
          @tap="handleSendComment"
        >
          发送
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppState } from "../../composables/useAppState";
import { formatDistance } from "../../services/geo";

const {
  detailVisible,
  activeStatus,
  myProfile,
  statusBarHeight,
  newCommentText,
  pickedCommentImage,
  closeDetailSheet,
  viewAuthorProfile,
  viewCommenterProfile,
  previewImage,
  formatTime,
  removeCommentImage,
  chooseCommentImage,
  handleSendComment,
  handleCloseHelp,
  makePhoneCall,
  isHelpResolvedPromptVisible,
  toggleLikeStatus,
  switchMainTab,
  visitDesk,
} = useAppState();

function goToAuthorDesk() {
  if (!activeStatus.value) return;
  closeDetailSheet(true);
  visitDesk(activeStatus.value.userId, activeStatus.value.userName, activeStatus.value.userAvatar);
}

function isHandwritingImg(content?: string): boolean {
  if (!content) return false;
  return content.startsWith("data:image/") || content.startsWith("http");
}

const isLiked = computed(() => {
  if (!activeStatus.value?.likes) return false;
  return activeStatus.value.likes.includes(myProfile.value.name);
});

const distanceText = computed(() => {
  return formatDistance(activeStatus.value?.distance);
});

const likesSummaryText = computed(() => {
  const likes = activeStatus.value?.likes;
  if (!likes || likes.length === 0) {
    return "周边邻友尚未点赞，点击右上角成为第一个点赞的人吧";
  }
  return likes.join("、 ");
});

const canSendComment = computed(() => {
  const hasText = !!(newCommentText.value && newCommentText.value.trim());
  const hasImg = !!pickedCommentImage.value;
  return hasText || hasImg;
});

function handleToggleLike() {
  if (activeStatus.value) {
    toggleLikeStatus(activeStatus.value);
  }
}
</script>

<style lang="scss" scoped>
/* 治愈手账全屏页面容器 */
.wechat-detail-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f7f5f0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 拟物手账优雅顶栏 */
.wechat-detail-header {
  height: 88rpx;
  background-color: #f7f5f0;
  border-bottom: 1rpx solid #ebd9c5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  flex-shrink: 0;
  box-sizing: border-box;

  .header-back-btn {
    display: flex;
    align-items: center;
    cursor: pointer;
    min-width: 140rpx;

    .back-arrow {
      font-size: 44rpx;
      color: #3e2723;
      line-height: 1;
      margin-right: 4rpx;
      margin-top: -4rpx;
      font-weight: 300;
    }

    .back-text {
      font-size: 30rpx;
      color: #3e2723;
      font-weight: 500;
    }
  }

  .header-title-box {
    flex: 1;
    text-align: center;

    .header-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #3e2723;
    }
  }

  .header-action-box {
    min-width: 140rpx;
    display: flex;
    justify-content: flex-end;

    .header-like-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 14px;
      border-radius: 16px;
      background-color: #fbf5ea;
      border: 1px solid #ebd9c5;
      cursor: pointer;
      transition: all 0.15s ease;

      &:active {
        transform: scale(0.96);
      }

      .like-icon {
        font-size: 14px;
      }

      .like-text {
        font-size: 12px;
        color: #8c5835;
        font-weight: 600;
      }

      &.is-liked {
        background-color: #fee2e2;
        border-color: #fca5a5;
        .like-text {
          color: #dc2626;
        }
      }
    }
  }
}

/* 滚动区 */
.detail-scroll-view {
  flex: 1;
  min-height: 0;
  background-color: #f7f5f0;
}

.detail-content-wrap {
  margin: 20rpx 20rpx 40rpx;
  padding: 30rpx 28rpx;
  background: #ffffff;
  border: 1rpx solid #ebd9c5;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(62, 39, 35, 0.05);
  box-sizing: border-box;
}

/* 作者行 */
.wechat-author-row {
  display: flex;
  align-items: center;
  gap: 20rpx;

  .wechat-author-avatar {
    width: 88rpx;
    height: 88rpx;
    border-radius: 16rpx;
    background-color: #f1f5f9;
    flex-shrink: 0;
    cursor: pointer;
    box-shadow: 0 2rpx 8rpx rgba(62, 39, 35, 0.08);
  }

  .author-info-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: pointer;

    .author-name-row {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 6rpx;

      .author-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #3e2723;
      }

      .acgn-badge {
        font-size: 20rpx;
        color: #db2777;
        background-color: #fdf2f8;
        border: 1rpx solid #fbcfe8;
        padding: 2rpx 12rpx;
        border-radius: 9999rpx;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
      }

      .author-badge-me {
        font-size: 20rpx;
        color: #07c160;
        background-color: #e8f8f0;
        padding: 2rpx 12rpx;
        border-radius: 8rpx;
        font-weight: 600;
      }

      .gender-pill {
        font-size: 20rpx;
        padding: 2rpx 12rpx;
        border-radius: 8rpx;
        font-weight: 600;

        &.gender-female {
          background-color: #fdf2f8;
          color: #db2777;
        }

        &.gender-male {
          background-color: #eff6ff;
          color: #2563eb;
        }
      }
    }

    .author-meta-row {
      display: flex;
      align-items: center;
      gap: 10rpx;

      .meta-time {
        font-size: 24rpx;
        color: #999999;
      }

      .meta-dot {
        font-size: 24rpx;
        color: #999999;
      }

      .meta-dist {
        font-size: 24rpx;
        color: #576b95;
        font-weight: 500;
      }
    }
  }
}

/* 微信求助/救命横幅 */
.wechat-service-banner {
  margin-top: 24rpx;
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 14rpx;

  &.banner-emergency {
    background-color: #fef2f2;
    border-left: 8rpx solid #ef4444;

    .banner-main-text {
      color: #b91c1c;
      font-weight: 700;
    }
  }

  &.banner-help {
    background-color: #fffbeb;
    border-left: 8rpx solid #f59e0b;

    .banner-main-text {
      color: #b45309;
      font-weight: 600;
    }
  }

  &.banner-resolved {
    background-color: #ecfdf5;
    border-left: 8rpx solid #10b981;

    .banner-main-text {
      color: #047857;
      font-weight: 600;
    }
  }

  .banner-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;

    .banner-badge-title {
      display: flex;
      align-items: center;
      gap: 10rpx;

      .banner-icon {
        font-size: 32rpx;
      }

      .banner-main-text {
        font-size: 26rpx;
      }
    }

    .banner-resolve-btn {
      margin: 0;
      padding: 0 20rpx;
      height: 56rpx;
      line-height: 56rpx;
      background-color: #07c160;
      color: #ffffff;
      font-size: 22rpx;
      font-weight: 600;
      border-radius: 8rpx;
      border: none;
      flex-shrink: 0;
    }
  }

  .banner-phone-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12rpx;
    border-top: 1rpx dashed rgba(0, 0, 0, 0.08);
    cursor: pointer;

    .phone-label {
      font-size: 24rpx;
      color: #4b5563;
      font-weight: 500;
    }

    .phone-number {
      font-size: 26rpx;
      color: #576b95;
      font-weight: 700;
    }

    .phone-dial-btn {
      font-size: 22rpx;
      color: #07c160;
      font-weight: 600;
    }
  }
}

/* 动态正文 */
.status-body-text {
  margin-top: 24rpx;
  font-size: 32rpx;
  color: #1f2937;
  line-height: 1.6;
  word-break: break-all;
}

/* 动态真迹手写和纸便签卡片 */
.status-handwriting-card {
  margin: 20rpx 0 24rpx;
  border-radius: 12rpx;
  padding: 24rpx 16rpx 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  .washi-tape-strip {
    position: absolute;
    top: -12rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 68rpx;
    height: 18rpx;
    background: rgba(255, 255, 255, 0.85);
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
    border-left: 2rpx dashed rgba(0, 0, 0, 0.2);
    border-right: 2rpx dashed rgba(0, 0, 0, 0.2);
  }

  .status-hw-full-img {
    width: 100%;
    border-radius: 6rpx;
    object-fit: contain;
  }
}

.paper-yellow { background: #fff9c4; color: #4e342e; }
.paper-pink   { background: #fce4ec; color: #4a148c; }
.paper-blue   { background: #e1f5fe; color: #01579b; }
.paper-green  { background: #e8f5e9; color: #1b5e20; }
.paper-kraft  { background: #efebe9; color: #3e2723; }

/* 九宫格媒体区 */
.media-gallery-box {
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10rpx;

  &.single-image-mode {
    display: block;
    .gallery-thumb {
      max-width: 480rpx;
      max-height: 480rpx;
      width: auto;
      height: auto;
      border-radius: 8rpx;
    }
  }

  &.four-grid-mode {
    grid-template-columns: repeat(2, 1fr);
    max-width: 480rpx;
  }

  .gallery-thumb {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8rpx;
    background-color: #f1f5f9;
    cursor: pointer;
  }
}

/* 位置标签 */
.location-capsule-row {
  margin-top: 20rpx;
  display: flex;
  align-items: center;

  .location-text {
    font-size: 24rpx;
    color: #576b95;
  }
}

/* 邻友点赞温暖纸条 */
.likes-summary-box {
  margin-top: 24rpx;
  background-color: #fbf5ea;
  border: 1rpx solid #ebd9c5;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  display: flex;
  align-items: flex-start;
  gap: 12rpx;

  .likes-heart-icon {
    font-size: 24rpx;
    margin-top: 2rpx;
  }

  .likes-user-names {
    flex: 1;
    font-size: 26rpx;
    color: #8c5835;
    line-height: 1.5;
  }
}

/* 治愈留言簿 */
.wechat-comments-block {
  margin-top: 36rpx;
  border-top: 1rpx dashed #ebd9c5;
  padding-top: 24rpx;

  .comments-section-header {
    margin-bottom: 20rpx;

    .comments-section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #3e2723;
    }
  }

  .empty-comments-box {
    padding: 40rpx 0;
    text-align: center;

    .empty-text {
      font-size: 26rpx;
      color: #a89f91;
    }
  }

  .comments-stream {
    display: flex;
    flex-direction: column;
    gap: 24rpx;

    .comment-row-item {
      display: flex;
      align-items: flex-start;
      gap: 16rpx;

      .comment-author-avatar {
        width: 64rpx;
        height: 64rpx;
        border-radius: 12rpx;
        background-color: #f1f5f9;
        flex-shrink: 0;
        cursor: pointer;
      }

      .comment-content-col {
        flex: 1;

        .comment-author-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6rpx;

          .comment-name-badge-wrap {
            display: flex;
            align-items: center;
            gap: 8rpx;

            .comment-author-name {
              font-size: 26rpx;
              font-weight: 600;
              color: #3e2723;
              cursor: pointer;
            }

            .author-owner-tag {
              font-size: 18rpx;
              color: #6b8e23;
              background-color: #f4f7eb;
              padding: 1rpx 8rpx;
              border-radius: 6rpx;
            }

            .author-me-tag {
              font-size: 18rpx;
              color: #8c5835;
              background-color: #fbf5ea;
              padding: 1rpx 8rpx;
              border-radius: 6rpx;
            }
          }

          .comment-post-time {
            font-size: 22rpx;
            color: #a89f91;
          }
        }

        .comment-text-box {
          .comment-text {
            font-size: 28rpx;
            color: #4e342e;
            line-height: 1.5;
            word-break: break-all;
          }
        }

        .comment-photo-wrap {
          margin-top: 10rpx;
          display: flex;
          align-items: center;
          gap: 12rpx;

          .comment-photo-thumb {
            width: 120rpx;
            height: 120rpx;
            border-radius: 8rpx;
            background-color: #f1f5f9;
            cursor: pointer;
          }

          .photo-zoom-hint {
            font-size: 22rpx;
            color: #8c5835;
            cursor: pointer;
          }
        }
      }
    }
  }
}

/* 拟物留言托盘底栏 */
.wechat-bottom-bar-wrap {
  flex-shrink: 0;
  background-color: #faf6f0;
  border-top: 1rpx solid #ebd9c5;
  padding-bottom: env(safe-area-inset-bottom);
}

.comment-img-preview-bar {
  padding: 12rpx 24rpx;
  background-color: #fbf5ea;
  display: flex;
  align-items: center;
  gap: 16rpx;
  border-bottom: 1rpx solid #ebd9c5;

  .comment-preview-box {
    position: relative;
    width: 64rpx;
    height: 64rpx;

    .comment-preview-img {
      width: 100%;
      height: 100%;
      border-radius: 6rpx;
    }

    .comment-img-del {
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      width: 28rpx;
      height: 28rpx;
      border-radius: 50%;
      background-color: rgba(62, 39, 35, 0.7);
      color: #ffffff;
      font-size: 18rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .comment-img-tip {
    font-size: 22rpx;
    color: #8c5835;
  }
}

.wechat-reply-input-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  box-sizing: border-box;

  .reply-user-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 12rpx;
    background-color: #e2e8f0;
    flex-shrink: 0;
  }

  .reply-text-input {
    flex: 1;
    height: 72rpx;
    background-color: #ffffff;
    border-radius: 36rpx;
    border: 1rpx solid #ebd9c5;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #3e2723;
  }

  .wechat-input-placeholder {
    color: #a89f91;
    font-size: 28rpx;
  }

  .reply-cam-btn {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38rpx;
    cursor: pointer;
    flex-shrink: 0;
  }

  .reply-send-btn {
    margin: 0;
    padding: 0 24rpx;
    height: 68rpx;
    line-height: 68rpx;
    border-radius: 34rpx;
    background-color: #ebd9c5;
    color: #a89f91;
    font-size: 28rpx;
    font-weight: 600;
    border: none;
    flex-shrink: 0;
    transition: all 0.2s ease;

    &.btn-send-active {
      background-color: #d97757;
      color: #ffffff;
      box-shadow: 0 2rpx 8rpx rgba(217, 119, 87, 0.3);
    }
  }
}

.desk-entry-btn {
  margin-left: auto;
  background: #fbf5ea;
  border: 1px solid #ebd9c5;
  border-radius: 16px;
  padding: 5px 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(62, 39, 35, 0.06);
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.96);
    background: #f5ece0;
  }

  .desk-svg-icon {
    width: 14px;
    height: 14px;
    color: #8c5835;
  }

  .desk-btn-label {
    font-size: 12px;
    font-weight: 600;
    color: #8c5835;
  }
}

.merchant-badge-banner {
  margin: 10px 0;
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border: 1px solid #81c784;
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;

  .m-icon { font-size: 16px; }
  .m-text {
    font-size: 12px;
    font-weight: bold;
    color: #2e7d32;
  }
}

.reply-type-tag {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 4px;
  margin-left: 6px;
  font-weight: 500;

  &.tag-local {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &.tag-remote {
    background: #f5f5f5;
    color: #757575;
  }
}
</style>
