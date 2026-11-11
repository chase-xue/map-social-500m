<template>
  <view
    v-if="myProfileVisible"
    class="wechat-profile-page"
    :style="{ paddingTop: statusBarHeight + 'px' }"
  >
    <!-- 1. 微信原生「个人信息」顶栏: ‹ 返回 | 个人信息 | 保存 -->
    <view class="wechat-profile-header">
      <view class="header-back-btn" @tap="closeMyProfileSheet(true)">
        <text class="back-arrow">‹</text>
        <text class="back-text">我</text>
      </view>

      <view class="header-title-box">
        <text class="header-title">个人信息</text>
      </view>

      <view class="header-action-box">
        <button class="wechat-save-btn" @tap="saveMyProfile">
          保存
        </button>
      </view>
    </view>

    <!-- 2. 微信原生列表组滚动区 -->
    <scroll-view scroll-y class="profile-scroll-view">
      <!-- 组 1: 头像、名字、邻友号、二维码名片 -->
      <view class="wechat-cells-group">
        <!-- 头像行 -->
        <view class="wechat-cell-row avatar-row" @tap="chooseNewAvatar">
          <text class="cell-label">头像</text>
          <view class="cell-right-box">
            <image
              class="wechat-avatar-thumb"
              :src="editingProfile.avatar"
              mode="aspectFill"
            />
            <text class="cell-arrow">›</text>
          </view>
        </view>

        <!-- 名字行 -->
        <view class="wechat-cell-row">
          <text class="cell-label">名字</text>
          <view class="cell-right-box">
            <input
              class="wechat-cell-input"
              v-model="editingProfile.name"
              placeholder="请填写名字"
              maxlength="15"
            />
            <text class="cell-arrow">›</text>
          </view>
        </view>

        <!-- 邻友号 -->
        <view class="wechat-cell-row">
          <text class="cell-label">邻友号</text>
          <view class="cell-right-box">
            <text class="cell-dim-val">500m_{{ editingProfile.id?.slice(0, 8) || 'user' }}</text>
            <text class="cell-arrow">›</text>
          </view>
        </view>

        <!-- 我的二维码 -->
        <view class="wechat-cell-row">
          <text class="cell-label">我的二维码</text>
          <view class="cell-right-box">
            <svg class="cell-qr-svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v3h-2v-3zm3 3h3v5h-2v-3h-1v-2zm-3 2h2v3h-2v-3zm-2-2h2v2h-2v-2z"/>
            </svg>
            <text class="cell-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 组 2: 性别、年龄、个性签名 -->
      <view class="wechat-cells-group">
        <!-- 性别行 (点击呼出微信标准 ActionSheet) -->
        <view class="wechat-cell-row" @tap="showGenderSheet = true">
          <text class="cell-label">性别</text>
          <view class="cell-right-box">
            <text class="cell-val-text">{{ editingProfile.gender || '保密' }}</text>
            <text class="cell-arrow">›</text>
          </view>
        </view>

        <!-- 年龄行 -->
        <view class="wechat-cell-row">
          <text class="cell-label">年龄</text>
          <view class="cell-right-box">
            <input
              class="wechat-cell-input age-input"
              type="number"
              v-model.number="editingProfile.age"
              placeholder="填写年龄"
              maxlength="3"
            />
            <text class="cell-unit">岁</text>
            <text class="cell-arrow">›</text>
          </view>
        </view>

        <!-- 个性签名行 -->
        <view class="wechat-cell-row bio-row">
          <text class="cell-label">个性签名</text>
          <view class="cell-right-box">
            <input
              class="wechat-cell-input bio-input"
              v-model="editingProfile.bio"
              placeholder="写一句介绍自己的个性签名..."
              maxlength="60"
            />
            <text class="cell-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 组 3: 绑定手机号与隐私开关 -->
      <view class="wechat-cells-group">
        <!-- 手机号行 -->
        <view class="wechat-cell-row">
          <text class="cell-label">手机号</text>
          <view class="cell-right-box">
            <input
              class="wechat-cell-input phone-input"
              type="number"
              v-model="editingProfile.phone"
              placeholder="填写手机号"
              maxlength="11"
            />
          </view>
        </view>

        <!-- 公开手机号开关行 (微信绿 #07c160) -->
        <view class="wechat-cell-row switch-row">
          <view class="switch-left-col">
            <text class="cell-label">公开手机号</text>
            <text class="cell-sub-tip">
              {{ editingProfile.showPhone ? '已公开：附近 500 米邻友可直接联系拨打' : '已保密：对外隐藏手机号，仅自己可见' }}
            </text>
          </view>
          <view class="switch-right-box">
            <switch
              :checked="editingProfile.showPhone"
              @change="onPhonePrivacyChange"
              color="#07c160"
              style="transform: scale(0.85);"
            />
          </view>
        </view>
      </view>

      <!-- 组 4: 我的求助与急事历史 (如果存在) -->
      <view v-if="myHelpHistory && myHelpHistory.length > 0" class="wechat-help-section">
        <view class="section-title">
          <text>我的求助记录 ({{ myHelpHistory.length }})</text>
        </view>

        <view class="wechat-cells-group">
          <view
            v-for="item in myHelpHistory"
            :key="item.id"
            class="wechat-help-record-cell"
            @tap="closeMyProfileSheet(true); openDetailSheet(item)"
          >
            <view class="record-badge-col">
              <text
                class="record-status-tag"
                :class="{
                  'tag-emergency': item.isEmergency && !item.helpResolved,
                  'tag-resolved': item.helpResolved
                }"
              >
                {{ item.helpResolved ? '已关闭' : item.isEmergency ? '救命呼救' : '急事求助' }}
              </text>
            </view>
            <view class="record-center-col">
              <text class="record-desc-line">{{ item.content }}</text>
              <text class="record-time-line">{{ formatTime(item.createdAt) }} · {{ item.comments?.length || 0 }}条响应</text>
            </view>
            <view class="record-right-col">
              <text class="record-link-text">查看 ›</text>
            </view>
          </view>
        </view>
      </view>

      <view class="profile-bottom-spacer" />
    </scroll-view>

    <!-- 3. 微信原生性别 ActionSheet 底部选择器 -->
    <view v-if="showGenderSheet" class="wechat-actionsheet-mask" @tap="showGenderSheet = false">
      <view class="wechat-actionsheet" @tap.stop>
        <view class="actionsheet-title">设置性别</view>
        <view class="actionsheet-menu">
          <view
            v-for="g in ['男', '女', '保密']"
            :key="g"
            class="actionsheet-item"
            @tap="selectGender(g)"
          >
            <text class="item-text">{{ g }}</text>
            <text v-if="editingProfile.gender === g" class="item-check">✓</text>
          </view>
        </view>
        <view class="actionsheet-gap" />
        <view class="actionsheet-cancel" @tap="showGenderSheet = false">
          取消
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAppState } from "../composables/useAppState";

const showGenderSheet = ref(false);

const {
  statusBarHeight, myProfileVisible, editingProfile, myHelpHistory,
  closeMyProfileSheet, chooseNewAvatar, saveMyProfile, onPhonePrivacyChange,
  openDetailSheet, formatTime,
} = useAppState();

function selectGender(g: string) {
  editingProfile.value.gender = g;
  showGenderSheet.value = false;
}
</script>

<style lang="scss" scoped>
.wechat-profile-page {
  position: absolute;
  inset: 0;
  z-index: 100;
  background-color: #ededed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;

  /* 微信标准顶栏 */
  .wechat-profile-header {
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
      user-select: none;

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
      .wechat-save-btn {
        margin: 0;
        padding: 5px 14px;
        height: auto;
        line-height: 1.4;
        background-color: #07c160;
        color: #ffffff;
        font-size: 14px;
        font-weight: 500;
        border-radius: 4px;
        border: none;
        cursor: pointer;

        &:active {
          background-color: #06ad56;
        }

        &::after {
          border: none;
        }
      }
    }
  }

  /* 列表组滚动区 */
  .profile-scroll-view {
    flex: 1;
    height: 100%;
    background-color: #ededed;

    .wechat-cells-group {
      margin-top: 10px;
      background-color: #ffffff;
      border-top: 0.5px solid #dcdcdc;
      border-bottom: 0.5px solid #dcdcdc;

      .wechat-cell-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 13px 16px;
        border-bottom: 0.5px solid #ededed;
        background-color: #ffffff;
        user-select: none;

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background-color: #f7f7f7;
        }

        .cell-label {
          font-size: 16px;
          color: #191919;
          font-weight: 400;
          flex-shrink: 0;
        }

        .cell-right-box {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex: 1;
          margin-left: 16px;

          .wechat-avatar-thumb {
            width: 48px;
            height: 48px;
            border-radius: 6px;
            object-fit: cover;
          }

          .wechat-cell-input {
            text-align: right;
            font-size: 15px;
            color: #191919;
            flex: 1;
            padding: 0;
            margin: 0;
            border: none;
            background: transparent;

            &.bio-input {
              color: #555555;
            }

            &.age-input {
              width: 50px;
            }

            &.phone-input {
              letter-spacing: 0.5px;
            }
          }

          .cell-unit {
            font-size: 14px;
            color: #7f7f7f;
            margin-left: 4px;
          }

          .cell-val-text {
            font-size: 15px;
            color: #191919;
          }

          .cell-dim-val {
            font-size: 15px;
            color: #7f7f7f;
          }

          .cell-qr-svg {
            width: 20px;
            height: 20px;
            color: #7f7f7f;
          }

          .cell-arrow {
            font-size: 18px;
            color: #b2b2b2;
            margin-left: 8px;
            line-height: 1;
          }
        }

        &.switch-row {
          padding-top: 10px;
          padding-bottom: 10px;

          .switch-left-col {
            display: flex;
            flex-direction: column;

            .cell-sub-tip {
              font-size: 12px;
              color: #7f7f7f;
              margin-top: 2px;
            }
          }
        }
      }
    }

    /* 求助记录分区 */
    .wechat-help-section {
      margin-top: 14px;

      .section-title {
        padding: 0 16px 6px;
        font-size: 13px;
        color: #7f7f7f;
        font-weight: 500;
      }

      .wechat-help-record-cell {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 0.5px solid #ededed;
        background-color: #ffffff;
        cursor: pointer;

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background-color: #f7f7f7;
        }

        .record-badge-col {
          margin-right: 12px;

          .record-status-tag {
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 4px;
            background-color: #f0f0f0;
            color: #666666;
            font-weight: 500;

            &.tag-emergency {
              background-color: #fee2e2;
              color: #dc2626;
            }

            &.tag-resolved {
              background-color: #e6f4ea;
              color: #137333;
            }
          }
        }

        .record-center-col {
          flex: 1;
          overflow: hidden;

          .record-desc-line {
            font-size: 14px;
            color: #191919;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block;
          }

          .record-time-line {
            font-size: 11px;
            color: #999999;
            margin-top: 2px;
            display: block;
          }
        }

        .record-right-col {
          .record-link-text {
            font-size: 13px;
            color: #576B95;
            margin-left: 8px;
          }
        }
      }
    }

    .profile-bottom-spacer {
      height: 40px;
    }
  }

  /* 微信 ActionSheet 性别选择弹窗 */
  .wechat-actionsheet-mask {
    position: absolute;
    inset: 0;
    z-index: 200;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    animation: fadeIn 0.15s ease;

    .wechat-actionsheet {
      background-color: #f7f7f7;
      border-radius: 12px 12px 0 0;
      overflow: hidden;
      animation: slideUp 0.2s ease;

      .actionsheet-title {
        padding: 14px;
        text-align: center;
        font-size: 12px;
        color: #7f7f7f;
        background-color: #ffffff;
        border-bottom: 0.5px solid #ededed;
      }

      .actionsheet-menu {
        background-color: #ffffff;

        .actionsheet-item {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          height: 52px;
          border-bottom: 0.5px solid #ededed;
          cursor: pointer;

          &:last-child {
            border-bottom: none;
          }

          &:active {
            background-color: #f7f7f7;
          }

          .item-text {
            font-size: 17px;
            color: #191919;
          }

          .item-check {
            position: absolute;
            right: 24px;
            font-size: 18px;
            color: #07c160;
            font-weight: 600;
          }
        }
      }

      .actionsheet-gap {
        height: 8px;
        background-color: #ededed;
      }

      .actionsheet-cancel {
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #ffffff;
        font-size: 17px;
        color: #191919;
        font-weight: 500;
        cursor: pointer;

        &:active {
          background-color: #f7f7f7;
        }
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
