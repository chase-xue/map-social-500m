<template>
  <view v-if="userCardVisible" class="modal-mask" @tap="closeUserCard">
    <view class="user-card-modal" @tap.stop>
      <view class="card-close" @tap="closeUserCard">✕</view>
      <view class="card-avatar-box">
        <image class="card-avatar" :src="viewingProfile?.avatar" mode="aspectFill" />
        <view class="card-gender-badge" :class="viewingProfile?.gender === '女' ? 'female' : 'male'">
          {{ viewingProfile?.gender === '女' ? '♀' : '♂' }}
        </view>
      </view>
      <text class="card-name">{{ viewingProfile?.name }}</text>
      <view class="card-tags-row">
        <text class="card-tag">{{ viewingProfile?.age ? viewingProfile.age + '岁' : '年龄保密' }}</text>
        <text class="card-tag">{{ viewingProfile?.gender || '保密' }}</text>
        <text class="card-tag loc-tag">📍 {{ viewingDistance ? viewingDistance + '米处' : '附近邻友' }}</text>
      </view>
      <view class="card-phone-section">
        <view v-if="viewingProfile?.phone && viewingProfile?.showPhone" class="card-phone-visible">
          <view class="phone-text-box">
            <text class="phone-label">联系电话</text>
            <text class="phone-val">📞 {{ viewingProfile.phone }}</text>
          </view>
          <button class="call-btn" @tap="makePhoneCall(viewingProfile.phone)">一键拨打</button>
        </view>
        <view v-else class="card-phone-hidden">
          <text class="phone-hidden-icon">🔒</text>
          <text class="phone-hidden-msg">手机号：对方已开启隐藏保密</text>
        </view>
      </view>
      <view class="card-bio-box">
        <text class="card-bio-label">个性签名</text>
        <text class="card-bio-text">{{ viewingProfile?.bio || '这个人很低调，还没有写签名哦~' }}</text>
      </view>
      <view class="card-footer-tip">
        <text>✨ 身处周边500米物理空间，相遇即是有缘</text>
      </view>
      <view class="card-action-row">
        <button v-if="viewingProfile?.id === myProfile.id" class="card-action-btn btn-self" @tap="closeUserCard(); openMyProfileSheet()">
          编辑我的资料
        </button>
        <button v-else-if="isFriend(viewingProfile?.id)" class="card-action-btn btn-chat" @tap="startChatFromCard(viewingProfile)">
          💬 发起私聊 (已是好友)
        </button>
        <button v-else-if="isFriendPending(viewingProfile?.id)" class="card-action-btn btn-pending" @tap="acceptFriendFromCard(viewingProfile?.id)">
          ⏳ 对方申请加你 (点击通过)
        </button>
        <button v-else class="card-action-btn btn-add" @tap="handleAddFriend(viewingProfile)">
          ➕ 加为好友 (绑定手机号即可加)
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";
const {
  userCardVisible, viewingProfile, viewingDistance, myProfile,
  closeUserCard, makePhoneCall, isFriend, isFriendPending,
  startChatFromCard, acceptFriendFromCard, handleAddFriend, openMyProfileSheet,
} = useAppState();
</script>
