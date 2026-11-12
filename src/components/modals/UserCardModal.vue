<template>
  <view
    v-if="userCardVisible"
    class="wechat-contact-page"
    :style="{ paddingTop: statusBarHeight + 'px' }"
  >
    <!-- 1. 治愈手账顶栏 -->
    <view class="wechat-contact-header">
      <view class="header-back-btn" @tap="closeUserCard(true)">
        <text class="back-arrow">‹</text>
        <text class="back-text">返回</text>
      </view>

      <view class="header-title-box">
        <text class="header-title">邻友手账名片</text>
      </view>

      <view class="header-action-box" />
    </view>

    <!-- 2. 详细资料滚动内容 -->
    <scroll-view scroll-y class="contact-scroll-view">
      <!-- 核心治愈和纸名片大卡片 -->
      <view class="profile-washi-card">
        <view class="washi-tape-strip" />

        <!-- 头部作者基本资料 -->
        <view class="profile-header-row">
          <image class="profile-avatar" :src="viewingProfile?.avatar" mode="aspectFill" />
          <view class="profile-info-col">
            <view class="profile-name-row">
              <text class="profile-name">{{ viewingProfile?.name }}</text>
              <text
                v-if="viewingProfile?.gender"
                class="gender-pill"
                :class="viewingProfile.gender === '女' ? 'female' : 'male'"
              >
                {{ viewingProfile.gender === '女' ? '♀ 女' : '♂ 男' }}
              </text>
              <text v-if="viewingProfile?.age" class="age-pill">
                {{ viewingProfile.age }}岁
              </text>
            </view>
            <view class="profile-dist-row">
              <text class="dist-pill">📍 {{ formatDistance(viewingDistance) }}</text>
              <text class="city-text">北京 · 500米生活圈</text>
            </view>
          </view>
        </view>

        <!-- 个性签名信签纸 -->
        <view class="profile-bio-box">
          <text class="bio-quote-mark">“</text>
          <text class="bio-content-text">{{ viewingProfile?.bio || '慢下来，在500米的生活圈里写下真实的自己～' }}</text>
        </view>

        <!-- 电话联系 (如果可见) -->
        <view v-if="viewingProfile?.phone && viewingProfile?.showPhone" class="profile-phone-row" @tap="makePhoneCall(viewingProfile.phone)">
          <view class="phone-left">
            <text class="phone-ico">📞</text>
            <text class="phone-num">{{ viewingProfile.phone }}</text>
          </view>
          <text class="phone-dial-badge">拨打 ›</text>
        </view>

        <!-- 核心行动按钮群：进TA桌洞 + 传小纸条 (放置在名片最引人注目的位置！) -->
        <view class="profile-quick-actions">
          <!-- 进TA桌洞 (精致木窗 SVG 图标，绝不乱码，手账主操作) -->
          <button
            v-if="viewingProfile?.id !== myProfile.id"
            class="action-btn-desk"
            @tap="visitDeskFromCard(viewingProfile)"
          >
            <svg class="action-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
            <text class="action-btn-txt">进TA的桌洞 (窗台留言 / 塞小纸条)</text>
          </button>

          <!-- 社交联系按钮 -->
          <button
            v-if="viewingProfile?.id === myProfile.id"
            class="action-btn-sub"
            @tap="closeUserCard(true); openMyProfileSheet()"
          >
            ✏️ 编辑我的个人资料
          </button>
          <button
            v-else-if="isFriend(viewingProfile?.id)"
            class="action-btn-sub"
            @tap="startChatFromCard(viewingProfile)"
          >
            💬 传小纸条 (已是好友)
          </button>
          <button
            v-else-if="isFriendPending(viewingProfile?.id)"
            class="action-btn-sub"
            @tap="acceptFriendFromCard(viewingProfile?.id)"
          >
            🤝 通过朋友验证
          </button>
          <button
            v-else
            class="action-btn-sub"
            @tap="handleAddFriend(viewingProfile)"
          >
            ✨ 添加到通讯录
          </button>
        </view>
      </view>

      <!-- 组 2: 个人发表的所有动态 -->
      <view class="user-statuses-section">
        <view class="section-heading">
          <text class="section-title">📜 TA留在此处的便签 ({{ userAllStatuses.length }})</text>
          <text class="section-subtitle">全部公开动态</text>
        </view>

        <view v-if="userAllStatuses.length > 0" class="statuses-flow">
          <view
            v-for="item in userAllStatuses"
            :key="item.id"
            class="status-washi-card"
            @tap="openDetailSheet(item)"
          >
            <view class="status-top-row">
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
          <text class="empty-text">该邻友暂未发表任何公开便签</text>
        </view>
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
  const { id, name, avatar } = profile;
  visitDesk(id, name, avatar);
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
      width: 48px;
    }
  }

  .contact-scroll-view {
    flex: 1;
    height: 100%;
    background-color: #f7f5f0;

    /* 治愈和纸名片大卡 */
    .profile-washi-card {
      margin: 16px 16px 20px;
      background-color: #ffffff;
      padding: 22px 18px 18px;
      border: 1px solid #ebd9c5;
      border-radius: 20px;
      box-shadow: 0 4px 16px rgba(62, 39, 35, 0.05);
      position: relative;

      .washi-tape-strip {
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 64px;
        height: 16px;
        background: rgba(255, 255, 255, 0.9);
        box-shadow: 0 1px 4px rgba(62, 39, 35, 0.1);
        border-left: 2px dashed rgba(62, 39, 35, 0.2);
        border-right: 2px dashed rgba(62, 39, 35, 0.2);
      }

      .profile-header-row {
        display: flex;
        align-items: center;
        gap: 16px;

        .profile-avatar {
          width: 68px;
          height: 68px;
          border-radius: 18px;
          object-fit: cover;
          border: 1.5px solid #ebd9c5;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(62, 39, 35, 0.06);
        }

        .profile-info-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;

          .profile-name-row {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;

            .profile-name {
              font-size: 19px;
              font-weight: 700;
              color: #3e2723;
            }

            .gender-pill {
              font-size: 11px;
              padding: 2px 8px;
              border-radius: 10px;
              font-weight: 600;

              &.female {
                background: #fdf2f8;
                color: #db2777;
                border: 0.5px solid #fbcfe8;
              }

              &.male {
                background: #eff6ff;
                color: #2563eb;
                border: 0.5px solid #bfdbfe;
              }
            }

            .age-pill {
              font-size: 11px;
              background: #fbf5ea;
              border: 1px solid #ebd9c5;
              color: #8c5835;
              padding: 1px 8px;
              border-radius: 10px;
              font-weight: 600;
            }
          }

          .profile-dist-row {
            display: flex;
            align-items: center;
            gap: 8px;

            .dist-pill {
              font-size: 11px;
              background: #fbf5ea;
              border: 1px solid #ebd9c5;
              color: #8c5835;
              padding: 2px 8px;
              border-radius: 10px;
              font-weight: 500;
            }

            .city-text {
              font-size: 12px;
              color: #8c7e74;
            }
          }
        }
      }

      /* 签名框 */
      .profile-bio-box {
        margin-top: 16px;
        background: #fdfcf9;
        border: 1px dashed #ebd9c5;
        border-radius: 12px;
        padding: 12px 14px;
        display: flex;
        gap: 6px;

        .bio-quote-mark {
          font-size: 18px;
          color: #c25b38;
          font-weight: 700;
          line-height: 1;
        }

        .bio-content-text {
          font-size: 13px;
          color: #5d4037;
          line-height: 1.5;
          flex: 1;
        }
      }

      /* 电话 */
      .profile-phone-row {
        margin-top: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fbf5ea;
        border: 1px solid #ebd9c5;
        padding: 10px 14px;
        border-radius: 12px;
        cursor: pointer;

        .phone-left {
          display: flex;
          align-items: center;
          gap: 8px;

          .phone-ico { font-size: 14px; }
          .phone-num { font-size: 13px; font-weight: 600; color: #3e2723; }
        }

        .phone-dial-badge {
          font-size: 12px;
          font-weight: 600;
          color: #c25b38;
        }
      }

      /* 行动按钮群 */
      .profile-quick-actions {
        margin-top: 18px;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .action-btn-desk {
          margin: 0;
          width: 100%;
          height: 46px;
          background: #fbf5ea;
          border: 1.5px solid #ebd9c5;
          border-radius: 23px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(62, 39, 35, 0.06);
          transition: all 0.15s ease;

          &:active {
            transform: scale(0.98);
            background: #f5ece0;
          }

          &::after { border: none; }

          .action-svg-icon {
            width: 18px;
            height: 18px;
            color: #8c5835;
          }

          .action-btn-txt {
            font-size: 14px;
            font-weight: 700;
            color: #8c5835;
          }
        }

        .action-btn-sub {
          margin: 0;
          width: 100%;
          height: 44px;
          background: #5c715e;
          color: #ffffff;
          border-radius: 22px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          box-shadow: 0 3px 10px rgba(92, 113, 94, 0.25);
          transition: all 0.15s ease;

          &:active {
            transform: scale(0.98);
            background: #4b5d4d;
          }

          &::after { border: none; }
        }
      }
    }

    /* 发表的动态流 */
    .user-statuses-section {
      margin: 0 16px 36px;

      .section-heading {
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 4px;

        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #3e2723;
        }

        .section-subtitle {
          font-size: 12px;
          color: #8c7e74;
        }
      }

      .statuses-flow {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .status-washi-card {
          padding: 16px;
          background: #ffffff;
          border: 1px solid #ebd9c5;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(62, 39, 35, 0.04);
          cursor: pointer;
          transition: all 0.15s ease;

          &:active {
            transform: scale(0.99);
            background: #fbf5ea;
          }

          .status-top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;

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
              color: #a89f91;
            }
          }

          .card-content-text {
            font-size: 14px;
            color: #3e2723;
            line-height: 1.5;
            margin-bottom: 10px;
            word-break: break-all;
          }

          .card-images-grid {
            display: flex;
            gap: 6px;
            position: relative;
            margin-bottom: 10px;

            .card-thumb {
              width: 68px;
              height: 68px;
              border-radius: 8px;
              background-color: #f1f5f9;
            }

            .more-images-mask {
              width: 68px;
              height: 68px;
              border-radius: 8px;
              background-color: rgba(62, 39, 35, 0.6);
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
                color: #8c7e74;
              }
            }

            .card-enter-hint {
              font-size: 12px;
              color: #8c5835;
              font-weight: 500;
            }
          }
        }
      }

      .user-empty-statuses {
        background-color: #ffffff;
        border: 1px dashed #ebd9c5;
        border-radius: 16px;
        padding: 28px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;

        .empty-icon { font-size: 28px; }
        .empty-text { font-size: 13px; color: #a89f91; }
      }
    }
  }
}
</style>