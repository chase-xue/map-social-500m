<template>
  <view class="recommend-view-page" :style="{ paddingTop: (statusBarHeight + 52) + 'px' }">
    <!-- 推荐流滚动主体 -->
    <scroll-view scroll-y class="recommend-scroll-area">
      <!-- 同城精选推荐标语横幅 -->
      <view class="recommend-header-banner">
        <text class="banner-sparkle">✨</text>
        <text class="banner-title">同城推荐 · 汇聚高赞热评与新鲜动态</text>
      </view>

      <view class="recommend-feed-stream">
        <template v-for="(item, index) in recommendedStatuses" :key="item.id">
          <!-- 动态卡片 -->
          <view class="recommend-item">
            <!-- 左侧头像 -->
            <view class="item-left" @tap.stop="viewAuthorProfile(item)">
              <image class="author-avatar" :src="item.userAvatar" mode="aspectFill" />
            </view>

            <!-- 右侧主体内容 -->
            <view class="item-right">
              <!-- 昵称、热度标签与同城位置 -->
              <view class="author-row">
                <view class="author-name-box" @tap.stop="viewAuthorProfile(item)">
                  <text class="author-name">{{ item.userName }}</text>
                  <!-- 二次元同好标签 -->
                  <text v-if="item.isAcgn" class="acgn-badge">
                    🌸 二次元 · {{ item.acgnTag || '同好' }}
                  </text>
                  <!-- 热门高赞标签 -->
                  <text v-if="item.likes && item.likes.length >= 2" class="hot-badge">
                    🔥 热门高赞
                  </text>
                  <text v-else-if="item.likes && item.likes.length > 0" class="recommend-badge">
                    👍 推荐
                  </text>
                  <text v-if="item.userId === myProfile.id" class="author-my-tag">我</text>
                </view>
                <text class="city-badge">📍 北京 · 同城</text>
              </view>

              <!-- 动态正文 -->
              <view class="post-text-wrap" @tap="openDetailSheet(item)">
                <text class="post-text">{{ item.content }}</text>
              </view>

              <!-- 图片媒体排版 (1图保真、4图2x2、多图3列九宫格) -->
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
                    class="grid-img-4"
                    :src="img"
                    mode="aspectFill"
                    @tap.stop="previewImage(img, item.images)"
                  />
                </view>
                <view v-else class="grid-multi-box">
                  <image
                    v-for="(img, idx) in item.images"
                    :key="idx"
                    class="grid-img-multi"
                    :src="img"
                    mode="aspectFill"
                    @tap.stop="previewImage(img, item.images)"
                  />
                </view>
              </view>

              <!-- 底部元信息与点赞互动 -->
              <view class="item-meta-row">
                <text class="meta-time">{{ formatTime(item.createdAt) }}</text>
                <view class="inline-like-btn" @tap.stop="toggleLikeStatus(item)">
                  <text class="like-heart">{{ item.likes?.includes(myProfile.name) ? '❤️' : '🤍' }}</text>
                  <text class="like-count-text">{{ item.likes?.length || 0 }}</text>
                </view>
              </view>

              <!-- 微信经典朋友圈点赞名单灰框 -->
              <view v-if="item.likes && item.likes.length > 0" class="moments-likes-box">
                <text class="likes-heart">❤️</text>
                <text class="likes-names">{{ item.likes.join('、 ') }}</text>
              </view>

              <!-- 评论预览 (如有) -->
              <view v-if="item.comments && item.comments.length > 0" class="moments-comments-box">
                <view
                  v-for="cmt in item.comments.slice(0, 3)"
                  :key="cmt.id"
                  class="comment-item-line"
                  @tap.stop="openDetailSheet(item)"
                >
                  <text class="cmt-user">{{ cmt.userName }}: </text>
                  <text class="cmt-text">{{ cmt.content }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 推荐流每日广告卡片：在第一条动态后无缝插入每日 1 条同城广告 -->
          <view v-if="index === 0 && dailySponsoredAd" class="recommend-ad-card">
            <view class="ad-top-row">
              <image class="ad-brand-avatar" :src="dailySponsoredAd.brandAvatar" mode="aspectFill" />
              <view class="ad-brand-info">
                <view class="ad-brand-name-box">
                  <text class="ad-brand-name">{{ dailySponsoredAd.brandName }}</text>
                  <view class="ad-tag-badge">
                    <text class="ad-tag-text">广告</text>
                  </view>
                </view>
                <text class="ad-sub-text">📍 同城生活特选 · 今日推荐</text>
              </view>
            </view>

            <!-- 广告正文 -->
            <view class="ad-content-box">
              <text class="ad-content-text">{{ dailySponsoredAd.content }}</text>
            </view>

            <!-- 广告配图三联画 -->
            <view v-if="dailySponsoredAd.images && dailySponsoredAd.images.length > 0" class="ad-images-grid">
              <image
                v-for="(adImg, ai) in dailySponsoredAd.images"
                :key="ai"
                class="ad-thumb-img"
                :src="adImg"
                mode="aspectFill"
                @tap.stop="previewImage(adImg, dailySponsoredAd.images)"
              />
            </view>

            <!-- 微信原生赞助商操作栏 -->
            <view class="ad-action-bar" @tap="handleAdClick(dailySponsoredAd)">
              <view class="ad-action-left">
                <text class="ad-action-icon">🎁</text>
                <text class="ad-action-title">{{ dailySponsoredAd.actionText }}</text>
              </view>
              <text class="ad-action-arrow">›</text>
            </view>

            <!-- 广告底部专属底标 -->
            <view class="ad-footer-disclaimer">
              <text class="disclaimer-text">💡 每天1条同城高品质生活服务精选 · 凭500米圈邻友专属福利</text>
            </view>
          </view>
        </template>
      </view>

      <view class="recommend-bottom-padding" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../../composables/useAppState";
import { SponsoredAdItem } from "../types";

const {
  statusBarHeight,
  myProfile,
  recommendedStatuses,
  dailySponsoredAd,
  previewImage,
  toggleLikeStatus,
  openDetailSheet,
  viewAuthorProfile,
  formatTime,
  makePhoneCall,
} = useAppState();

function handleAdClick(ad: SponsoredAdItem) {
  if (ad.phone) {
    makePhoneCall(ad.phone);
  } else {
    uni.showToast({ title: "已领取今日同城福利！凭本界面进店核销", icon: "success" });
  }
}
</script>

<style lang="scss" scoped>
.recommend-view-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  z-index: 10;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.recommend-scroll-area {
  flex: 1;
  min-height: 0;
}

.recommend-header-banner {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  padding: 16rpx 32rpx;
  border-bottom: 1rpx solid #d1fae5;

  .banner-sparkle {
    font-size: 28rpx;
  }

  .banner-title {
    font-size: 24rpx;
    color: #047857;
    font-weight: 600;
  }
}

.recommend-feed-stream {
  padding: 0 32rpx;
}

.recommend-item {
  display: flex;
  align-items: flex-start;
  padding: 32rpx 0;
  border-bottom: 0.5px solid #eeeeee;

  .item-left {
    margin-right: 20rpx;
    flex-shrink: 0;

    .author-avatar {
      width: 84rpx;
      height: 84rpx;
      border-radius: 8rpx;
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

        .hot-badge {
          font-size: 20rpx;
          color: #dc2626;
          background-color: #fee2e2;
          padding: 2rpx 10rpx;
          border-radius: 6rpx;
          font-weight: 700;
        }

        .recommend-badge {
          font-size: 20rpx;
          color: #d97706;
          background-color: #fef3c7;
          padding: 2rpx 10rpx;
          border-radius: 6rpx;
          font-weight: 600;
        }

        .author-my-tag {
          font-size: 20rpx;
          color: #07c160;
          background-color: #e8f8f0;
          padding: 2rpx 10rpx;
          border-radius: 6rpx;
          font-weight: 600;
        }
      }

      .city-badge {
        font-size: 22rpx;
        color: #999999;
      }
    }

    .post-text-wrap {
      margin-bottom: 16rpx;
      cursor: pointer;

      .post-text {
        font-size: 32rpx;
        line-height: 1.55;
        color: #191919;
        word-break: break-all;
      }
    }

    .moment-media-wrap {
      margin-bottom: 16rpx;

      .single-img-box {
        max-width: 460rpx;
        max-height: 460rpx;

        .single-img {
          width: 360rpx;
          height: 360rpx;
          border-radius: 8rpx;
          background-color: #f1f5f9;
        }
      }

      .grid-4-box {
        display: grid;
        grid-template-columns: repeat(2, 170rpx);
        gap: 8rpx;

        .grid-img-4 {
          width: 170rpx;
          height: 170rpx;
          border-radius: 6rpx;
          background-color: #f1f5f9;
        }
      }

      .grid-multi-box {
        display: grid;
        grid-template-columns: repeat(3, 170rpx);
        gap: 8rpx;

        .grid-img-multi {
          width: 170rpx;
          height: 170rpx;
          border-radius: 6rpx;
          background-color: #f1f5f9;
        }
      }
    }

    .item-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10rpx;

      .meta-time {
        font-size: 24rpx;
        color: #b2b2b2;
      }

      .inline-like-btn {
        display: flex;
        align-items: center;
        gap: 6rpx;
        padding: 4rpx 14rpx;
        border-radius: 20rpx;
        background-color: #f7f7f7;
        cursor: pointer;

        .like-heart {
          font-size: 24rpx;
        }

        .like-count-text {
          font-size: 22rpx;
          color: #576b95;
          font-weight: 600;
        }
      }
    }

    .moments-likes-box {
      margin-top: 16rpx;
      background-color: #f7f7f7;
      border-radius: 6rpx;
      padding: 10rpx 16rpx;
      display: flex;
      align-items: flex-start;
      gap: 10rpx;

      .likes-heart {
        font-size: 24rpx;
        margin-top: 2rpx;
      }

      .likes-names {
        flex: 1;
        font-size: 26rpx;
        color: #576b95;
        font-weight: 600;
        line-height: 1.45;
      }
    }

    .moments-comments-box {
      margin-top: 8rpx;
      background-color: #f7f7f7;
      border-radius: 6rpx;
      padding: 10rpx 16rpx;
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .comment-item-line {
        font-size: 26rpx;
        line-height: 1.45;

        .cmt-user {
          color: #576b95;
          font-weight: 600;
        }

        .cmt-text {
          color: #191919;
        }
      }
    }
  }
}

/* 微信原生推荐广告卡片 */
.recommend-ad-card {
  margin: 28rpx 0;
  padding: 24rpx;
  background-color: #fafafa;
  border: 1rpx solid #eeeeee;
  border-radius: 12rpx;
  box-sizing: border-box;

  .ad-top-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 16rpx;

    .ad-brand-avatar {
      width: 76rpx;
      height: 76rpx;
      border-radius: 8rpx;
      background-color: #e2e8f0;
    }

    .ad-brand-info {
      flex: 1;

      .ad-brand-name-box {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .ad-brand-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #191919;
        }

        .ad-tag-badge {
          border: 1rpx solid #cbd5e1;
          border-radius: 4rpx;
          padding: 0 8rpx;
          height: 32rpx;
          display: flex;
          align-items: center;

          .ad-tag-text {
            font-size: 18rpx;
            color: #94a3b8;
          }
        }
      }

      .ad-sub-text {
        font-size: 22rpx;
        color: #999999;
      }
    }
  }

  .ad-content-box {
    margin-bottom: 16rpx;

    .ad-content-text {
      font-size: 28rpx;
      line-height: 1.55;
      color: #333333;
    }
  }

  .ad-images-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10rpx;
    margin-bottom: 20rpx;

    .ad-thumb-img {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 6rpx;
      background-color: #f1f5f9;
      cursor: pointer;
    }
  }

  .ad-action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #ffffff;
    border: 1rpx solid #e2e8f0;
    border-radius: 8rpx;
    padding: 16rpx 20rpx;
    cursor: pointer;

    .ad-action-left {
      display: flex;
      align-items: center;
      gap: 10rpx;

      .ad-action-icon {
        font-size: 28rpx;
      }

      .ad-action-title {
        font-size: 26rpx;
        color: #07c160;
        font-weight: 600;
      }
    }

    .ad-action-arrow {
      font-size: 32rpx;
      color: #b2b2b2;
    }
  }

  .ad-footer-disclaimer {
    margin-top: 14rpx;
    text-align: right;

    .disclaimer-text {
      font-size: 20rpx;
      color: #b2b2b2;
    }
  }
}

.recommend-bottom-padding {
  height: 140rpx;
}
</style>
