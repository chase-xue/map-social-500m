<template>
  <view v-if="friendsSheetVisible" class="modal-mask" @tap="closeFriendsSheet(false)">
    <view class="friends-sheet" @tap.stop>
      <view class="sheet-handle-bar" @tap="closeFriendsSheet(true)">
        <view class="sheet-handle" />
      </view>
      <view class="publish-header">
        <text class="publish-title">我的好友与私聊 ({{ friendsList.length }})</text>
        <view class="close-btn" @tap="closeFriendsSheet(true)">✕</view>
      </view>
      <view class="friends-tip-bar">
        <text>💡 双方绑定手机号后可通过好友，通过后可在此随时发起私聊</text>
      </view>
      <scroll-view scroll-y class="friends-scroll-list">
        <view class="friends-scroll-inner">
          <view v-if="friendsList.length === 0" class="empty-friends">
            <text>暂无好友，去地图上点击邻居头像加好友吧~</text>
          </view>
          <view
            v-for="friend in friendsList"
            :key="friend.userId"
            class="friend-item-card"
            :class="{ 'pending-card': friend.status === 'pending' }"
            @tap="friend.status === 'accepted' ? openChatSheet(friend) : null"
          >
            <image class="friend-avatar" :src="friend.avatar" mode="aspectFill" />
            <view class="friend-info">
              <view class="friend-top">
                <text class="friend-name">{{ friend.name }}</text>
                <text class="friend-time">{{ friend.lastMessageTime ? formatTime(friend.lastMessageTime) : '' }}</text>
              </view>
              <view class="friend-sub">
                <text class="friend-last-msg">{{ friend.lastMessage || (friend.status === 'pending' ? '请求添加你为好友' : '打个招呼吧') }}</text>
                <text v-if="friend.phone" class="friend-phone">📱 {{ friend.phone }}</text>
              </view>
            </view>
            <view class="friend-action-box">
              <button v-if="friend.status === 'pending'" class="accept-btn" @tap.stop="handleAcceptFriend(friend.userId)">
                通过
              </button>
              <button v-else class="chat-btn" @tap.stop="openChatSheet(friend)">
                私聊
              </button>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";
const {
  friendsSheetVisible, friendsList,
  closeFriendsSheet, formatTime, handleAcceptFriend, openChatSheet,
} = useAppState();
</script>
