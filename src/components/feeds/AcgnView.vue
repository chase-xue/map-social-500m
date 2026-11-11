<template>
  <view class="acgn-view-page" :style="{ paddingTop: (statusBarHeight + 52) + 'px' }">
    <!-- 顶部二次元细分子标签水平滑动选择器 -->
    <view class="acgn-subtabs-bar">
      <scroll-view scroll-x class="subtabs-scroll" :show-scrollbar="false">
        <view class="subtabs-inner">
          <view
            class="subtab-chip"
            :class="{ 'chip-active': selectedCategory === 'all' }"
            @tap="selectedCategory = 'all'"
          >
            <text class="chip-emoji">🌸</text>
            <text class="chip-text">全部 ({{ acgnStatuses.length }})</text>
          </view>
          <view
            v-for="cat in ACGN_CATEGORIES"
            :key="cat.name"
            class="subtab-chip"
            :class="{ 'chip-active': selectedCategory === cat.name }"
            @tap="selectedCategory = cat.name"
          >
            <text class="chip-emoji">{{ cat.emoji }}</text>
            <text class="chip-text">{{ cat.name }} ({{ getCategoryCount(cat.name) }})</text>
          </view>
        </view>
      </scroll-view>
      <!-- 右侧边缘微渐变遮罩，自然提示可向右滑动更多 -->
      <view class="scroll-edge-fade" />
    </view>

    <!-- 二次元专区滚动主体 -->
    <scroll-view scroll-y class="acgn-scroll-area">
      <!-- 专区顶部标语横幅 -->
      <view class="acgn-header-banner">
        <text class="banner-sparkle">🌸</text>
        <text class="banner-title">二次元同好空间 · 漫展正片 / 吃谷交流 / 番剧游戏</text>
      </view>

      <view class="acgn-feed-stream">
        <template v-for="(item, index) in filteredStatuses" :key="item.id">
          <!-- 动态卡片 -->
          <view class="acgn-item">
            <!-- 左侧头像 -->
            <view class="item-left" @tap.stop="viewAuthorProfile(item)">
              <image class="author-avatar" :src="item.userAvatar" mode="aspectFill" />
            </view>

            <!-- 右侧主体内容 -->
            <view class="item-right">
              <!-- 昵称与标签 -->
              <view class="author-row">
                <view class="author-name-box" @tap.stop="viewAuthorProfile(item)">
                  <text class="author-name">{{ item.userName }}</text>
                  <text class="acgn-badge">
                    🌸 {{ item.acgnTag || '二次元同好' }}
                  </text>
                  <text v-if="item.userId === myProfile.id" class="author-my-tag">我</text>
                </view>
                <text class="dist-badge">📍 距离 {{ item.distance || '500' }}m</text>
              </view>

              <!-- 动态正文 -->
              <view class="post-text-wrap" @tap="openDetailSheet(item)">
                <text class="post-text">{{ item.content }}</text>
              </view>

              <!-- 图片媒体排版 -->
              <view v-if="item.images && item.images.length > 0" class="moment-media-wrap">
                <view v-if="item.images.length === 1" class="single-img-box">
                  <image
                    class="single-img"
                    :src="item.images[0]"
                    mode="aspectFill"
                    @tap.stop="previewImage(item.images[0], item.images)"
                  />
                </view>
                <view v-else-if="item.images.length === 4" class="grid-4-box">
                  <image
                    v-for="(img, idx) in item.images"
                    :key="idx"
                    class="grid-img"
                    :src="img"
                    mode="aspectFill"
                    @tap.stop="previewImage(img, item.images)"
                  />
                </view>
                <view v-else class="grid-9-box">
                  <image
                    v-for="(img, idx) in item.images"
                    :key="idx"
                    class="grid-img"
                    :src="img"
                    mode="aspectFill"
                    @tap.stop="previewImage(img, item.images)"
                  />
                </view>
              </view>

              <!-- 底部相对时间与右侧赞/评操作胶囊 -->
              <view class="moment-footer-row">
                <text class="post-time">{{ formatTime(item.createdAt) }}</text>

                <view class="action-btn-wrap">
                  <view
                    class="action-capsule-btn"
                    @tap.stop="toggleActionMenu(item.id)"
                    hover-class="action-btn-hover"
                  >
                    <text class="capsule-dots">··</text>
                  </view>

                  <!-- 微信弹出浮层菜单 (赞 / 评论) -->
                  <view
                    v-if="activeActionMenuStatusId === item.id"
                    class="wechat-popover-menu"
                    @tap.stop
                  >
                    <view
                      class="popover-item"
                      @tap.stop="handleLikeFromMenu(item)"
                      hover-class="popover-item-hover"
                    >
                      <text class="popover-icon">❤️</text>
                      <text class="popover-label">
                        {{ item.likes && item.likes.includes(myProfile.name) ? '取消' : '赞' }}
                      </text>
                    </view>
                    <view class="popover-divider" />
                    <view
                      class="popover-item"
                      @tap.stop="openInPlaceComment(item)"
                      hover-class="popover-item-hover"
                    >
                      <text class="popover-icon">💬</text>
                      <text class="popover-label">评论</text>
                    </view>
                  </view>
                </view>
              </view>

              <!-- 点赞与评论展示区 -->
              <view
                v-if="((item.likes && item.likes.length > 0) || (item.comments && item.comments.length > 0))"
                class="interaction-bubble"
                @tap.stop
              >
                <view v-if="item.likes && item.likes.length > 0" class="likes-line">
                  <text class="like-heart-icon">❤️</text>
                  <text class="likes-users">{{ item.likes.join('、') }}</text>
                </view>

                <view
                  v-if="item.likes && item.likes.length > 0 && item.comments && item.comments.length > 0"
                  class="bubble-divider"
                />

                <view v-if="item.comments && item.comments.length > 0" class="comments-list">
                  <view
                    v-for="cmt in item.comments"
                    :key="cmt.id"
                    class="comment-row"
                    @tap.stop="openInPlaceComment(item, cmt.userName)"
                  >
                    <text class="comment-user" @tap.stop="viewCommenterProfile(cmt)">{{ cmt.userName }}</text>
                    <template v-if="cmt.replyToUserName">
                      <text class="reply-text">回复</text>
                      <text class="comment-reply-to">{{ cmt.replyToUserName }}</text>
                    </template>
                    <text class="comment-colon">：</text>
                    <text class="comment-content">{{ cmt.content }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </template>

        <!-- 空状态 -->
        <view v-if="filteredStatuses.length === 0" class="acgn-empty-box">
          <text class="empty-emoji">🌸</text>
          <text class="empty-title">暂无该分类的二次元同好动态</text>
          <text class="empty-desc">周边 500 米同好正期待你的漫展返图、谷子分享与动漫安利～</text>
          <button class="empty-post-btn" @tap="openPublishSheet">
            🌸 立即发布第一条二次元动态
          </button>
        </view>
      </view>

      <view class="acgn-bottom-padding" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAppState } from "../../composables/useAppState";
import { ACGN_TAG_CATEGORIES } from "../../constants/acgn";

const ACGN_CATEGORIES = ACGN_TAG_CATEGORIES;

const {
  statusBarHeight, myProfile, acgnStatuses,
  viewAuthorProfile, viewCommenterProfile, previewImage, openDetailSheet,
  formatTime, toggleActionMenu, activeActionMenuStatusId, handleLikeFromMenu,
  openInPlaceComment, openPublishSheet
} = useAppState();

const selectedCategory = ref<string>("all");

function getCategoryCount(catName: string): number {
  return acgnStatuses.value.filter(
    (s) => s.acgnTag === catName || s.content.includes(catName)
  ).length;
}

const filteredStatuses = computed(() => {
  if (selectedCategory.value === "all") {
    return acgnStatuses.value;
  }
  return acgnStatuses.value.filter(
    (s) => s.acgnTag === selectedCategory.value || s.content.includes(selectedCategory.value)
  );
});
</script>

<style lang="scss" scoped>
.acgn-view-page {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 顶部子标签切换器 */
.acgn-subtabs-bar {
  background-color: #ffffff;
  border-bottom: 0.5px solid #fbcfe8;
  padding: 8px 12px;
  flex-shrink: 0;
  position: relative;

  .subtabs-scroll {
    white-space: nowrap;
    width: 100%;
    -webkit-overflow-scrolling: touch;

    :deep(.uni-scroll-view-content) {
      display: inline-flex;
      width: max-content;
    }

    .subtabs-inner {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      width: max-content;
      padding-right: 24px; /* 为右侧横向滑动留出自然呼吸空间 */

      .subtab-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 14px;
        border-radius: 18px;
        background-color: #fdf2f8;
        border: 1px solid #fbcfe8;
        cursor: pointer;
        transition: all 0.15s ease;
        flex-shrink: 0;
        white-space: nowrap;
        box-sizing: border-box;

        .chip-emoji { 
          font-size: 13px; 
          line-height: 1;
        }

        .chip-text { 
          font-size: 12px; 
          color: #be185d; 
          font-weight: 500;
          white-space: nowrap;
          line-height: 1.2;
        }

        &.chip-active {
          background-color: #ec4899;
          border-color: #db2777;
          box-shadow: 0 2px 6px rgba(236, 72, 153, 0.25);
          .chip-text { color: #ffffff; font-weight: 600; }
        }
      }
    }
  }

  .scroll-edge-fade {
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 24px;
    background: linear-gradient(to left, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0));
  }
}

.acgn-scroll-area {
  flex: 1;
  background-color: #ffffff;
}

.acgn-header-banner {
  margin: 12rpx 24rpx;
  background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
  border: 1rpx solid #fbcfe8;
  border-radius: 12rpx;
  padding: 12rpx 20rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;

  .banner-sparkle { font-size: 24rpx; }
  .banner-title {
    font-size: 22rpx;
    font-weight: 600;
    color: #9d174d;
  }
}

.acgn-feed-stream {
  padding: 10rpx 0;
}

.acgn-item {
  display: flex;
  padding: 24rpx 28rpx 32rpx;
  border-bottom: 0.5px solid #f0f0f0;

  .item-left {
    margin-right: 20rpx;
    flex-shrink: 0;

    .author-avatar {
      width: 84rpx;
      height: 84rpx;
      border-radius: 10rpx;
      background-color: #f1f5f9;
      cursor: pointer;
    }
  }

  .item-right {
    flex: 1;
    min-width: 0;

    .author-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8rpx;

      .author-name-box {
        display: flex;
        align-items: center;
        gap: 12rpx;
        flex-wrap: wrap;

        .author-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #576b95;
          cursor: pointer;
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

        .author-my-tag {
          font-size: 20rpx;
          color: #888888;
        }
      }

      .dist-badge {
        font-size: 22rpx;
        color: #94a3b8;
      }
    }

    .post-text-wrap {
      margin-bottom: 14rpx;
      cursor: pointer;

      .post-text {
        font-size: 30rpx;
        color: #191919;
        line-height: 1.55;
        word-break: break-all;
      }
    }

    .moment-media-wrap {
      margin-bottom: 16rpx;

      .single-img-box {
        max-width: 440rpx;
        max-height: 480rpx;
        border-radius: 8rpx;
        overflow: hidden;
        background-color: #f7f7f7;

        .single-img {
          width: 100%;
          height: 380rpx;
          display: block;
        }
      }

      .grid-4-box {
        width: 400rpx;
        display: flex;
        flex-wrap: wrap;
        gap: 10rpx;

        .grid-img {
          width: 190rpx;
          height: 190rpx;
          border-radius: 6rpx;
          background-color: #f7f7f7;
        }
      }

      .grid-9-box {
        width: 100%;
        max-width: 580rpx;
        display: flex;
        flex-wrap: wrap;
        gap: 10rpx;

        .grid-img {
          width: 180rpx;
          height: 180rpx;
          border-radius: 6rpx;
          background-color: #f7f7f7;
        }
      }
    }

    .moment-footer-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 44rpx;
      margin-top: 8rpx;

      .post-time {
        font-size: 24rpx;
        color: #999999;
      }

      .action-btn-wrap {
        position: relative;

        .action-capsule-btn {
          width: 56rpx;
          height: 36rpx;
          background-color: #f7f7f7;
          border-radius: 8rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          .capsule-dots {
            font-size: 26rpx;
            font-weight: 700;
            color: #576b95;
            letter-spacing: 2rpx;
          }

          &.action-btn-hover {
            background-color: #e5e5e5;
          }
        }

        .wechat-popover-menu {
          position: absolute;
          right: 68rpx;
          top: -12rpx;
          background-color: #4c4c4c;
          border-radius: 8rpx;
          display: flex;
          align-items: center;
          height: 60rpx;
          padding: 0 16rpx;
          z-index: 50;

          .popover-item {
            display: flex;
            align-items: center;
            gap: 8rpx;
            padding: 8rpx 14rpx;
            cursor: pointer;

            .popover-icon { font-size: 24rpx; }
            .popover-label { font-size: 24rpx; color: #ffffff; font-weight: 500; }

            &.popover-item-hover { opacity: 0.7; }
          }

          .popover-divider {
            width: 1rpx;
            height: 28rpx;
            background-color: #383838;
            margin: 0 6rpx;
          }
        }
      }
    }

    .interaction-bubble {
      margin-top: 16rpx;
      background-color: #f7f7f7;
      border-radius: 8rpx;
      padding: 14rpx 18rpx;

      .likes-line {
        display: flex;
        align-items: flex-start;
        gap: 8rpx;
        font-size: 24rpx;
        line-height: 1.4;

        .like-heart-icon { font-size: 22rpx; flex-shrink: 0; }
        .likes-users { color: #576b95; font-weight: 500; word-break: break-all; }
      }

      .bubble-divider {
        height: 1rpx;
        background-color: #e5e5e5;
        margin: 10rpx 0;
      }

      .comments-list {
        display: flex;
        flex-direction: column;
        gap: 8rpx;

        .comment-row {
          font-size: 26rpx;
          line-height: 1.45;
          cursor: pointer;

          .comment-user { color: #576b95; font-weight: 500; }
          .reply-text { color: #888888; margin: 0 4rpx; }
          .comment-reply-to { color: #576b95; font-weight: 500; }
          .comment-colon { color: #576b95; }
          .comment-content { color: #191919; word-break: break-all; }
        }
      }
    }
  }
}

.acgn-empty-box {
  padding: 80rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .empty-emoji { font-size: 72rpx; margin-bottom: 20rpx; }
  .empty-title { font-size: 32rpx; font-weight: 600; color: #191919; margin-bottom: 12rpx; }
  .empty-desc { font-size: 24rpx; color: #888888; line-height: 1.5; margin-bottom: 32rpx; }
  .empty-post-btn {
    background-color: #ec4899;
    color: #ffffff;
    font-size: 28rpx;
    font-weight: 600;
    padding: 0 36rpx;
    height: 72rpx;
    line-height: 72rpx;
    border-radius: 36rpx;
    border: none;
  }
}

.acgn-bottom-padding {
  height: 120rpx;
}
</style>
