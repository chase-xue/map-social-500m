<template>
  <view class="slow-notes-tab" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 顶栏：小纸条 + 纸篓 + 建群 -->
    <view class="tab-header">
      <view class="header-titles">
        <text class="main-title">小纸条</text>
        <text class="sub-title">淡黄手账纸笺 · 速发与纸团</text>
      </view>
      <view class="header-right-actions">
        <view class="header-pill-btn" @tap="openTrashDrawer">
          <text class="pill-ico">🗑️</text>
          <text class="pill-txt">纸篓</text>
          <text v-if="trashList.length > 0" class="pill-count">{{ trashList.length }}</text>
        </view>
        <view class="header-pill-btn primary-pill" @tap="openGroupDrawer">
          <text class="pill-ico">＋</text>
          <text class="pill-txt">建群</text>
        </view>
      </view>
    </view>

    <!-- 淡黄纸质会话列表（去掉定位显示，展示聊天时长称号） -->
    <scroll-view scroll-y class="conversations-scroll">
      <view class="conversations-list">
        <view
          v-for="friend in friendConversations"
          :key="friend.userId"
          class="paper-note-cell"
          @tap="openChatWithFriend(friend)"
        >
          <view class="paper-tape-dot" />
          <view class="avatar-box">
            <image class="user-avatar" :src="friend.avatar" mode="aspectFill" />
            <view v-if="friend.isGroup" class="group-corner-tag">群</view>
            <view v-if="friend.unreadCount && friend.unreadCount > 0" class="unread-badge">
              {{ friend.unreadCount }}
            </view>
          </view>

          <view class="chat-cell-content">
            <view class="cell-row-top">
              <view class="name-title-group">
                <text class="friend-name">{{ friend.name }}</text>
                <text class="relation-title-pill">
                  {{ getRelBadge(friend).icon }} {{ getRelBadge(friend).title }}
                </text>
              </view>
              <text class="chat-time">{{ formatTime(friend.lastMessageTime || Date.now()) }}</text>
            </view>
            <view class="cell-row-bottom">
              <text class="last-msg-preview">
                {{ friend.lastMessage || '还没有互传过小纸条，点击打个招呼吧~' }}
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部暖心提示 -->
      <view class="slow-chat-footer-tip">
        <text class="footer-icon">📮</text>
        <text class="footer-text">长久相伴会解锁专属关系称号 · 删除的纸条可在纸篓捡回</text>
      </view>
    </scroll-view>

    <!-- 纸篓抽屉（定时回收 + 捡回还原） -->
    <view v-if="trashDrawerVisible" class="ghibli-drawer-mask" @tap="trashDrawerVisible = false">
      <view class="ghibli-drawer-card" @tap.stop>
        <view class="drawer-handle" />
        <view class="drawer-head">
          <view>
            <text class="drawer-title">🗑️ 小纸条纸篓</text>
            <text class="drawer-sub">超过设定周期将自动定时回收清理</text>
          </view>
          <view class="retention-switch">
            <view
              class="ret-chip"
              :class="{ active: trashRetentionDays === 7 }"
              @tap="changeRetention(7)"
            >
              7天回收
            </view>
            <view
              class="ret-chip"
              :class="{ active: trashRetentionDays === 30 }"
              @tap="changeRetention(30)"
            >
              30天回收
            </view>
          </view>
        </view>

        <scroll-view scroll-y class="trash-scroll">
          <view v-if="trashList.length === 0" class="trash-empty">
            <text class="empty-ico">🍂</text>
            <text class="empty-txt">纸篓空空的，没有被揉掉的纸条</text>
          </view>
          <view v-for="item in trashList" :key="item.id" class="trash-card">
            <view class="trash-card-top">
              <text class="trash-from">来自：{{ item.sourceFriendName }}</text>
              <text class="trash-countdown">剩余 {{ calcRemainDays(item.deletedAt) }} 天自动回收</text>
            </view>
            <text class="trash-preview">
              {{ item.message.noteMode === 'crumpled' ? '🏐 [纸团] ' + (item.message.crumpledText || '手绘纸团') : item.message.contentType === 'image' ? '🖼️ [图片纸条]' : item.message.content }}
            </text>
            <view class="trash-card-actions">
              <view class="restore-btn" @tap="handleRestoreTrash(item.id)">♻️ 捡回纸条</view>
            </view>
          </view>
        </scroll-view>

        <view v-if="trashList.length > 0" class="drawer-bottom-bar">
          <view class="clear-trash-btn" @tap="handleEmptyTrash">立即清空纸篓</view>
        </view>
      </view>
    </view>

    <!-- 建群手账抽屉（需求 20） -->
    <view v-if="groupDrawerVisible" class="ghibli-drawer-mask" @tap="groupDrawerVisible = false">
      <view class="ghibli-drawer-card" @tap.stop>
        <view class="drawer-handle" />
        <view class="drawer-head">
          <view>
            <text class="drawer-title">👥 创建小纸条群聊</text>
            <text class="drawer-sub">群内默认文字速发，也支持随时扔纸团</text>
          </view>
        </view>

        <view class="group-input-box">
          <input
            class="group-name-inp"
            v-model="newGroupName"
            placeholder="给小群起个温暖的名字（如：丽江慢游小分队）"
            maxlength="20"
          />
        </view>

        <text class="select-tip">选择邀请好友（已选 {{ selectedMemberIds.length }} 人）</text>
        <scroll-view scroll-y class="members-scroll">
          <view
            v-for="f in selectableFriends"
            :key="f.userId"
            class="member-pick-row"
            :class="{ picked: selectedMemberIds.includes(f.userId) }"
            @tap="toggleSelectMember(f.userId)"
          >
            <image class="member-ava" :src="f.avatar" mode="aspectFill" />
            <text class="member-name">{{ f.name }}</text>
            <view class="check-circle">{{ selectedMemberIds.includes(f.userId) ? '✓' : '' }}</view>
          </view>
        </scroll-view>

        <view class="drawer-bottom-bar">
          <view class="create-group-btn" @tap="confirmCreateGroup">✨ 创建群聊并进入</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { FriendItem, TrashNoteItem } from "../../types";
import { useAppState } from "../../composables/useAppState";
import {
  getRelationshipTitle,
  getTrashNotes,
  getTrashRetentionDays,
  setTrashRetentionDays,
  restoreNoteFromTrash,
  emptyTrash,
  createNoteGroup
} from "../../services/slowNotesService";

const {
  statusBarHeight,
  openChatWithFriend,
  formatTime,
  getFriendsList
} = useAppState();

const friends = ref<FriendItem[]>([]);
const trashList = ref<TrashNoteItem[]>([]);
const trashRetentionDays = ref<number>(7);
const trashDrawerVisible = ref(false);
const groupDrawerVisible = ref(false);
const newGroupName = ref("");
const selectedMemberIds = ref<string[]>([]);
let timer: any = null;

function loadAll() {
  friends.value = getFriendsList();
  trashList.value = getTrashNotes();
  trashRetentionDays.value = getTrashRetentionDays();
}

onMounted(() => {
  loadAll();
  timer = setInterval(loadAll, 2500);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const friendConversations = computed(() => {
  return [...friends.value].sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
});

const selectableFriends = computed(() => {
  return friends.value.filter((f) => !f.isGroup);
});

function getRelBadge(friend: FriendItem) {
  return getRelationshipTitle(friend);
}

function openTrashDrawer() {
  trashList.value = getTrashNotes();
  trashRetentionDays.value = getTrashRetentionDays();
  trashDrawerVisible.value = true;
}

function changeRetention(days: 7 | 30) {
  setTrashRetentionDays(days);
  trashRetentionDays.value = days;
  trashList.value = getTrashNotes();
  uni.showToast({ title: `纸篓已设为 ${days} 天自动回收`, icon: "none" });
}

function calcRemainDays(deletedAt: number): number {
  const totalMs = trashRetentionDays.value * 24 * 60 * 60 * 1000;
  const remain = Math.max(0, totalMs - (Date.now() - deletedAt));
  return Math.max(1, Math.ceil(remain / (24 * 60 * 60 * 1000)));
}

function handleRestoreTrash(trashId: string) {
  if (restoreNoteFromTrash(trashId)) {
    trashList.value = getTrashNotes();
    uni.showToast({ title: "已从纸篓捡回原会话 ♻️", icon: "success" });
  }
}

function handleEmptyTrash() {
  emptyTrash();
  trashList.value = [];
  uni.showToast({ title: "纸篓已清空", icon: "none" });
}

function openGroupDrawer() {
  newGroupName.value = "";
  selectedMemberIds.value = selectableFriends.value.slice(0, 2).map((f) => f.userId);
  groupDrawerVisible.value = true;
}

function toggleSelectMember(uid: string) {
  const idx = selectedMemberIds.value.indexOf(uid);
  if (idx >= 0) {
    selectedMemberIds.value.splice(idx, 1);
  } else {
    selectedMemberIds.value.push(uid);
  }
}

function confirmCreateGroup() {
  if (selectedMemberIds.value.length < 1) {
    uni.showToast({ title: "请至少选择 1 位好友", icon: "none" });
    return;
  }
  const picked = selectableFriends.value.filter((f) => selectedMemberIds.value.includes(f.userId));
  const grp = createNoteGroup(newGroupName.value || "纸条小分队", picked);
  groupDrawerVisible.value = false;
  loadAll();
  uni.showToast({ title: `群聊「${grp.name}」已创建！`, icon: "success" });
  openChatWithFriend(grp);
}
</script>

<style lang="scss" scoped>
.slow-notes-tab {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f5f0;
  box-sizing: border-box;
  padding-bottom: calc(58px + env(safe-area-inset-bottom, 0px));
}

.tab-header {
  padding: 14px 16px 12px;
  background: #fffdf8;
  border-bottom: 0.5px solid #e5dfd3;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-titles {
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: 20px;
  font-weight: 700;
  color: #3e2723;
}

.sub-title {
  font-size: 11px;
  color: #8d6e63;
  margin-top: 2px;
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 16px;
  background: #f5f0e4;
  border: 1px solid #e4d9c4;
  cursor: pointer;

  .pill-ico { font-size: 12px; }
  .pill-txt { font-size: 12px; font-weight: 600; color: #5d4037; }
  .pill-count {
    font-size: 10px;
    background: #c25b38;
    color: #fff;
    padding: 0 5px;
    border-radius: 8px;
    font-weight: 700;
  }

  &.primary-pill {
    background: #3e2723;
    border-color: #3e2723;
    .pill-ico, .pill-txt { color: #fffdf8; }
  }
}

.conversations-scroll {
  flex: 1;
  min-height: 0;
}

.conversations-list {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 淡黄纸质便签会话卡（需求 6） */
.paper-note-cell {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  background: linear-gradient(180deg, #fffdf2 0%, #fdf6d8 100%);
  border: 1px solid #efe2b8;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(62, 39, 35, 0.06);
  cursor: pointer;

  .paper-tape-dot {
    position: absolute;
    top: -4px;
    left: 24px;
    width: 34px;
    height: 8px;
    background: rgba(255, 255, 255, 0.72);
    border: 0.5px dashed rgba(141, 110, 99, 0.35);
    border-radius: 2px;
  }
}

.avatar-box {
  position: relative;
  width: 46px;
  height: 46px;
  flex-shrink: 0;

  .user-avatar {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    border: 1.5px solid #fffdf8;
  }

  .group-corner-tag {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: #3e2723;
    color: #fffdf8;
    font-size: 9px;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 6px;
  }

  .unread-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: #c25b38;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.chat-cell-content {
  flex: 1;
  min-width: 0;
}

.cell-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.name-title-group {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.friend-name {
  font-size: 15px;
  font-weight: 700;
  color: #3e2723;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relation-title-pill {
  font-size: 10px;
  font-weight: 600;
  color: #8b5a2b;
  background: rgba(217, 119, 6, 0.12);
  border: 0.5px solid rgba(217, 119, 6, 0.3);
  padding: 1px 6px;
  border-radius: 8px;
  flex-shrink: 0;
}

.chat-time {
  font-size: 11px;
  color: #9e8b7a;
  flex-shrink: 0;
}

.last-msg-preview {
  font-size: 12px;
  color: #6d5849;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slow-chat-footer-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 18px 16px 26px;
  color: #9e8b7a;
  font-size: 11px;
}

/* 统一吉卜力手账抽屉 */
.ghibli-drawer-mask {
  position: absolute;
  inset: 0;
  z-index: 160;
  background: rgba(44, 36, 32, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
}

.ghibli-drawer-card {
  width: 100%;
  max-height: 78%;
  background: #fffdf8;
  border-radius: 20px 20px 0 0;
  padding: 10px 16px 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.drawer-handle {
  width: 38px;
  height: 4px;
  border-radius: 2px;
  background: #d7ccc8;
  margin: 0 auto 12px;
}

.drawer-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.drawer-title {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #3e2723;
}

.drawer-sub {
  display: block;
  font-size: 11px;
  color: #8d6e63;
  margin-top: 2px;
}

.retention-switch {
  display: flex;
  gap: 6px;
}

.ret-chip {
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  background: #f5f0e4;
  color: #6d5849;
  cursor: pointer;

  &.active {
    background: #3e2723;
    color: #fffdf8;
    font-weight: 600;
  }
}

.trash-scroll, .members-scroll {
  max-height: 320px;
}

.trash-empty {
  padding: 36px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #a1887f;
  .empty-ico { font-size: 30px; }
  .empty-txt { font-size: 13px; }
}

.trash-card {
  background: #fffbef;
  border: 1px solid #efe2b8;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.trash-card-top {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8d6e63;
  margin-bottom: 6px;
}

.trash-countdown {
  color: #c25b38;
  font-weight: 600;
}

.trash-preview {
  font-size: 13px;
  color: #3e2723;
  display: block;
  margin-bottom: 8px;
}

.trash-card-actions {
  display: flex;
  justify-content: flex-end;
}

.restore-btn {
  font-size: 11px;
  font-weight: 600;
  color: #3e2723;
  background: #f3e8d2;
  padding: 4px 10px;
  border-radius: 12px;
  cursor: pointer;
}

.group-input-box {
  background: #f7f3ea;
  border: 1px solid #e2d8c8;
  border-radius: 12px;
  padding: 9px 12px;
  margin-bottom: 12px;

  .group-name-inp {
    font-size: 14px;
    color: #3e2723;
  }
}

.select-tip {
  font-size: 12px;
  font-weight: 600;
  color: #795548;
  margin-bottom: 8px;
}

.member-pick-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  margin-bottom: 6px;
  background: #faf6ee;
  border: 1px solid transparent;
  cursor: pointer;

  &.picked {
    background: #fff8e1;
    border-color: #e6c675;
  }

  .member-ava {
    width: 34px;
    height: 34px;
    border-radius: 10px;
  }

  .member-name {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: #3e2723;
  }

  .check-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1.5px solid #bcaaa4;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #fff;
  }

  &.picked .check-circle {
    background: #3e2723;
    border-color: #3e2723;
  }
}

.drawer-bottom-bar {
  margin-top: 12px;
}

.clear-trash-btn, .create-group-btn {
  width: 100%;
  text-align: center;
  padding: 11px 0;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.clear-trash-btn {
  background: #fbe9e7;
  color: #c25b38;
}

.create-group-btn {
  background: #3e2723;
  color: #fffdf8;
}
</style>
