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
            <text class="pill-text">距你当前位置约 {{ viewingDistance ? viewingDistance + '米' : '500米以内' }}</text>
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

      <!-- 组 3: 朋友圈动态入口 -->
      <view class="wechat-cells-group">
        <view class="wechat-cell-row">
          <text class="cell-label">朋友圈</text>
          <view class="cell-right-box">
            <text class="cell-dim-text">查看TA在周边发布的动态</text>
            <text class="cell-arrow">›</text>
          </view>
        </view>
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
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";

const {
  statusBarHeight, userCardVisible, viewingProfile, viewingDistance, myProfile,
  closeUserCard, makePhoneCall, isFriend, isFriendPending,
  startChatFromCard, acceptFriendFromCard, handleAddFriend, openMyProfileSheet,
} = useAppState();
</script>

<style lang="scss" scoped>
.wechat-contact-page {
  position: absolute;
  inset: 0;
  z-index: 100;
  background-color: #ededed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;

  .wechat-contact-header {
    height: 48px;
    background-color: #ededed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 0.5px solid #dcdcdc;
    flex-shrink: 0;

    .header-back-btn {
      display: flex;
      align-items: center;
      cursor: pointer;

      .back-arrow {
        font-size: 24px;
        font-weight: 300;
        color: #191919;
        margin-right: 2px;
        line-height: 1;
      }

      .back-text {
        font-size: 15px;
        color: #191919;
        font-weight: 500;
      }
    }

    .header-title-box {
      .header-title {
        font-size: 17px;
        font-weight: 600;
        color: #191919;
      }
    }

    .header-action-box {
      .header-more-btn {
        font-size: 18px;
        color: #191919;
        font-weight: 600;
        letter-spacing: 2px;
      }
    }
  }

  .contact-scroll-view {
    flex: 1;
    height: 100%;
    background-color: #ededed;

    .wechat-hero-card {
      margin-top: 10px;
      background-color: #ffffff;
      padding: 20px 16px;
      display: flex;
      align-items: flex-start;
      border-top: 0.5px solid #dcdcdc;
      border-bottom: 0.5px solid #dcdcdc;

      .hero-avatar {
        width: 64px;
        height: 64px;
        border-radius: 6px;
        object-fit: cover;
        margin-right: 16px;
        flex-shrink: 0;
      }

      .hero-info-col {
        flex: 1;
        overflow: hidden;

        .hero-name-row {
          display: flex;
          align-items: center;
          margin-bottom: 4px;

          .hero-name {
            font-size: 19px;
            font-weight: 600;
            color: #191919;
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
          font-size: 13px;
          color: #7f7f7f;
          margin-top: 2px;
          display: block;
        }

        .hero-distance-pill {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          background-color: #f2f5f9;
          padding: 3px 8px;
          border-radius: 12px;

          .pill-dot {
            font-size: 11px;
            margin-right: 4px;
          }

          .pill-text {
            font-size: 11px;
            color: #576B95;
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

    .wechat-contact-actions {
      margin-top: 24px;
      padding: 0 16px;

      .wechat-btn {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        margin-bottom: 12px;

        &::after {
          border: none;
        }

        &.btn-primary {
          background-color: #07c160;
          color: #ffffff;

          &:active {
            background-color: #06ad56;
          }
        }

        &.btn-secondary {
          background-color: #ffffff;
          color: #191919;
          border: 0.5px solid #dcdcdc;

          &:active {
            background-color: #f7f7f7;
          }
        }
      }
    }
  }
}
</style>
