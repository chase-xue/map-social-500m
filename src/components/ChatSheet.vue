<template>
  <view v-if="chatSheetVisible" class="modal-mask" @tap="closeChatSheet">
    <view class="chat-sheet" @tap.stop>
      <view class="chat-header">
        <view class="chat-user-info" @tap="openUserProfileCard(currentChatFriend, undefined)">
          <image class="chat-header-avatar" :src="currentChatFriend?.avatar" mode="aspectFill" />
          <view>
            <view class="flex-row">
              <text class="chat-header-name">{{ currentChatFriend?.name }}</text>
              <text class="online-tag">● 500m圈在线</text>
            </view>
            <text class="chat-header-phone" v-if="currentChatFriend?.phone">📱 {{ currentChatFriend.phone }}</text>
          </view>
        </view>
        <view class="close-btn" @tap="closeChatSheet">✕</view>
      </view>
      <scroll-view scroll-y class="chat-messages-box" :scroll-top="chatScrollTop">
        <view class="chat-security-tip">
          <text>🔒 你们已通过好友验证，支持点对点加密私聊</text>
        </view>
        <view
          v-for="msg in currentChatMessages"
          :key="msg.id"
          class="chat-bubble-row"
          :class="msg.senderId === myProfile.id ? 'row-self' : 'row-other'"
        >
          <image
            class="msg-avatar"
            :src="msg.senderId === myProfile.id ? myProfile.avatar : currentChatFriend?.avatar"
            mode="aspectFill"
          />
          <view class="msg-bubble-content">
            <text class="msg-text">{{ msg.content }}</text>
            <text class="msg-timestamp">{{ formatTime(msg.createdAt) }}</text>
          </view>
        </view>
      </scroll-view>
      <view class="chat-input-bar">
        <input
          class="chat-input"
          v-model="newChatMessageText"
          placeholder="输入私聊消息..."
          confirm-type="send"
          @confirm="sendCurrentChatMessage"
        />
        <button
          class="chat-send-btn"
          :disabled="!newChatMessageText.trim()"
          @tap="sendCurrentChatMessage"
        >
          发送
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";
const {
  chatSheetVisible, currentChatFriend, currentChatMessages, newChatMessageText,
  chatScrollTop, myProfile,
  closeChatSheet, sendCurrentChatMessage, formatTime, openUserProfileCard,
} = useAppState();
</script>
