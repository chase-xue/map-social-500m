<template>
  <view
    v-if="clusterVisible"
    class="wechat-cluster-page"
    :style="{ paddingTop: statusBarHeight + 'px' }"
  >
    <!-- 微信原生顶栏 -->
    <view class="wechat-cluster-header">
      <view class="header-back-btn" @tap="closeClusterSheet(true)">
        <text class="back-arrow">‹</text>
        <text class="back-text">返回</text>
      </view>

      <view class="header-title-box">
        <text class="header-title">地点动态 (共 {{ activeCluster?.count || 0 }} 条)</text>
      </view>

      <view class="header-action-box" @tap="jumpToMomentsFromCluster">
        <text class="header-moments-btn">看全部 ›</text>
      </view>
    </view>

    <!-- 聚合列表内容区 -->
    <scroll-view scroll-y class="cluster-scroll-view">
      <!-- 首发人封面图 (如果有) -->
      <view
        v-if="activeCluster?.firstStatus.images && activeCluster.firstStatus.images.length > 0"
        class="cluster-cover-card"
        @tap="previewImage(activeCluster.firstStatus.images[0], activeCluster.firstStatus.images)"
      >
        <image
          class="cluster-cover-img"
          :src="activeCluster.firstStatus.images[0]"
          mode="aspectFill"
        />
        <view class="cluster-cover-glass-bar">
          <text class="cover-badge">⭐ 地点首发人 · {{ activeCluster.firstStatus.userName }}</text>
          <text class="cover-hint">点击查看原图 ›</text>
        </view>
      </view>

      <!-- 快捷跳转朋友圈提示条 -->
      <view class="wechat-cell-moments-jump" @tap="jumpToMomentsFromCluster">
        <text class="jump-icon">📰</text>
        <view class="jump-text-col">
          <text class="jump-main">跳转至朋友圈时间线</text>
          <text class="jump-sub">按时间倒序沉浸式浏览 500m 内全部邻里动态</text>
        </view>
        <text class="jump-arrow">›</text>
      </view>

      <!-- 动态列表项 -->
      <view class="cluster-list-wrap">
        <view
          v-for="(st, sIdx) in activeCluster?.statuses"
          :key="st.id"
          class="cluster-wechat-cell"
          @tap="closeClusterSheet(true); openDetailSheet(st)"
        >
          <image class="cell-avatar" :src="st.userAvatar" mode="aspectFill" />
          <view class="cell-right-col">
            <view class="cell-top-row">
              <view class="cell-name-box">
                <text class="cell-user-name">{{ st.userName }}</text>
                <text v-if="st.isAcgn" class="tag-acgn">🌸 {{ st.acgnTag || '二次元' }}</text>
                <text v-if="sIdx === 0" class="tag-first">首发者</text>
                <text v-if="st.isEmergency" class="tag-sos">🚨 救命呼救</text>
                <text v-else-if="st.isHelp" class="tag-help">🆘 急事求助</text>
              </view>
              <text class="cell-time">{{ formatTime(st.createdAt) }}</text>
            </view>

            <text class="cell-content-text">{{ st.content }}</text>

            <view v-if="st.images && st.images.length > 0" class="cell-thumbs-row">
              <image
                v-for="(cImg, cIdx) in st.images"
                :key="cIdx"
                class="cell-thumb-img"
                :src="cImg"
                mode="aspectFill"
                @tap.stop="previewImage(cImg, st.images)"
              />
            </view>

            <view class="cell-bottom-meta">
              <text class="meta-dist">📍 距离你约 {{ st.distance != null ? st.distance + 'm' : '500m以内' }}</text>
              <text class="meta-comments-count">💬 {{ st.comments?.length || 0 }} 条互动</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";

const {
  clusterVisible,
  activeCluster,
  statusBarHeight,
  closeClusterSheet,
  previewImage,
  jumpToMomentsFromCluster,
  formatTime,
  openDetailSheet,
} = useAppState();
</script>

<style lang="scss" scoped>
.wechat-cluster-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ededed;
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.wechat-cluster-header {
  height: 88rpx;
  background-color: #ededed;
  border-bottom: 1rpx solid #d9d9d9;
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
      font-size: 48rpx;
      color: #191919;
      line-height: 1;
      margin-right: 4rpx;
      margin-top: -6rpx;
      font-weight: 300;
    }

    .back-text {
      font-size: 32rpx;
      color: #191919;
    }
  }

  .header-title-box {
    flex: 1;
    text-align: center;

    .header-title {
      font-size: 34rpx;
      font-weight: 600;
      color: #191919;
    }
  }

  .header-action-box {
    min-width: 140rpx;
    display: flex;
    justify-content: flex-end;
    cursor: pointer;

    .header-moments-btn {
      font-size: 28rpx;
      color: #576b95;
      font-weight: 500;
    }
  }
}

.cluster-scroll-view {
  flex: 1;
  min-height: 0;
}

.cluster-cover-card {
  position: relative;
  width: 100%;
  height: 320rpx;
  overflow: hidden;
  cursor: pointer;

  .cluster-cover-img {
    width: 100%;
    height: 100%;
  }

  .cluster-cover-glass-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
    padding: 24rpx 24rpx 16rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .cover-badge {
      color: #ffffff;
      font-size: 26rpx;
      font-weight: 600;
    }

    .cover-hint {
      color: #e2e8f0;
      font-size: 22rpx;
    }
  }
}

.wechat-cell-moments-jump {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background-color: #ffffff;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
  border-bottom: 1rpx solid #e5e5e5;
  cursor: pointer;

  .jump-icon {
    font-size: 40rpx;
  }

  .jump-text-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;

    .jump-main {
      font-size: 30rpx;
      color: #191919;
      font-weight: 500;
    }

    .jump-sub {
      font-size: 22rpx;
      color: #999999;
    }
  }

  .jump-arrow {
    font-size: 36rpx;
    color: #b2b2b2;
  }
}

.cluster-list-wrap {
  background-color: #ffffff;
  border-top: 1rpx solid #e5e5e5;
  border-bottom: 1rpx solid #e5e5e5;
}

.cluster-wechat-cell {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  .cell-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 8rpx;
    background-color: #f1f5f9;
    flex-shrink: 0;
  }

  .cell-right-col {
    flex: 1;
    min-width: 0;

    .cell-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8rpx;

      .cell-name-box {
        display: flex;
        align-items: center;
        gap: 10rpx;

        .cell-user-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #576b95;
        }

        .tag-acgn {
          font-size: 18rpx;
          color: #db2777;
          background-color: #fdf2f8;
          border: 1rpx solid #fbcfe8;
          padding: 2rpx 8rpx;
          border-radius: 6rpx;
          font-weight: 500;
        }

        .tag-first {
          font-size: 18rpx;
          color: #d97706;
          background-color: #fef3c7;
          padding: 2rpx 8rpx;
          border-radius: 6rpx;
          font-weight: 600;
        }

        .tag-sos {
          font-size: 18rpx;
          color: #dc2626;
          background-color: #fee2e2;
          padding: 2rpx 8rpx;
          border-radius: 6rpx;
          font-weight: 600;
        }

        .tag-help {
          font-size: 18rpx;
          color: #d97706;
          background-color: #fef3c7;
          padding: 2rpx 8rpx;
          border-radius: 6rpx;
          font-weight: 600;
        }
      }

      .cell-time {
        font-size: 22rpx;
        color: #b2b2b2;
      }
    }

    .cell-content-text {
      font-size: 28rpx;
      color: #191919;
      line-height: 1.5;
      margin-bottom: 12rpx;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .cell-thumbs-row {
      display: flex;
      gap: 10rpx;
      margin-bottom: 12rpx;

      .cell-thumb-img {
        width: 140rpx;
        height: 140rpx;
        border-radius: 6rpx;
        background-color: #f1f5f9;
      }
    }

    .cell-bottom-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .meta-dist {
        font-size: 22rpx;
        color: #576b95;
      }

      .meta-comments-count {
        font-size: 22rpx;
        color: #999999;
      }
    }
  }
}
</style>
