<template>
  <view v-if="myProfileVisible" class="modal-mask" @tap="closeMyProfileSheet">
    <view class="profile-sheet" @tap.stop>
      <view class="publish-header">
        <text class="publish-title">我的个人资料</text>
        <view class="close-btn" @tap="closeMyProfileSheet">✕</view>
      </view>
      <view class="profile-avatar-row">
        <view class="profile-avatar-box" @tap="chooseNewAvatar">
          <image class="profile-large-avatar" :src="editingProfile.avatar" mode="aspectFill" />
          <view class="avatar-camera-overlay">📷 更换头像</view>
        </view>
        <text class="avatar-hint">点击头像从手机相册/拍照选择新头像</text>
      </view>
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input class="form-input" v-model="editingProfile.name" placeholder="输入你的昵称..." maxlength="15" />
      </view>
      <view class="form-item">
        <text class="form-label">性别</text>
        <view class="gender-radio-group">
          <view
            v-for="g in genderOptions"
            :key="g"
            class="gender-radio-btn"
            :class="{ 'radio-active': editingProfile.gender === g }"
            @tap="editingProfile.gender = g"
          >
            <text>{{ g === '男' ? '♂ 男生' : g === '女' ? '♀ 女生' : '🔒 保密' }}</text>
          </view>
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">年龄 (岁)</text>
        <input class="form-input" type="number" v-model.number="editingProfile.age" placeholder="输入年龄（如：24）..." maxlength="3" />
      </view>
      <view class="form-item">
        <text class="form-label">个性签名</text>
        <textarea class="bio-textarea" v-model="editingProfile.bio" placeholder="写一句介绍自己的个性签名，别人点击你头像就能看到..." maxlength="100" />
      </view>
      <view class="form-item">
        <view class="form-label-row">
          <text class="form-label">绑定手机号</text>
          <view class="phone-privacy-toggle">
            <text class="privacy-label">{{ editingProfile.showPhone ? '🟢 公开展示' : '🔒 隐藏保密' }}</text>
            <switch :checked="editingProfile.showPhone" @change="onPhonePrivacyChange" color="#6366f1" style="transform: scale(0.75);" />
          </view>
        </view>
        <input class="form-input" type="number" v-model="editingProfile.phone" placeholder="输入绑定手机号（如：13800138000）..." maxlength="11" />
        <text class="form-hint">{{ editingProfile.showPhone ? '附近500米邻友点击你的头像可直接看到手机号并联系你' : '已设为隐藏保密：对外隐藏手机号，仅自己可见' }}</text>
      </view>
      <button class="save-profile-btn" @tap="saveMyProfile">保存资料</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";

const genderOptions = ["男", "女", "保密"] as const;

const {
  myProfileVisible, editingProfile,
  closeMyProfileSheet, chooseNewAvatar, saveMyProfile, onPhonePrivacyChange,
} = useAppState();
</script>
