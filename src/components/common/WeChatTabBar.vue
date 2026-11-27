<template>
  <view class="note-tab-bar-float-wrap">
    <view class="note-tab-bar">
      <!-- 1. 小便签 -->
      <view
        class="tab-bar-item"
        :class="{ 'item-active': mainTab === 'map' || mainTab === 'notes' }"
        @tap="switchMainTab('map')"
      >
        <view class="icon-box">
          <svg class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 3 14 9 20 9"/>
            <line x1="8" y1="13" x2="14" y2="13"/>
            <line x1="8" y1="17" x2="12" y2="17"/>
          </svg>
          <view v-if="visibleStatuses.length > 0 && mainTab !== 'map' && mainTab !== 'notes'" class="note-badge">
            {{ visibleStatuses.length > 99 ? '99+' : visibleStatuses.length }}
          </view>
        </view>
        <text class="tab-label">小便签</text>
      </view>

      <!-- 2. 小纸条 -->
      <view
        class="tab-bar-item"
        :class="{ 'item-active': mainTab === 'chats' || mainTab === 'slowNotes' }"
        @tap="switchMainTab('slowNotes')"
      >
        <view class="icon-box">
          <svg class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
          </svg>
          <view v-if="unreadChatsCount > 0" class="note-badge">
            {{ unreadChatsCount > 99 ? '99+' : unreadChatsCount }}
          </view>
        </view>
        <text class="tab-label">小纸条</text>
      </view>

      <!-- 3. 小刷子 (居中陶土手作画笔圆钮，完整无裁切) -->
      <view class="tab-bar-center" @tap="triggerBrushPublish">
        <view class="brush-circle-btn">
          <svg class="brush-svg" viewBox="0 0 24 24" fill="none" stroke="#FFFDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18.37 2.63L14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z"/>
            <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7"/>
          </svg>
        </view>
        <text class="center-label">小刷子</text>
      </view>

      <!-- 4. 桌洞 -->
      <view
        class="tab-bar-item"
        :class="{ 'item-active': mainTab === 'deskHole' }"
        @tap="switchMainTab('deskHole')"
      >
        <view class="icon-box">
          <svg class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="5" width="18" height="10" rx="2"/>
            <line x1="6" y1="15" x2="6" y2="20"/>
            <line x1="18" y1="15" x2="18" y2="20"/>
            <line x1="9" y1="10" x2="15" y2="10"/>
          </svg>
        </view>
        <text class="tab-label">桌洞</text>
      </view>

      <!-- 5. 设置 -->
      <view
        class="tab-bar-item"
        :class="{ 'item-active': mainTab === 'me' || mainTab === 'settings' }"
        @tap="switchMainTab('settings')"
      >
        <view class="icon-box">
          <svg class="tab-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </view>
        <text class="tab-label">设置</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../../composables/useAppState";

const {
  mainTab,
  switchMainTab,
  unreadChatsCount,
  visibleStatuses,
  openPublishSheet
} = useAppState();

function triggerBrushPublish() {
  openPublishSheet();
}
</script>

<style lang="scss" scoped>
.note-tab-bar-float-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 12px calc(10px + env(safe-area-inset-bottom, 0px));
  pointer-events: none;
  overflow: visible;
  z-index: 60;
  box-sizing: border-box;
}

.note-tab-bar {
  pointer-events: auto;
  height: 60px;
  border-radius: 26px;
  background: rgba(255, 253, 248, 0.94);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(218, 204, 184, 0.85);
  box-shadow: 0 10px 28px rgba(62, 39, 35, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 6px;
  overflow: visible;
  box-sizing: border-box;
}

.tab-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 6px 0;
  border-radius: 18px;
  color: #8d7b6c;
  cursor: pointer;
  transition: all 0.22s ease;

  &.item-active {
    color: #c25b38;
    background: rgba(194, 91, 56, 0.09);

    .tab-label {
      color: #c25b38;
      font-weight: 700;
    }
  }
}

.icon-box {
  position: relative;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-svg {
  width: 20px;
  height: 20px;
}

.tab-label {
  font-size: 10px;
  font-weight: 600;
  color: inherit;
  letter-spacing: 0.3px;
  line-height: 1.2;
}

.note-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 9px;
  background: #c25b38;
  color: #fffdf8;
  font-size: 9.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #fffdf8;
  box-shadow: 0 2px 5px rgba(194, 91, 56, 0.28);
  box-sizing: border-box;
}

.tab-bar-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: visible;

  &:active .brush-circle-btn {
    transform: scale(0.92);
  }
}

.brush-circle-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-top: -22px;
  background: linear-gradient(145deg, #d97742 0%, #b8502c 100%);
  border: 3px solid #fffdf8;
  box-shadow: 0 8px 18px rgba(184, 80, 44, 0.36), inset 0 2px 4px rgba(255, 232, 200, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.brush-svg {
  width: 22px;
  height: 22px;
}

.center-label {
  font-size: 10px;
  font-weight: 700;
  color: #5d4037;
  margin-top: 2px;
  line-height: 1.2;
}
</style>
