<template>
  <view v-if="chatSheetVisible" class="chat-fullscreen-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="chat-sheet">
      <!-- 微信标准顶栏: 返回键 + 昵称 + 更多菜单 -->
      <view class="chat-header">
        <view class="chat-back-btn" @tap="closeChatSheet(true)">
          <svg class="back-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          <text class="back-label">聊天</text>
        </view>

        <view class="chat-header-center" @tap="openUserProfileCard(currentChatFriend, undefined)">
          <text class="chat-header-name">{{ currentChatFriend?.name }}</text>
          <text class="online-tag">● 500m圈在线</text>
        </view>

        <view class="chat-more-btn" @tap="openUserProfileCard(currentChatFriend, undefined)">
          <svg class="more-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </view>
      </view>

      <!-- 聊天消息流 (微信浅灰底色) -->
      <scroll-view scroll-y class="chat-messages-box" :scroll-top="chatScrollTop">
        <view class="chat-scroll-inner">
          <view class="chat-security-tip">
            <text>🔒 你们已通过 500 米好友验证，支持点对点加密私聊</text>
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
        </view>
      </scroll-view>

      <!-- 微信底部输入栏 -->
      <view class="chat-input-bar">
        <view class="voice-icon-btn">
          <svg class="input-tool-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </view>
        <input
          class="chat-input"
          v-model="newChatMessageText"
          placeholder="发消息..."
          confirm-type="send"
          @confirm="sendCurrentChatMessage"
        />
        <view class="emoji-icon-btn">
          <svg class="input-tool-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
          </svg>
        </view>
        <button
          class="chat-send-btn"
          :class="{ 'btn-ready': !!newChatMessageText.trim() }"
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
  statusBarHeight, chatSheetVisible, currentChatFriend, currentChatMessages, newChatMessageText,
  chatScrollTop, myProfile,
  closeChatSheet, sendCurrentChatMessage, formatTime, openUserProfileCard,
} = useAppState();
</script>

<style lang="scss" scoped>
.chat-fullscreen-page {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: #ededed;
  z-index: 150;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.chat-sheet {
  background-color: #ededed;
  border-radius: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .chat-header {
    height: 48px;
    background-color: #ededed;
    border-bottom: 0.5px solid #dcdcdc;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    flex-shrink: 0;

    .chat-back-btn {
      display: flex;
      align-items: center;
      gap: 2px;
      cursor: pointer;
      color: #191919;

      .back-svg { width: 22px; height: 22px; }
      .back-label { font-size: 15px; font-weight: 500; }
    }

    .chat-header-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;

      .chat-header-name {
        font-size: 16px;
        font-weight: 600;
        color: #191919;
      }

      .online-tag {
        font-size: 10px;
        color: #07c160;
        font-weight: 600;
      }
    }

    .chat-more-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #191919;

      .more-svg { width: 20px; height: 20px; }
    }
  }

  .chat-messages-box {
    flex: 1;
    width: 100%;
    background-color: #ededed;

    .chat-scroll-inner {
      padding: 16px 12px;

      .chat-security-tip {
        text-align: center;
        font-size: 11px;
        color: #b2b2b2;
        margin-bottom: 20px;
      }

      .chat-bubble-row {
        display: flex;
        gap: 10px;
        margin-bottom: 16px;
        align-items: flex-start;

        .msg-avatar {
          width: 40px;
          height: 40px;
          border-radius: 4px;
          flex-shrink: 0;
          background-color: #ffffff;
        }

        .msg-bubble-content {
          max-width: 68%;
          display: flex;
          flex-direction: column;

          .msg-text {
            font-size: 15px;
            line-height: 1.45;
            padding: 10px 14px;
            border-radius: 4px;
            word-break: break-word;
            position: relative;
          }

          .msg-timestamp {
            font-size: 10px;
            color: #b2b2b2;
            margin-top: 4px;
          }
        }

        &.row-other {
          .msg-bubble-content {
            align-items: flex-start;

            .msg-text {
              background-color: #ffffff;
              color: #191919;
              border: 0.5px solid #e5e5e5;
            }
          }
        }

        &.row-self {
          flex-direction: row-reverse;

          .msg-bubble-content {
            align-items: flex-end;

            .msg-text {
              background-color: #95ec69;
              color: #191919;
              border: 0.5px solid #84d65a;
            }
          }
        }
      }
    }
  }

  .chat-input-bar {
    height: 52px;
    background-color: #f7f7f7;
    border-top: 0.5px solid #dcdcdc;
    display: flex;
    align-items: center;
    padding: 0 10px;
    gap: 8px;
    flex-shrink: 0;

    .voice-icon-btn,
    .emoji-icon-btn {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #7f7f7f;

      .input-tool-svg { width: 24px; height: 24px; }
    }

    .chat-input {
      flex: 1;
      height: 36px;
      background-color: #ffffff;
      border: 0.5px solid #dcdcdc;
      border-radius: 6px;
      padding: 0 10px;
      font-size: 15px;
      color: #191919;
    }

    .chat-send-btn {
      margin: 0;
      padding: 0 14px;
      height: 34px;
      line-height: 34px;
      background-color: #e2e8f0;
      color: #94a3b8;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      border: none;
      transition: all 0.2s ease;

      &.btn-ready {
        background-color: #07c160;
        color: #ffffff;
      }
    }
  }
}
</style>
