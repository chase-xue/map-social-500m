<template>
  <view v-if="helpSheetVisible" class="modal-mask" @tap="closeHelpSheet">
    <view class="help-sheet" @tap.stop>
      <!-- 头部 -->
      <view class="help-header" :class="{ 'emergency-header': isEmergencyHelp }">
        <view class="title-box">
          <text class="header-icon">{{ isEmergencyHelp ? '🚨' : '🆘' }}</text>
          <text class="help-title">{{ isEmergencyHelp ? '救命紧急呼救 (EMERGENCY)' : '急事求助 (HELP)' }}</text>
        </view>
        <view class="close-btn" @tap="closeHelpSheet">✕</view>
      </view>

      <!-- 求助级别切换 -->
      <view class="level-switch-row">
        <view
          class="level-tab normal-tab"
          :class="{ 'level-active': !isEmergencyHelp }"
          @tap="isEmergencyHelp = false"
        >
          <text class="tab-badge">🆘 普通急事</text>
          <text class="tab-sub">借工具/问路/寻物寻宠等</text>
        </view>
        <view
          class="level-tab emergency-tab"
          :class="{ 'level-active': isEmergencyHelp }"
          @tap="isEmergencyHelp = true"
        >
          <text class="tab-badge red-badge">🚨 救命求助</text>
          <text class="tab-sub">人身安全/特大标红广播</text>
        </view>
      </view>

      <!-- 救命警报横幅提示 -->
      <view v-if="isEmergencyHelp" class="emergency-alert-banner">
        <text class="alert-icon">⚡</text>
        <text class="alert-text">救命求助将在地图打上【特大红色警报标记】，并在全站顶部闪烁广播，请在危急时使用！</text>
      </view>

      <!-- 描述输入 -->
      <view class="input-card">
        <textarea
          class="help-textarea"
          v-model="newHelpContent"
          :placeholder="isEmergencyHelp ? '请详细描述您面临的紧急危急情况、具体位置及所需救助...' : '请描述您遇到的急事、需要邻里提供什么帮助...'"
          maxlength="400"
          placeholder-class="input-placeholder"
          :cursor-spacing="20"
        />
      </view>

      <!-- 现场照片上传 -->
      <view class="media-picker-area">
        <view v-for="(img, index) in pickedHelpImages" :key="index" class="picked-img-box">
          <image class="picked-img" :src="img" mode="aspectFill" @tap="previewImage(img, pickedHelpImages)" />
          <view class="img-delete-btn" @tap="removePickedHelpImage(index)">✕</view>
        </view>
        <view v-if="pickedHelpImages.length < 3" class="pick-btn" @tap="chooseHelpImages" hover-class="btn-hover">
          <text class="pick-camera-icon">📷</text>
          <text class="pick-tip">现场照片/证据</text>
          <text class="pick-count">({{ pickedHelpImages.length }}/3)</text>
        </view>
      </view>

      <!-- 紧急联系电话 -->
      <view class="phone-input-bar">
        <text class="phone-label">📞 紧急联系电话:</text>
        <input
          class="phone-input"
          v-model="helpContactPhone"
          type="number"
          placeholder="填写真实手机号便于邻里立即联络"
          maxlength="15"
        />
      </view>

      <!-- 底部温馨提示 -->
      <view class="help-footer-tip">
        <text class="tip-icon">🛡️</text>
        <text class="tip-text">发起后500米范围邻里将立刻收到通知；事态解决后由您本人点击关闭。</text>
      </view>

      <!-- 提交按钮 -->
      <button
        class="submit-help-btn"
        :class="{ 'emergency-submit-btn': isEmergencyHelp }"
        :loading="isHelpSubmitting"
        :disabled="isHelpSubmitting || !newHelpContent.trim()"
        @tap="submitHelpPost"
        hover-class="btn-hover"
      >
        <text class="btn-icon">{{ isEmergencyHelp ? '🚨' : '🆘' }}</text>
        <text>{{ isEmergencyHelp ? '立即发出救命呼救 (全网标红标大)' : '发出急事求助' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";
const {
  helpSheetVisible, isEmergencyHelp, newHelpContent, helpContactPhone, pickedHelpImages, isHelpSubmitting,
  closeHelpSheet, chooseHelpImages, removePickedHelpImage, submitHelpPost, previewImage,
} = useAppState();
</script>

<style lang="scss" scoped>
.help-sheet {
  background-color: #ffffff;
  border-radius: 40rpx 40rpx 0 0;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -12rpx 40rpx rgba(0, 0, 0, 0.2);
  padding: 32rpx 32rpx env(safe-area-inset-bottom);
  width: 100%;
  max-width: 480px;
  box-sizing: border-box;

  .help-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;

    .title-box {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .header-icon { font-size: 36rpx; }
      .help-title {
        font-size: 32rpx;
        font-weight: 800;
        color: #0f172a;
      }
    }

    &.emergency-header {
      .help-title { color: #dc2626; }
    }

    .close-btn {
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      background-color: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 26rpx;
    }
  }

  .level-switch-row {
    display: flex;
    gap: 16rpx;
    margin-bottom: 20rpx;

    .level-tab {
      flex: 1;
      padding: 18rpx 14rpx;
      border-radius: 20rpx;
      border: 2rpx solid #e2e8f0;
      background-color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6rpx;
      transition: all 0.2s;
      cursor: pointer;

      .tab-badge {
        font-size: 26rpx;
        font-weight: 700;
        color: #475569;
      }

      .tab-sub {
        font-size: 18rpx;
        color: #94a3b8;
      }

      &.normal-tab.level-active {
        background-color: #fffbeb;
        border-color: #f59e0b;
        box-shadow: 0 4rpx 16rpx rgba(245, 158, 11, 0.2);

        .tab-badge { color: #b45309; }
      }

      &.emergency-tab.level-active {
        background-color: #fef2f2;
        border-color: #ef4444;
        box-shadow: 0 6rpx 20rpx rgba(239, 68, 68, 0.25);

        .tab-badge { color: #dc2626; font-size: 28rpx; }
      }
    }
  }

  .emergency-alert-banner {
    display: flex;
    align-items: center;
    gap: 12rpx;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border: 1rpx solid #f87171;
    border-radius: 16rpx;
    padding: 14rpx 20rpx;
    margin-bottom: 20rpx;
    animation: alert-blink 2s infinite ease-in-out;

    .alert-icon { font-size: 30rpx; color: #dc2626; }
    .alert-text { font-size: 20rpx; color: #991b1b; font-weight: 700; line-height: 1.4; }
  }

  @keyframes alert-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }

  .input-card {
    background-color: #f8fafc;
    border: 2rpx solid #e2e8f0;
    border-radius: 20rpx;
    padding: 16rpx;
    margin-bottom: 20rpx;

    .help-textarea {
      width: 100%;
      height: 180rpx;
      font-size: 26rpx;
      color: #0f172a;
      line-height: 1.5;
    }
  }

  .media-picker-area {
    display: flex;
    gap: 16rpx;
    margin-bottom: 20rpx;

    .picked-img-box {
      width: 130rpx;
      height: 130rpx;
      border-radius: 16rpx;
      position: relative;
      overflow: hidden;

      .picked-img { width: 100%; height: 100%; }
      .img-delete-btn {
        position: absolute;
        top: 6rpx;
        right: 6rpx;
        width: 36rpx;
        height: 36rpx;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.65);
        color: #ffffff;
        font-size: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .pick-btn {
      width: 130rpx;
      height: 130rpx;
      border-radius: 16rpx;
      border: 2rpx dashed #cbd5e1;
      background-color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4rpx;

      .pick-camera-icon { font-size: 36rpx; }
      .pick-tip { font-size: 16rpx; color: #64748b; }
      .pick-count { font-size: 16rpx; color: #94a3b8; }
    }
  }

  .phone-input-bar {
    display: flex;
    align-items: center;
    gap: 12rpx;
    background-color: #f1f5f9;
    border-radius: 16rpx;
    padding: 14rpx 20rpx;
    margin-bottom: 20rpx;

    .phone-label { font-size: 22rpx; font-weight: 700; color: #334155; white-space: nowrap; }
    .phone-input { flex: 1; font-size: 24rpx; color: #0f172a; }
  }

  .help-footer-tip {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 24rpx;

    .tip-icon { font-size: 22rpx; }
    .tip-text { font-size: 20rpx; color: #64748b; line-height: 1.4; }
  }

  .submit-help-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 24rpx;
    font-size: 30rpx;
    font-weight: 700;
    color: #ffffff;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    box-shadow: 0 8rpx 24rpx rgba(217, 119, 6, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;

    &.emergency-submit-btn {
      background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
      box-shadow: 0 10rpx 30rpx rgba(220, 38, 38, 0.45);
      animation: emergency-btn-pulse 2s infinite ease-in-out;
    }
  }

  @keyframes emergency-btn-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
}
</style>
