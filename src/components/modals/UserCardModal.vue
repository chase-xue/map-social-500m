<template>
  <view
    v-if="userCardVisible"
    class="wechat-contact-page"
    :style="{ paddingTop: statusBarHeight + 'px' }"
  >
    <!-- 微信原生「详细资料」顶栏 -->
    <view class="wechat-contact-header">
      <view class="header-back-btn" @tap="closeUserCard(true)">
        <text class="back-arrow">‹</text>
        <text class="back-text">返回</text>
      </view>

      <view class="header-title-box">
        <text class="header-title">详细资料</text>
      </view>

      <view class="header-action-box">
        <text class="header-more-btn">···</text>
      </view>
    </view>

    <!-- 详细资料滚动内容 -->
    <scroll-view scroll-y class="contact-scroll-view">
      <!-- 组 1: 个人核心名片 -->
      <view class="wechat-hero-card">
        <image
          class="hero-avatar"
          :src="viewingProfile?.avatar"
          mode="aspectFill"
        />
        <view class="hero-info-col">
          <view class="hero-name-row">
            <text class="hero-name">{{ viewingProfile?.name }}</text>
            <text
              class="hero-gender-icon"
              :class="viewingProfile?.gender === '女' ? 'female' : 'male'"
            >
              {{ viewingProfile?.gender === '女' ? '♀' : '♂' }}
            </text>
          </view>
          <text class="hero-sub-text">邻友号：500m_{{ viewingProfile?.id?.slice(0, 8) || 'user' }}</text>
          <text class="hero-sub-text">地区：北京 · 500米生活圈</text>
          <view class="hero-distance-pill">
            <text class="pill-dot">📍</text>
            <text class="pill-text">{{ formatDistance(viewingDistance) }}</text>
          </view>
        </view>
      </view>

      <!-- 组 2: 标签与签名 -->
      <view class="wechat-cells-group">
        <view class="wechat-cell-row">
          <text class="cell-label">个性签名</text>
          <view class="cell-right-box">
            <text class="cell-desc-text">{{ viewingProfile?.bio || '这个人很低调，还没有写个性签名~' }}</text>
          </view>
        </view>

        <!-- 电话联系 (如果可见) -->
        <view class="wechat-cell-row">
          <text class="cell-label">电话</text>
          <view class="cell-right-box">
            <view v-if="viewingProfile?.phone && viewingProfile?.showPhone" class="phone-call-box">
              <text class="phone-num-text">{{ viewingProfile.phone }}</text>
              <button class="phone-call-btn" @tap="makePhoneCall(viewingProfile.phone)">
                拨打
              </button>
            </view>
            <text v-else class="cell-dim-text">对方已设为隐藏保密</text>
          </view>
        </view>
      </view>

      <!-- 组 3: 个人发表的所有动态 (和位置无关，支持完整查看) -->
      <view class="wechat-user-statuses-section">
        <view class="section-heading">
          <text class="section-title">发表的动态 ({{ userAllStatuses.length }})</text>
          <text class="section-subtitle">全部公开动态 · 无视距离限制</text>
        </view>

        <view v-if="userAllStatuses.length > 0" class="wechat-cells-group user-statuses-group">
          <view
            v-for="item in userAllStatuses"
            :key="item.id"
            class="user-status-card-cell"
            @tap="openDetailSheet(item)"
          >
            <view class="card-cell-top">
              <view class="card-badges">
                <text v-if="item.isAcgn" class="badge-acgn">🌸 {{ item.acgnTag || '二次元' }}</text>
                <text v-if="item.isEmergency" class="badge-sos">🚨 救命求助</text>
                <text v-else-if="item.isHelp" class="badge-help">🆘 急事求助</text>
              </view>
              <text class="card-time">{{ formatTime(item.createdAt) }}</text>
            </view>

            <text class="card-content-text">{{ item.content }}</text>

            <!-- 配图展示 -->
            <view v-if="item.images && item.images.length > 0" class="card-images-grid">
              <image
                v-for="(img, idx) in item.images.slice(0, 4)"
                :key="idx"
                class="card-thumb"
                :src="img"
                mode="aspectFill"
                @tap.stop="previewImage(img, item.images)"
              />
              <view v-if="item.images.length > 4" class="more-images-mask">
                <text class="more-text">+{{ item.images.length - 4 }}</text>
              </view>
            </view>

            <!-- 互动数据与查看详情提示 -->
            <view class="card-cell-footer">
              <view class="card-interactions">
                <text v-if="item.likes && item.likes.length > 0" class="interact-item">
                  ❤️ {{ item.likes.length }}
                </text>
                <text v-if="item.comments && item.comments.length > 0" class="interact-item">
                  💬 {{ item.comments.length }}
                </text>
              </view>
              <text class="card-enter-hint">查看详情 ›</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="user-empty-statuses">
          <text class="empty-icon">📭</text>
          <text class="empty-text">该用户暂未发表任何动态</text>
        </view>
      </view>

      <!-- 组 4: 更多信息 -->
      <view class="wechat-cells-group">
        <view class="wechat-cell-row">
          <text class="cell-label">更多信息</text>
          <view class="cell-right-box">
            <text class="cell-dim-text">{{ viewingProfile?.age ? viewingProfile.age + '岁' : '未设置' }}</text>
            <text class="cell-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 底部操作按钮群 (微信大按钮样式) -->
      <view class="wechat-contact-actions">
        <!-- 如果是自己 -->
        <button
          v-if="viewingProfile?.id === myProfile.id"
          class="wechat-btn btn-secondary"
          @tap="closeUserCard(true); openMyProfileSheet()"
        >
          编辑个人资料
        </button>

        <!-- 如果已是好友 -->
        <button
          v-else-if="isFriend(viewingProfile?.id)"
          class="wechat-btn btn-primary"
          @tap="startChatFromCard(viewingProfile)"
        >
          💬 发消息
        </button>

        <!-- 如果正在申请加为好友 -->
        <button
          v-else-if="isFriendPending(viewingProfile?.id)"
          class="wechat-btn btn-primary"
          @tap="acceptFriendFromCard(viewingProfile?.id)"
        >
          通过朋友验证
        </button>

        <!-- 尚未添加好友 -->
        <button
          v-else
          class="wechat-btn btn-primary"
          @tap="handleAddFriend(viewingProfile)"
        >
          添加到通讯录
        </button>

        <!-- 进TA桌洞 (小纸条慢社交核心通道) -->
        <button
          v-if="viewingProfile?.id !== myProfile.id"
          class="wechat-btn btn-desk-card"
          @tap="visitDeskFromCard(viewingProfile)"
        >
          🪟 进TA的桌洞 (窗台留言 / 塞小纸条)
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppState } from "../../composables/useAppState";
import { formatDistance } from "../../services/geo";

const {
  statusBarHeight, userCardVisible, viewingProfile, viewingDistance, myProfile, allStatuses,
  closeUserCard, makePhoneCall, isFriend, isFriendPending,
  startChatFromCard, acceptFriendFromCard, handleAddFriend, openMyProfileSheet,
  openDetailSheet, previewImage, formatTime,
  switchMainTab, visitDesk,
} = useAppState();

function visitDeskFromCard(profile: any) {
  if (!profile) return;
  closeUserCard(true);
  visitDesk(profile.id, profile.name, profile.avatar);
}

// 和位置无关：直接从 allStatuses 中筛选该用户的全部动态
const userAllStatuses = computed(() => {
  if (!viewingProfile.value?.id) return [];
  return allStatuses.value
    .filter((s) => s.userId === viewingProfile.value?.id)
    .sort((a, b) => b.createdAt - a.createdAt);
});
</script>

<style lang="scss" scoped>
.wechat-contact-page {
  position: absolute;
  inset: 0;
  z-index: 200;
  background-color: #f7f5f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;

  .wechat-contact-header {
    height: 48px;
    background-color: #f7f5f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #ebd9c5;
    flex-shrink: 0;

    .header-back-btn {
      display: flex;
      align-items: center;
      cursor: pointer;

      .back-arrow {
        font-size: 24px;
        font-weight: 300;
        color: #3e2723;
        margin-right: 2px;
        line-height: 1;
      }

      .back-text {
        font-size: 15px;
        color: #3e2723;
        font-weight: 500;
      }
    }

    .header-title-box {
      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #3e2723;
      }
    }

    .header-action-box {
      .header-more-btn {
        font-size: 18px;
        color: #3e2723;
        font-weight: 600;
        letter-spacing: 2px;
      }
    }
  }

  .contact-scroll-view {
    flex: 1;
    height: 100%;
    background-color: #f7f5f0;

    .wechat-hero-card {
      margin: 12px 16px 0;
      background-color: #ffffff;
      padding: 18px 16px;
      display: flex;
      align-items: flex-start;
      border: 1px solid #ebd9c5;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(62, 39, 35, 0.04);

      .hero-avatar {
        width: 64px;
        height: 64px;
        border-radius: 14px;
        object-fit: cover;
        margin-right: 16px;
        flex-shrink: 0;
        border: 1px solid #ebd9c5;
      }

      .hero-info-col {
        flex: 1;
        overflow: hidden;

        .hero-name-row {
          display: flex;
          align-items: center;
          margin-bottom: 4px;

          .hero-name {
            font-size: 18px;
            font-weight: 600;
            color: #3e2723;
            margin-right: 8px;
          }

          .hero-gender-icon {
            font-size: 13px;
            font-weight: 700;

            &.female {
              color: #ec4899;
            }

            &.male {
              color: #2563eb;
            }
          }
        }

        .hero-sub-text {
          font-size: 12px;
          color: #8c7e74;
          margin-top: 2px;
          display: block;
        }

        .hero-distance-pill {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          background-color: #fbf5ea;
          border: 1px solid #ebd9c5;
          padding: 3px 10px;
          border-radius: 12px;

          .pill-dot {
            font-size: 11px;
            margin-right: 4px;
          }

          .pill-text {
            font-size: 11px;
            color: #8c5835;
            font-weight: 500;
          }
        }
      }
    }

    .wechat-cells-group {
      margin-top: 10px;
      background-color: #ffffff;
      border-top: 0.5px solid #dcdcdc;
      border-bottom: 0.5px solid #dcdcdc;

      .wechat-cell-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 0.5px solid #ededed;
        background-color: #ffffff;

        &:last-child {
          border-bottom: none;
        }

        .cell-label {
          font-size: 16px;
          color: #191919;
          flex-shrink: 0;
          width: 80px;
        }

        .cell-right-box {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          overflow: hidden;

          .cell-desc-text {
            font-size: 14px;
            color: #555555;
            text-align: right;
            line-height: 1.4;
          }

          .cell-dim-text {
            font-size: 14px;
            color: #7f7f7f;
          }

          .cell-arrow {
            font-size: 18px;
            color: #b2b2b2;
            margin-left: 8px;
            line-height: 1;
          }

          .phone-call-box {
            display: flex;
            align-items: center;
            gap: 10px;

            .phone-num-text {
              font-size: 15px;
              color: #191919;
              font-weight: 500;
              letter-spacing: 0.5px;
            }

            .phone-call-btn {
              margin: 0;
              padding: 3px 10px;
              font-size: 12px;
              background-color: #07c160;
              color: #ffffff;
              border-radius: 4px;
              border: none;
              line-height: 1.4;
              height: auto;
              cursor: pointer;

              &::after {
                border: none;
              }
            }
          }
        }
      }
    }

    .wechat-user-statuses-section {
      margin-top: 10px;

      .section-heading {
        padding: 4px 16px 8px;
        display: flex;
        align-items: baseline;
        justify-content: space-between;

        .section-title {
          font-size: 13px;
          color: #7f7f7f;
          font-weight: 500;
        }

        .section-subtitle {
          font-size: 11px;
          color: #999999;
        }
      }

      .user-status-card-cell {
        padding: 12px 16px;
        background-color: #ffffff;
        border-bottom: 0.5px solid #ededed;
        cursor: pointer;

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background-color: #f7f7f7;
        }

        .card-cell-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;

          .card-badges {
            display: flex;
            align-items: center;
            gap: 6px;

            .badge-acgn {
              font-size: 10px;
              color: #db2777;
              background-color: #fdf2f8;
              border: 0.5px solid #fbcfe8;
              padding: 1px 6px;
              border-radius: 4px;
              font-weight: 500;
            }

            .badge-sos {
              font-size: 10px;
              background-color: #fee2e2;
              color: #dc2626;
              padding: 1px 6px;
              border-radius: 4px;
              font-weight: 600;
            }

            .badge-help {
              font-size: 10px;
              background-color: #fef3c7;
              color: #d97706;
              padding: 1px 6px;
              border-radius: 4px;
              font-weight: 600;
            }
          }

          .card-time {
            font-size: 11px;
            color: #999999;
          }
        }

        .card-content-text {
          font-size: 14px;
          color: #191919;
          line-height: 1.45;
          margin-bottom: 8px;
          word-break: break-all;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-images-grid {
          display: flex;
          gap: 6px;
          position: relative;
          margin-bottom: 8px;

          .card-thumb {
            width: 60px;
            height: 60px;
            border-radius: 4px;
            background-color: #f7f7f7;
          }

          .more-images-mask {
            width: 60px;
            height: 60px;
            border-radius: 4px;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;

            .more-text {
              color: #ffffff;
              font-size: 13px;
              font-weight: 600;
            }
          }
        }

        .card-cell-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .card-interactions {
            display: flex;
            gap: 12px;

            .interact-item {
              font-size: 12px;
              color: #888888;
            }
          }

          .card-enter-hint {
            font-size: 12px;
            color: #576b95;
          }
        }
      }

      .user-empty-statuses {
        background-color: #ffffff;
        padding: 24px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;

        .empty-icon {
          font-size: 28px;
        }

        .empty-text {
          font-size: 13px;
          color: #999999;
        }
      }
    }

    .wechat-contact-actions {
      margin-top: 24px;
      padding: 0 16px 32px;

      .wechat-btn {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 24px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        margin-bottom: 12px;
        transition: all 0.15s ease;

        &::after {
          border: none;
        }

        &.btn-primary {
          background-color: #5c715e;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(92, 113, 94, 0.2);

          &:active {
            background-color: #4b5d4d;
            transform: scale(0.98);
          }
        }

        &.btn-secondary {
          background-color: #ffffff;
          color: #3e2723;
          border: 1px solid #ebd9c5;

          &:active {
            background-color: #fbf5ea;
            transform: scale(0.98);
          }
        }

        &.btn-desk-card {
          background-color: #fbf5ea;
          color: #8c5835;
          border: 1px solid #ebd9c5;
          box-shadow: 0 2px 8px rgba(62, 39, 35, 0.05);

          &:active {
            background-color: #f5ece0;
            transform: scale(0.98);
          }
        }
      }
    }
  }
}
</style>
