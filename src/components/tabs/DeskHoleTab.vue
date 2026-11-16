<template>
  <view class="desk-hole-container" :style="themeVars">
    <!-- 顶部状态与访客信息栏 -->
    <view class="desk-top-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="desk-user-info" @tap="handleViewOwnerProfile" title="点击查看资料">
        <image class="owner-avatar" :src="currentDesk.ownerAvatar" mode="aspectFill" />
        <view class="owner-meta">
          <view class="owner-name-row">
            <text class="owner-name">{{ currentDesk.ownerName }}</text>
            <text class="desk-tag">{{ isVisitingOther ? '客座桌洞' : '我的书桌' }}</text>
          </view>
          <text class="owner-sub">访客 {{ currentDesk.visitorCount }} · 天气 {{ weatherLabel }}</text>
        </view>
      </view>

      <view class="desk-actions-top">
        <view v-if="isVisitingOther" class="action-pill-btn" @tap="exitVisiting">
          <text>‹ 回我桌洞</text>
        </view>
        <view v-else class="action-pill-btn" @tap="cycleWeather" title="切换窗外天气">
          <text class="pill-icon">{{ weatherIcon }}</text>
          <text class="pill-text">{{ weatherLabel }}</text>
        </view>
        <view v-if="!isVisitingOther" class="action-pill-btn theme-btn" @tap="themeSelectorVisible = !themeSelectorVisible">
          <text>🎨 装扮</text>
        </view>
      </view>
    </view>

    <!-- 主体区域：v1 重设计 · 面对窗户的写字台拟物全景 -->
    <view class="window-zone">
      <view class="window-frame">
        <view class="sky" :class="'weather-' + currentDesk.weather">
          <!-- 窗外自然景致层 (沿用原有天气结构) -->
          <view v-if="currentDesk.weather === 'sunny'" class="sun-glow" />
          <view v-if="currentDesk.weather === 'sunny'" class="sun-flare-rays" />
          <view v-if="currentDesk.weather === 'night'" class="night-sky">
            <view class="crescent-moon" />
            <view class="star star-1">✦</view>
            <view class="star star-2">★</view>
            <view class="star star-3">✦</view>
          </view>
          <view v-if="currentDesk.weather === 'rainy'" class="rain-canvas">
            <view v-for="i in 16" :key="i" class="rain-line" :style="{ left: (i * 6.2) + '%', animationDelay: (i * 0.12) + 's' }" />
          </view>
          <view class="distant-landscape" />
          <view class="soft-cloud cloud-1" />
          <view class="soft-cloud cloud-2" />
          <view class="bird bird-1" />
          <view class="bird bird-2" />

          <!-- 窗棂十字实木格条 -->
          <view class="window-wood-frame">
            <view class="crossbar-h" />
            <view class="crossbar-v" />
          </view>

          <!-- 纸飞机折纸飞入动画 (写完手写纸条时的沉浸动效) -->
          <view v-if="isFoldingFlying" class="paper-airplane-anim">
            <view class="airplane-body">✈️</view>
            <text class="airplane-trail">正在折起飞向窗台...</text>
          </view>

          <!-- 便签墙：v1 slot 错落散贴 (保留撕取动效与手写真迹) -->
          <view class="window-notes-stream">
            <view
              v-for="(note, idx) in visibleNotes"
              :key="note.id"
              class="washi-sticky-note"
              :class="['paper-' + note.color, { 'my-note': note.isMine, 'note-peeling': peelingNoteId === note.id }]"
              :style="noteSlots[idx]"
              @tap="peelAndInspectNote(note)"
            >
              <view class="washi-tape-strip" />
              <view class="note-author-row">
                <text class="note-author-txt">{{ note.authorName }}</text>
                <text class="note-heart">❤️ {{ note.likes }}</text>
              </view>
              <image
                v-if="isHandwritingImg(note.content)"
                class="handwritten-note-img"
                :src="note.content"
                mode="aspectFit"
              />
              <text v-else class="note-body-txt hand">{{ note.content }}</text>
            </view>

            <!-- 贴便签入口：和纸 "+" slot (D1，唯一发贴入口 HandwritingPad) -->
            <view class="washi-sticky-note note-plus" :style="noteSlots[visibleNotes.length]" @tap="openHandwritingPad">
              <text class="plus-ic">＋</text>
              <text class="plus-tx hand">贴一张</text>
            </view>

            <!-- 便签换批 chip (D2) -->
            <view v-if="remainingNotes > 0" class="batch-chip" @tap="cycleNoteBatch">
              <text class="batch-tx">+{{ remainingNotes }} 换一批</text>
            </view>
          </view>

          <!-- 飘动的两翼轻盈半透明白纱窗帘 -->
          <view class="sheer-curtain curtain-left" />
          <view class="sheer-curtain curtain-right" />

          <!-- 窗台木搁板 (v1 四件生活摆件) -->
          <view class="window-shelf">
            <view class="shelf-item"><text class="item-emoji">🪴</text><text class="shelf-label">春日多肉</text></view>
            <view class="shelf-item">
              <view class="books"><view class="bk b1" /><view class="bk b2" /><view class="bk b3" /></view>
              <text class="shelf-label">未读完的书</text>
            </view>
            <view class="shelf-item">
              <view class="coffee-steaming">
                <view class="steam steam-1" />
                <view class="steam steam-2" />
                <text class="coffee-cup">☕</text>
              </view>
              <text class="shelf-label">热手冲</text>
            </view>
            <view class="shelf-item"><text class="item-emoji">🕯️</text><text class="shelf-label">香薰烛</text></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 桌面：v1 第一人称摆置 (去卡片框) -->
    <view class="desk-zone">
      <view class="desk-top">
        <view v-if="currentDesk.weather === 'sunny'" class="desk-sunlight-beam" pointer-events="none" />
        <view class="linen-mat">
          <!-- 📖 生活回忆录日记本 (沿用原有装订结构) -->
          <view class="obj obj-journal">
            <view class="vintage-journal-book" @tap="diaryModalVisible = true">
              <view class="journal-spine-leather" />
              <view class="journal-stitch-line" />
              <view class="journal-ribbon" />
              <view class="deckled-pages-edge" />
              <view class="journal-cover-title">
                <text class="journal-txt">生活回忆录</text>
                <text class="journal-meta">{{ currentDesk.diaryEntries.length }} 篇便签足迹 ›</text>
              </view>
            </view>
            <text class="obj-cap">回忆录</text>
          </view>

          <!-- 桌面小物：墨水瓶 / 和纸胶带 / 铅笔 (纯装饰) -->
          <view class="obj obj-middles">
            <view class="middles">
              <view class="ink" />
              <view class="tapes"><view class="tape t1" /><view class="tape t2" /></view>
              <view class="pencil" />
            </view>
            <text class="obj-cap">墨水瓶 · 和纸胶带</text>
          </view>

          <!-- ✍️ 真实手写笔筒 (点击立即弹出真迹画板) -->
          <view class="obj obj-caddy" @tap="openHandwritingPad">
            <view class="caddy">
              <view class="pens"><view class="pen p1" /><view class="pen p2" /><view class="pen p3" /></view>
              <view class="pot"><text class="pot-lb">✍️ 手写</text><text class="pot-lb2">真迹笔画涂鸦</text></view>
            </view>
            <text class="obj-cap">笔筒</text>
          </view>
        </view>
      </view>

      <!-- 桌前脸：抽屉内嵌 (v1 木纹连续 + 黄铜拉手 + 火漆徽章) -->
      <view class="desk-front">
        <view class="drawer-face-panel drawer-closed-face" @tap="openDrawer">
          <view class="brass-handle-box">
            <view class="brass-curved-pull" />
            <view class="brass-label-plate">
              <text class="drawer-plate-text">📥 桌洞抽屉</text>
              <text class="drawer-count-badge">{{ currentDesk.drawerNotes.length }} 封</text>
            </view>
          </view>
          <view class="drawer-right-box">
            <view v-if="isVisitingOther" class="secret-pill" @tap.stop="openSendPaperToUser">
              <text class="secret-tx">💌 给TA塞纸条</text>
            </view>
            <view class="drawer-action-pill open-pill">
              <text class="action-pill-icon">📂</text>
              <text class="action-pill-text">点击拉开 ›</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 抽屉拉开：overlay 下滑 (D3 保一屏)，开合逻辑沿用 isDrawerPulled -->
    <view v-if="isDrawerPulled" class="drawer-open-overlay" @tap="closeDrawer">
      <view class="drawer-inner-compartment drawer-open-panel" @tap.stop>
        <view class="compartment-header">
          <view class="comp-title-box">
            <text class="comp-icon">🕯️</text>
            <text class="comp-title">桌洞暗格 · 私密小纸条信物</text>
            <text class="comp-badge">{{ currentDesk.drawerNotes.length }} 封</text>
          </view>
          <view class="comp-close-pill" @tap.stop="closeDrawer">
            <text class="close-pill-text">✕ 推回收起</text>
          </view>
        </view>

        <scroll-view scroll-y class="drawer-letters-scroll">
          <view v-if="currentDesk.drawerNotes.length === 0" class="drawer-empty-state">
            <text class="empty-icon">📮</text>
            <text class="empty-txt">抽屉内铺着柔软毛毡，等待朋友塞进第一封手写纸条～</text>
          </view>

          <view
            v-for="dn in currentDesk.drawerNotes"
            :key="dn.id"
            class="drawer-letter-envelope"
            :class="{ 'wax-sealed': dn.isSealed }"
            @tap="openDrawerNoteDetail(dn)"
          >
            <view class="envelope-stamp-box">
              <image class="letter-avatar" :src="dn.senderAvatar" mode="aspectFill" />
              <view v-if="dn.isSealed" class="real-wax-seal">印</view>
            </view>
            <view class="envelope-body">
              <view class="env-top">
                <text class="env-sender">{{ dn.senderName }}</text>
                <text class="env-time">{{ dn.receivedTime }}</text>
              </view>
              <text class="env-preview">{{ dn.preview }}</text>
            </view>
            <view class="env-open-arrow">›</view>
          </view>
        </scroll-view>
      </view>
    </view>    <!-- 真实手写笔迹画板组件 (Handwriting Canvas) -->
    <HandwritingPad
      v-if="handwritingPadVisible"
      actionConfirmText="💌 折起贴上窗台"
      defaultPattern="yellow"
      @confirm="onHandwritingConfirmed"
      @close="handwritingPadVisible = false"
    />

    <!-- 装扮皮肤切换浮窗 -->
    <view v-if="themeSelectorVisible" class="theme-selector-pop">
      <view class="theme-pop-header">
        <text class="pop-title">切换桌洞书桌风格</text>
        <text class="pop-close" @tap="themeSelectorVisible = false">✕</text>
      </view>
      <view class="theme-options">
        <view
          v-for="t in themeList"
          :key="t.key"
          class="theme-chip"
          :class="{ 'chip-active': currentDesk.theme === t.key }"
          @tap="selectTheme(t.key)"
        >
          <text class="theme-chip-icon">{{ t.icon }}</text>
          <text class="theme-chip-label">{{ t.name }}</text>
        </view>
      </view>
    </view>

    <!-- 📖 全窗口手账阅读器：生活回忆录 (Full Window Diary Memory Book) -->
    <view v-if="diaryModalVisible" class="diary-full-page">
      <!-- 顶部手账书脊导航栏 -->
      <view class="diary-full-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="diary-nav-back" @tap="diaryModalVisible = false">
          <text class="back-arrow">‹</text>
          <text class="back-text">返回桌洞</text>
        </view>
        <view class="diary-nav-title-box">
          <text class="diary-nav-title">📖 生活回忆录</text>
          <text class="diary-nav-sub">手账足迹 · {{ currentDesk.diaryEntries.length }} 篇</text>
        </view>
        <view class="diary-nav-close" @tap="diaryModalVisible = false">
          <text class="close-icon">✕</text>
        </view>
      </view>

      <!-- 全窗口手账滚卷内容区 -->
      <scroll-view scroll-y class="diary-full-scroll">
        <view class="diary-scroll-content">
          <!-- 顶部序言和纸卡片 -->
          <view class="diary-intro-card">
            <view class="washi-tape-strip" />
            <view class="intro-quote">
              <text class="quote-mark">“</text>
              <text class="quote-text">生活慢下来，在500米圈里收集温暖随笔与手写信物。每一张翻过的纸条，都是真实的邻里慢时光。</text>
              <text class="quote-mark right-mark">”</text>
            </view>
            <view class="intro-author-row">
              <image class="intro-avatar" :src="currentDesk.ownerAvatar" mode="aspectFill" />
              <text class="intro-author-name">来自 {{ currentDesk.ownerName }} 的随身手账</text>
            </view>
          </view>

          <!-- 便签足迹列表 -->
          <view class="diary-entries-flow">
            <view
              v-for="d in currentDesk.diaryEntries"
              :key="d.id"
              class="diary-entry-fullcard"
              :class="'paper-' + d.color"
            >
              <!-- 撕边胶带拟物点缀 -->
              <view class="entry-tape-accent" />

              <view class="entry-meta-row">
                <text class="entry-date">{{ d.dateStr }}</text>
                <text class="entry-loc">📍 {{ d.locationName }}</text>
              </view>

              <text class="entry-title">{{ d.title }}</text>
              <text class="entry-body">{{ d.content }}</text>

              <view class="entry-footer-row">
                <text class="entry-tag"># {{ d.tag }}</text>
                <view class="entry-stamp">
                  <text class="stamp-text">慢足迹</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 底部装订落款与留白 -->
          <view class="diary-bottom-sign">
            <view class="sign-divider">
              <view class="line" />
              <text class="sign-star">✦</text>
              <view class="line" />
            </view>
            <text class="sign-text">小纸条 · 500米生活手账回忆录</text>
            <text class="sign-sub">继续在窗台与桌洞收集慢生活记忆吧</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 🔍 窗台便签放大展开检视弹窗 (支持查看手写真迹、撕下带走、点赞) -->
    <view v-if="inspectModalVisible && inspectingNote" class="note-inspect-overlay" @tap.self="closeInspectModal">
      <view class="note-inspect-modal" :class="['paper-' + inspectingNote.color]">
        <!-- 和纸胶带 -->
        <view class="inspect-washi-tape" />

        <!-- 便签头部：作者信息与发布时间 -->
        <view class="inspect-header">
          <view class="inspect-author-info clickable" @tap="handleViewNoteAuthorProfile" title="点击查看作者资料">
            <image class="inspect-avatar" :src="inspectingNote.authorAvatar" mode="aspectFill" />
            <view class="inspect-meta">
              <text class="inspect-author-name">{{ inspectingNote.authorName }}</text>
              <text class="inspect-time">{{ formatRelativeTime(inspectingNote.createdAt) }} 贴在窗台上</text>
            </view>
          </view>
          <text class="inspect-close-btn" @tap="closeInspectModal">✕</text>
        </view>

        <!-- 便签主体：手写真迹大图 或 规整纸张手写文本 -->
        <view class="inspect-body">
          <!-- 如果是真迹手写图片 -->
          <view v-if="isHandwritingImg(inspectingNote.content)" class="inspect-handwriting-wrapper">
            <image
              class="inspect-full-hw-img"
              :src="inspectingNote.content"
              mode="widthFix"
            />
          </view>
          <!-- 如果是纯文字便签 -->
          <view v-else class="inspect-text-wrapper">
            <text class="inspect-full-text">{{ inspectingNote.content }}</text>
          </view>
        </view>

        <!-- 便签底部操作栏：点赞 ❤️、撕下带走/删除 🗑️、贴回窗台 📌 -->
        <view class="inspect-footer">
          <view class="inspect-action-btn like-btn" @tap="likeInspectingNote">
            <text class="action-icon">❤️</text>
            <text class="action-label">{{ inspectingNote.likes }} 喜欢</text>
          </view>

          <view v-if="inspectingNote.isMine" class="inspect-action-btn delete-btn" @tap="removeInspectingNote">
            <text class="action-icon">🗑️</text>
            <text class="action-label">撕下带走</text>
          </view>

          <view class="inspect-action-btn close-btn" @tap="closeInspectModal">
            <text class="action-icon">📌</text>
            <text class="action-label">贴回窗台</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 💌 桌洞私密信纸阅读与快捷回信弹窗 -->
    <view v-if="drawerSecretModalVisible && activeSecretNote" class="secret-letter-overlay" @tap.self="drawerSecretModalVisible = false">
      <view class="secret-letter-card">
        <!-- 信封顶部火漆封口 / 邮戳 -->
        <view class="letter-top-row">
          <view class="letter-sender-info clickable" @tap="handleViewSecretSenderProfile" title="点击查看资料">
            <image class="letter-modal-avatar" :src="activeSecretNote.senderAvatar" mode="aspectFill" />
            <view class="letter-sender-meta">
              <text class="letter-sender-name">{{ activeSecretNote.senderName }}</text>
              <text class="letter-send-time">悄悄塞入桌洞 · {{ activeSecretNote.receivedTime }}</text>
            </view>
          </view>
          <view v-if="activeSecretNote.isSealed" class="letter-seal-tag">
            <text class="seal-glyph">🔏</text>
            <text class="seal-text">火漆印密封</text>
          </view>
          <text class="letter-close-btn" @tap="drawerSecretModalVisible = false">✕</text>
        </view>

        <!-- 信笺纸正文 -->
        <view class="letter-sheet-body">
          <text class="letter-text">{{ activeSecretNote.fullContent }}</text>
        </view>

        <!-- 底部快捷动作：提笔给TA回信 (一键跳转小纸条慢聊) + 收回抽屉 -->
        <view class="letter-actions-row">
          <button class="letter-reply-btn" @tap="replyToSecretSender(activeSecretNote)">
            <text class="reply-icon">💬</text>
            <text class="reply-text">提笔给TA回小纸条</text>
          </button>
          <button class="letter-fold-btn" @tap="drawerSecretModalVisible = false">
            <text class="fold-text">收回抽屉</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { DeskTheme, NotePaperColor } from "../../types";
import {
  getMyDeskData,
  saveMyDeskData,
  getOtherUserDeskData,
  postWindowNote,
  removeWindowNote,
  DeskHoleData,
  WindowNoteItem,
  DrawerSecretNote
} from "../../services/deskService";
import { useAppState } from "../../composables/useAppState";
import HandwritingPad from "../common/HandwritingPad.vue";

const {
  statusBarHeight,
  openChatWithFriend,
  getFriendsList,
  targetVisitingDesk,
  openProfileByUserId,
  openMyProfileSheet
} = useAppState();

const currentDesk = ref<DeskHoleData>(getMyDeskData());
const isVisitingOther = ref(false);

watch(targetVisitingDesk, (target) => {
  if (target) {
    visitUserDesk(target.userId, target.name, target.avatar);
    targetVisitingDesk.value = null;
  }
}, { immediate: true });

const isDrawerPulled = ref(false);

const themeSelectorVisible = ref(false);
const diaryModalVisible = ref(false);
const handwritingPadVisible = ref(false);
const isFoldingFlying = ref(false);
const peelingNoteId = ref<string | null>(null);

// 窗台便签放大展开检视弹窗状态
const inspectModalVisible = ref(false);
const inspectingNote = ref<WindowNoteItem | null>(null);

// 桌洞暗格私密信件阅读弹窗状态
const drawerSecretModalVisible = ref(false);
const activeSecretNote = ref<DrawerSecretNote | null>(null);

const themeList = [
  { key: "wood" as DeskTheme, name: "温暖橡木", icon: "🪵" },
  { key: "cherry" as DeskTheme, name: "樱花手账", icon: "🌸" },
  { key: "retro" as DeskTheme, name: "复古墨绿", icon: "🌲" },
  { key: "modern" as DeskTheme, name: "极简素白", icon: "☁️" }
];

const weatherIcon = computed(() => {
  switch (currentDesk.value.weather) {
    case "sunny": return "☀️";
    case "rainy": return "🌧️";
    case "night": return "🌙";
    default: return "⛅";
  }
});

const weatherLabel = computed(() => {
  switch (currentDesk.value.weather) {
    case "sunny": return "午后暖阳";
    case "rainy": return "窗前细雨";
    case "night": return "星空静谧";
    default: return "晴间多云";
  }
});

// ===== v1 重设计：便签 slot / 换批 / 主题木色变量 =====
const noteBatch = ref(0);
// slot 表：索引 = 可见便签数（表内项数 = 便签数 + 1 个 "+" 入口）
const NOTE_SLOTS: { top: string; left: string; width: string }[][] = [
  [{ top: '26%', left: '28%', width: '44%' }],
  [{ top: '14%', left: '6%', width: '44%' }, { top: '40%', left: '50%', width: '44%' }],
  [{ top: '10%', left: '4%', width: '44%' }, { top: '8%', left: '52%', width: '44%' }, { top: '46%', left: '28%', width: '44%' }],
  [{ top: '10%', left: '4%', width: '44%' }, { top: '8%', left: '52%', width: '44%' }, { top: '44%', left: '4%', width: '44%' }, { top: '46%', left: '52%', width: '44%' }],
  [{ top: '8%', left: '4%', width: '30%' }, { top: '8%', left: '35%', width: '30%' }, { top: '8%', left: '66%', width: '30%' }, { top: '44%', left: '6%', width: '44%' }, { top: '46%', left: '52%', width: '44%' }],
  [{ top: '8%', left: '4%', width: '30%' }, { top: '8%', left: '35%', width: '30%' }, { top: '8%', left: '66%', width: '30%' }, { top: '44%', left: '4%', width: '30%' }, { top: '44%', left: '35%', width: '30%' }, { top: '44%', left: '66%', width: '30%' }],
  [{ top: '8%', left: '2%', width: '22%' }, { top: '8%', left: '26%', width: '22%' }, { top: '8%', left: '50%', width: '22%' }, { top: '8%', left: '74%', width: '22%' }, { top: '44%', left: '4%', width: '30%' }, { top: '44%', left: '35%', width: '30%' }, { top: '44%', left: '66%', width: '30%' }],
];
const visibleNotes = computed(() => currentDesk.value.windowNotes.slice(noteBatch.value * 6, noteBatch.value * 6 + 6));
const noteBatchCount = computed(() => Math.max(1, Math.ceil(currentDesk.value.windowNotes.length / 6)));
const remainingNotes = computed(() => Math.max(0, currentDesk.value.windowNotes.length - (noteBatch.value + 1) * 6));
function cycleNoteBatch() {
  noteBatch.value = (noteBatch.value + 1) % noteBatchCount.value;
}
const noteSlots = computed(() => {
  const n = visibleNotes.value.length;
  const table = NOTE_SLOTS[Math.min(6, n)];
  return table.map((s, i) => ({
    top: s.top,
    left: s.left,
    width: s.width,
    transform: `rotate(${i < n ? (visibleNotes.value[i].rotationDeg || 0) : -2}deg)`,
  }));
});
// 主题木色变量：窗框/搁板/桌/抽屉整屋换色（修现状 theme 只改背景色的缺陷）
const THEME_WOOD: Record<string, Record<string, string>> = {
  wood: { '--wood-dark': '#5d3a20', '--wood': '#7a5236', '--wood-mid': '#8a5a38', '--wood-light': '#9a6b45' },
  cherry: { '--wood-dark': '#4a2620', '--wood': '#6b3a30', '--wood-mid': '#7d4438', '--wood-light': '#8f5244' },
  retro: { '--wood-dark': '#20301f', '--wood': '#33482c', '--wood-mid': '#3f5636', '--wood-light': '#4c6542' },
  modern: { '--wood-dark': '#232a35', '--wood': '#37414f', '--wood-mid': '#425061', '--wood-light': '#4f5f73' },
};
const themeVars = computed(() => THEME_WOOD[currentDesk.value.theme] || THEME_WOOD.wood);
function cycleWeather() {
  const weathers: DeskHoleData["weather"][] = ["sunny", "rainy", "night", "cloudy"];
  const currIdx = weathers.indexOf(currentDesk.value.weather);
  const next = weathers[(currIdx + 1) % weathers.length];
  currentDesk.value.weather = next;
  saveMyDeskData(currentDesk.value);
}

function selectTheme(theme: DeskTheme) {
  currentDesk.value.theme = theme;
  saveMyDeskData(currentDesk.value);
  themeSelectorVisible.value = false;
}

function exitVisiting() {
  currentDesk.value = getMyDeskData();
  isVisitingOther.value = false;
}

// 🗄️ 实木抽屉物理交互：点击拉开 / 推回闭合
function openDrawer() {
  isDrawerPulled.value = true;
  uni.showToast({ title: "咔嗒 · 抽屉滑开 📬", icon: "none" });
}

function closeDrawer() {
  isDrawerPulled.value = false;
}

function toggleDrawerPull() {
  if (isDrawerPulled.value) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

// 撕取并打开便签检视弹窗 (带物理微翘动效)
function peelAndInspectNote(note: WindowNoteItem) {
  peelingNoteId.value = note.id;
  setTimeout(() => {
    peelingNoteId.value = null;
    inspectingNote.value = note;
    inspectModalVisible.value = true;
  }, 220);
}

function closeInspectModal() {
  inspectModalVisible.value = false;
  inspectingNote.value = null;
}

function likeInspectingNote() {
  if (!inspectingNote.value) return;
  inspectingNote.value.likes += 1;
  saveMyDeskData(currentDesk.value);
  uni.showToast({ title: "已为便签点赞 ❤️", icon: "none" });
}

function removeInspectingNote() {
  if (!inspectingNote.value) return;
  const idToRemove = inspectingNote.value.id;
  removeWindowNote(idToRemove);
  currentDesk.value = getMyDeskData();
  closeInspectModal();
  uni.showToast({ title: "已撕下窗台便签 🗑️", icon: "success" });
}

function formatRelativeTime(ts: number): string {
  if (!ts) return "刚刚";
  const diff = Date.now() - ts;
  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  return `${Math.floor(diff / 86400000)}天前`;
}

function isHandwritingImg(content: string): boolean {
  if (!content) return false;
  return content.startsWith("data:image/") || content.startsWith("http");
}

function openHandwritingPad() {
  handwritingPadVisible.value = true;
}

// 确认手写真迹便签
function onHandwritingConfirmed(dataUrl: string) {
  handwritingPadVisible.value = false;
  isFoldingFlying.value = true;

  // 播放折纸飞机飞向窗台动画
  setTimeout(() => {
    isFoldingFlying.value = false;
    postWindowNote(currentDesk.value.ownerId, dataUrl, "yellow");
    currentDesk.value = getMyDeskData();
    uni.showToast({ title: "手写纸条已折起，贴上窗台！✨", icon: "success" });
  }, 1000);
}

function openDrawerNoteDetail(dn: DrawerSecretNote) {
  dn.read = true;
  saveMyDeskData(currentDesk.value);
  activeSecretNote.value = dn;
  drawerSecretModalVisible.value = true;
}

function replyToSecretSender(dn: DrawerSecretNote) {
  drawerSecretModalVisible.value = false;
  const friends = getFriendsList();
  let f = friends.find(item => item.name === dn.senderName || item.avatar === dn.senderAvatar);
  if (!f) {
    f = {
      userId: "user_" + Date.now(),
      name: dn.senderName,
      avatar: dn.senderAvatar,
      distanceMeters: 680,
      unreadCount: 0,
      lastMessage: dn.preview,
      lastMessageTime: Date.now()
    };
  }
  openChatWithFriend(f);
}

function openSendPaperToUser() {
  const friends = getFriendsList();
  const f = friends.find(item => item.userId === currentDesk.value.ownerId) || friends[0];
  if (f) {
    openChatWithFriend(f);
  }
}

function visitUserDesk(userId: string, name: string, avatar: string) {
  currentDesk.value = getOtherUserDeskData(userId, name, avatar);
  isVisitingOther.value = true;
}

function handleViewOwnerProfile() {
  if (isVisitingOther.value) {
    openProfileByUserId(currentDesk.value.ownerId, currentDesk.value.ownerName, currentDesk.value.ownerAvatar);
  } else {
    openMyProfileSheet();
  }
}

function handleViewNoteAuthorProfile() {
  if (!inspectingNote.value) return;
  openProfileByUserId(inspectingNote.value.authorId, inspectingNote.value.authorName, inspectingNote.value.authorAvatar);
}

function handleViewSecretSenderProfile() {
  if (!activeSecretNote.value) return;
  openProfileByUserId(activeSecretNote.value.senderId, activeSecretNote.value.senderName, activeSecretNote.value.senderAvatar);
}

defineExpose({
  visitUserDesk
});
</script>

<style lang="scss" scoped>
/* ==================== 桌洞 v1 重设计 · 场景样式 ==================== */
/* 设计基准: desk-hole-prototype-v1.html · 木色由 themeVars 注入整屋换色 */
.desk-hole-container {
  width: 100%;
  height: 100%;
  height: 100dvh;
  --brass: #c9a227;
  --brass-hi: #e8c96a;
  --linen: #f3ead9;
  --paper: #efe7db;
  --ink: #4a3728;
  --ink-soft: #7a6a58;
  --wax: #a83232;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  /* 严格预留底部 TabBar（56px + 安全区）的高度 */
  padding-bottom: calc(58px + env(safe-area-inset-bottom, 0px));
  background: var(--wood-dark);
  color: #333;
}

.hand {
  font-family: "Kaiti SC", "STKaiti", "KaiTi", cursive;
}

/* ===== 顶栏 (v1 木色顶栏) ===== */
.desk-top-bar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  background: linear-gradient(180deg, var(--wood), var(--wood-dark));
  position: relative;
  z-index: 25;
  box-shadow: 0 2px 8px rgba(50, 30, 15, 0.35);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.045) 0 2px, transparent 2px 9px);
  }
}

.desk-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
  user-select: none;

  &:active { transform: scale(0.97); opacity: 0.88; }
}

.owner-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex: none;
  border: 2px solid var(--brass-hi);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.owner-meta { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
.owner-name-row { display: flex; align-items: center; gap: 6px; }

.owner-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desk-tag {
  flex: none;
  font-size: 9px;
  color: #6b4a12;
  background: linear-gradient(180deg, #ffe9a3, #f5d478);
  padding: 2px 7px;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: inset 0 -1px 0 rgba(120, 80, 10, 0.3);
}

.owner-sub { font-size: 10px; color: rgba(255, 246, 225, 0.72); }

.desk-actions-top { flex: none; display: flex; align-items: center; gap: 6px; }

.action-pill-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff8e8;
  border: 1px solid rgba(255, 255, 255, 0.22);
  cursor: pointer;
}

.pill-icon { font-size: 12px; }
.pill-text { font-size: 11px; }

.theme-btn {
  background: linear-gradient(180deg, #ffe9a3, #f0cd6d);
  border-color: transparent;
  color: #6b4a12;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
}

/* ===== 窗户区 (v1 压缩窗高) ===== */
.window-zone {
  flex: none;
  padding: 10px 12px 0;
  margin-bottom: -8px; /* 窗台出檐压住桌背缘，消除窗/桌断带 */
  position: relative;
  z-index: 10;
}

.window-frame {
  position: relative;
  height: clamp(240px, 37vh, 344px);
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(180deg, var(--wood-mid), var(--wood-dark));
  padding: 9px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.35), 0 6px 16px -6px rgba(70, 45, 20, 0.5);
}

.sky {
  position: relative;
  height: 100%;
  border-radius: 11px;
  overflow: hidden;
}

.weather-sunny .sky, .sky.weather-sunny { background: linear-gradient(180deg, #a9d7e8 0%, #c8e6d4 55%, #f6ecd2 100%); }
.weather-cloudy .sky, .sky.weather-cloudy { background: linear-gradient(180deg, #b8c9d4 0%, #d3dcd4 55%, #ece8d8 100%); }
.weather-rainy .sky, .sky.weather-rainy { background: linear-gradient(180deg, #7d94a8 0%, #93a6b2 55%, #b8c2c4 100%); }
.weather-night .sky, .sky.weather-night { background: linear-gradient(180deg, #26355c 0%, #3a4a74 60%, #5a5a80 100%); }

.sun-glow {
  position: absolute;
  top: 16px;
  right: 26px;
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff8d8 0%, #ffe9a0 45%, rgba(255, 233, 160, 0) 72%);
  animation: sun-breathe 4.5s ease-in-out infinite;
}

@keyframes sun-breathe {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.12); opacity: 1; }
}

.sun-flare-rays {
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle at top right, rgba(255, 245, 157, 0.3) 0%, transparent 70%);
  pointer-events: none;
}

.night-sky { position: absolute; inset: 0; }

.crescent-moon {
  position: absolute;
  top: 68%;
  left: 10%;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #fbf4dc, #e6d9b4 72%);
  box-shadow: 0 0 24px 8px rgba(244, 236, 208, 0.3);
}

.star {
  position: absolute;
  color: #fff9c4;
  font-size: 10px;
  opacity: 0.8;
  animation: star-blink 2s infinite ease-in-out alternate;
}

.star-1 { top: 78%; left: 24%; }
.star-2 { top: 78%; left: 40%; animation-delay: 0.8s; }
.star-3 { top: 78%; left: 86%; animation-delay: 1.4s; }

@keyframes star-blink {
  0% { opacity: 0.3; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.15); }
}

.rain-canvas { position: absolute; inset: 0; pointer-events: none; }

.rain-line {
  position: absolute;
  top: -20px;
  width: 1.5px;
  height: 22px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.7));
  animation: rain-fall 0.75s linear infinite;
}

@keyframes rain-fall {
  to { transform: translateY(340px); }
}

.soft-cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  filter: blur(2px);
}

.cloud-1 { top: 40px; left: -70px; width: 64px; height: 16px; animation: cloud-drift 34s linear infinite; }
.cloud-2 { top: 88px; left: -60px; width: 48px; height: 13px; opacity: 0.6; animation: cloud-drift 46s linear infinite 6s; }

@keyframes cloud-drift {
  from { transform: translateX(0); }
  to { transform: translateX(560px); }
}

.distant-landscape {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35px;
  background: linear-gradient(to top, rgba(104, 159, 56, 0.35), transparent);
}

.bird {
  position: absolute;
  width: 16px;
  height: 8px;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 0;
    width: 9px;
    height: 7px;
    border-top: 2px solid rgba(80, 100, 120, 0.55);
    border-radius: 60% 60% 0 0;
  }
  &::before { left: 0; transform: rotate(-14deg); }
  &::after { left: 7px; transform: rotate(14deg); }
}

.bird-1 { top: 56px; left: 110px; animation: bird-fly 22s linear infinite; }
.bird-2 { top: 80px; left: 160px; transform: scale(0.75); animation: bird-fly 26s linear infinite 4s; }

.weather-rainy .bird, .weather-night .bird { display: none; }

@keyframes bird-fly {
  from { margin-left: 0; }
  to { margin-left: 240px; }
}

/* 折纸飞机飞行动画 (保留) */
.paper-airplane-anim {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: airplane-soar 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

.airplane-body { font-size: 38px; }

.airplane-trail {
  font-size: 11px;
  color: #fff;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 4px;
}

@keyframes airplane-soar {
  0% { transform: translate(-50%, 40px) scale(0.5); opacity: 0; }
  50% { transform: translate(-50%, -60px) scale(1.2); opacity: 1; }
  100% { transform: translate(-20%, -140px) scale(0.8); opacity: 0; }
}

/* 纱帘 */
.sheer-curtain {
  position: absolute;
  top: 0;
  bottom: 52px;
  width: 40px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.12));
  z-index: 6;
  pointer-events: none;
}

.curtain-left {
  left: 0;
  border-radius: 0 40% 60% 0 / 0 30% 30% 0;
  animation: curtain-sway 6s ease-in-out infinite alternate;
}

.curtain-right {
  right: 0;
  background: linear-gradient(270deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.12));
  border-radius: 40% 0 0 60% / 30% 0 0 30%;
  animation: curtain-sway 7s ease-in-out infinite alternate-reverse;
}

@keyframes curtain-sway {
  from { transform: skewY(0deg); }
  to { transform: skewY(1.2deg); }
}

/* 窗棂 */
.window-wood-frame { position: absolute; inset: 0; z-index: 2; pointer-events: none; }

.crossbar-h, .crossbar-v {
  position: absolute;
  background: linear-gradient(180deg, var(--wood-mid), var(--wood-dark));
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.25) inset, 0 2px 4px rgba(40, 25, 10, 0.3);
}

.crossbar-h { left: 0; right: 0; top: 54%; height: 9px; }
.crossbar-v { top: 0; bottom: 0; left: 50%; width: 9px; margin-left: -4.5px; }

/* ===== 便签墙：slot 错落散贴 (v1) ===== */
.window-notes-stream {
  position: absolute;
  inset: 8px 10px 56px 10px;
  z-index: 4;
}

.washi-sticky-note {
  position: absolute;
  border-radius: 4px;
  padding: 8px 9px 7px;
  box-shadow: 0 5px 12px rgba(80, 55, 25, 0.28), 0 1px 0 rgba(255, 255, 255, 0.6) inset;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  box-sizing: border-box;

  &:active { transform: scale(0.96); }
}

.note-peeling {
  transform: rotate(-10deg) scale(1.15) !important;
  box-shadow: 6px 12px 20px rgba(0, 0, 0, 0.35) !important;
  z-index: 9;
}

.my-note { box-shadow: 0 5px 12px rgba(80, 55, 25, 0.28), 0 0 0 1.5px var(--brass-hi); }

.washi-tape-strip {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(-3deg);
  width: 44px;
  height: 13px;
  background: rgba(255, 255, 255, 0.62);
  box-shadow: 0 1px 2px rgba(90, 60, 30, 0.18);
  border-left: 1px dashed rgba(0, 0, 0, 0.15);
  border-right: 1px dashed rgba(0, 0, 0, 0.15);
}

.paper-yellow { background: #fff6c2; color: #4d3d2c; }
.paper-pink   { background: #fde4ee; color: #4d3d2c; }
.paper-blue   { background: #e2f0fa; color: #4d3d2c; }
.paper-green  { background: #e6f4e4; color: #4d3d2c; }
.paper-kraft  { background: #f5ece1; color: #4d3d2c; }

.note-author-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  margin-top: 3px;
  font-weight: 700;
}

.note-author-txt {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #5b4632;
}

.note-heart { flex: none; font-size: 9px; color: #c25555; font-weight: 600; }

.handwritten-note-img {
  width: 100%;
  height: 44px;
  margin-top: 4px;
  border-radius: 3px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.45);
}

.note-body-txt {
  font-size: 10.5px;
  line-height: 1.45;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* "+" 贴便签入口 (D1) */
.note-plus {
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 52px;
  background: rgba(255, 255, 255, 0.5);
  border: 1.5px dashed rgba(90, 60, 30, 0.4);
  box-shadow: 0 3px 8px rgba(80, 55, 25, 0.18);

  .washi-tape-strip { display: none; }
}

.plus-ic { font-size: 18px; color: #6b4a12; line-height: 1; }
.plus-tx { font-size: 10px; color: #6b4a12; font-weight: 600; }

/* 换批 chip (D2) */
.batch-chip {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 8;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  padding: 3px 8px;
  box-shadow: 0 2px 5px rgba(80, 55, 25, 0.25);
  cursor: pointer;
}

.batch-tx { font-size: 9px; font-weight: 700; color: #6b4a12; }

/* ===== 窗台木搁板 (v1) ===== */
.window-shelf {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 52px;
  background: linear-gradient(180deg, var(--wood-light) 0%, var(--wood) 30%, var(--wood-dark) 100%);
  box-shadow: 0 -3px 8px rgba(60, 35, 15, 0.3), inset 0 2px 0 rgba(255, 235, 200, 0.35);
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding: 0 14px 5px;
  z-index: 5;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(180deg, var(--wood-light), var(--wood));
    border-radius: 3px 3px 0 0;
  }
}

.shelf-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  position: relative;
}

.item-emoji {
  font-size: 24px;
  line-height: 1;
  filter: drop-shadow(0 3px 3px rgba(40, 20, 5, 0.4));
}

.shelf-label { font-size: 8.5px; color: rgba(255, 240, 215, 0.85); }

.books {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5px;
  filter: drop-shadow(0 3px 3px rgba(40, 20, 5, 0.4));
}

.bk { display: block; border-radius: 1.5px; }
.bk.b1 { width: 34px; height: 6px; background: #b8574f; }
.bk.b2 { width: 30px; height: 6px; background: #4f7d9e; margin-left: -3px; }
.bk.b3 { width: 36px; height: 6px; background: #7d9457; margin-left: 2px; }

.coffee-steaming { position: relative; display: flex; align-items: center; }
.coffee-cup { font-size: 24px; line-height: 1; filter: drop-shadow(0 3px 3px rgba(40, 20, 5, 0.4)); }

.steam {
  position: absolute;
  top: -10px;
  width: 2.5px;
  height: 11px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.8);
  animation: steam-rise 2.4s ease-in-out infinite;
}

.steam-1 { left: 8px; }
.steam-2 { left: 15px; animation-delay: 1.1s; }

@keyframes steam-rise {
  0% { transform: translateY(3px); opacity: 0; }
  35% { opacity: 0.9; }
  100% { transform: translateY(-8px); opacity: 0; }
}

/* ===== 桌面区 (v1 第一人称摆置) ===== */
.desk-zone {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 210px;
}

.desk-top {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, var(--wood-light) 0%, var(--wood) 40%, var(--wood-mid) 100%);
  box-shadow: inset 0 6px 14px rgba(60, 35, 15, 0.35);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(90deg, rgba(70, 40, 15, 0.08) 0 3px, transparent 3px 26px);
    pointer-events: none;
  }
}

.desk-sunlight-beam {
  position: absolute;
  top: -30px;
  left: 16%;
  width: 46%;
  height: 150%;
  background: linear-gradient(105deg, rgba(255, 244, 200, 0.34), rgba(255, 244, 200, 0) 70%);
  transform: rotate(14deg);
  pointer-events: none;
  filter: blur(4px);
  z-index: 2;
}

.linen-mat {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 10px;
  bottom: 6px;
  border-radius: 10px;
  background:
    radial-gradient(circle at 82% 16%, transparent 26px, rgba(150, 110, 60, 0.10) 27px 30px, transparent 31px),
    radial-gradient(circle at 12% 80%, rgba(90, 60, 120, 0.08) 0 6px, transparent 7px),
    repeating-linear-gradient(45deg, rgba(150, 120, 80, 0.06) 0 2px, transparent 2px 6px),
    repeating-linear-gradient(-45deg, rgba(150, 120, 80, 0.05) 0 2px, transparent 2px 6px),
    var(--linen);
  box-shadow: 0 3px 10px rgba(70, 45, 20, 0.3), inset 0 0 0 1px rgba(150, 120, 80, 0.18);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 12px;
  gap: 6px;
  z-index: 3;
}

.obj {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  position: relative;
}

.obj-cap {
  font-size: 9px;
  color: var(--ink-soft);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.obj-journal, .obj-caddy {
  cursor: pointer;
  transition: transform 0.15s;
  &:active { transform: scale(0.96); }
}

/* 回忆录皮面本 (v1 比例) */
.vintage-journal-book {
  width: 128px;
  height: 96px;
  border-radius: 5px 8px 8px 5px;
  position: relative;
  background: linear-gradient(135deg, #5a3a24, #472c19);
  box-shadow: 0 6px 12px rgba(50, 28, 10, 0.45), inset 0 1px 0 rgba(255, 220, 170, 0.25);
  cursor: pointer;
  transition: transform 0.15s;
  overflow: hidden;

  &:active { transform: scale(0.97); }
}

.journal-spine-leather {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 11px;
  background: linear-gradient(90deg, #3a2312, #5a3a24);
  border-radius: 5px 0 0 5px;
}

.journal-stitch-line {
  position: absolute;
  left: 15px;
  top: 7px;
  bottom: 7px;
  width: 1px;
  border-left: 1.5px dashed rgba(230, 200, 150, 0.5);
}

.deckled-pages-edge {
  position: absolute;
  right: 0;
  top: 5px;
  bottom: 5px;
  width: 5px;
  background: repeating-linear-gradient(180deg, #f2e8d5 0 2px, #d9cbb2 2px 3px);
  border-radius: 0 2px 2px 0;
}

.journal-ribbon {
  position: absolute;
  top: 0;
  right: 16px;
  width: 7px;
  height: 26px;
  background: #b8433c;
  border-radius: 0 0 3px 3px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3);
}

.journal-cover-title {
  position: absolute;
  left: 24px;
  top: 24px;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.journal-txt {
  font-size: 14px;
  font-weight: 700;
  color: #e8d3ac;
  letter-spacing: 1px;
}

.journal-meta { font-size: 9px; color: rgba(232, 211, 172, 0.75); margin-top: 4px; }

/* 桌面小物 */
.middles { display: flex; align-items: flex-end; gap: 8px; padding-bottom: 2px; }

.ink {
  width: 26px;
  height: 30px;
  border-radius: 6px 6px 8px 8px;
  background: linear-gradient(180deg, rgba(90, 60, 120, 0.25), #4a3560 40%);
  position: relative;
  box-shadow: 0 4px 8px rgba(50, 28, 10, 0.4), inset 0 2px 3px rgba(255, 255, 255, 0.35);

  &::before {
    content: ''; position: absolute; top: -7px; left: 8px; width: 14px; height: 8px;
    background: #2e2140; border-radius: 3px;
  }
  &::after {
    content: ''; position: absolute; top: 6px; left: 5px; width: 6px; height: 12px;
    background: rgba(255, 255, 255, 0.4); border-radius: 3px; transform: rotate(8deg);
  }
}

.tapes { display: flex; flex-direction: column; gap: 4px; }

.tape {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 3px 6px rgba(50, 28, 10, 0.35);

  &::after { content: ''; position: absolute; inset: 8px; border-radius: 50%; background: var(--linen); }
  /* 多端安全: repeating-linear 替代原型 repeating-conic */
  &.t1 { background: repeating-linear-gradient(45deg, #e8a7b8 0 4px, #f6d3dc 4px 8px); }
  &.t2 { background: repeating-linear-gradient(45deg, #9db87a 0 4px, #cfe0b8 4px 8px); margin-left: 6px; }
}

.pencil {
  width: 56px;
  height: 7px;
  border-radius: 2px;
  background: linear-gradient(90deg, #e8b64c 0 78%, #d9a06a 78% 88%, #3a3a3a 88%);
  transform: rotate(-9deg);
  box-shadow: 0 3px 5px rgba(50, 28, 10, 0.35);
}

/* 笔筒 (v1 木 pot + 插三笔) */
.caddy { width: 84px; height: 96px; position: relative; }

.pens { position: absolute; left: 12px; top: -24px; display: flex; gap: 6px; }

.pen {
  width: 6px;
  height: 44px;
  border-radius: 3px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.25);
  &.p1 { background: linear-gradient(180deg, #3a3a3a 0 30%, #c96f4a 30%); transform: rotate(-8deg); }
  &.p2 { background: linear-gradient(180deg, #e8d3ac 0 22%, #7a5236 22%); height: 50px; }
  &.p3 { background: linear-gradient(180deg, #b8433c 0 26%, #e8b64c 26%); transform: rotate(7deg); height: 40px; }
}

.pot {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 66px;
  border-radius: 8px 8px 12px 12px;
  background: linear-gradient(180deg, var(--wood-light), var(--wood) 60%, var(--wood-dark));
  box-shadow: 0 6px 12px rgba(50, 28, 10, 0.45), inset 0 3px 0 rgba(255, 235, 200, 0.3);

  &::before {
    content: ''; position: absolute; top: -6px; left: -3px; right: -3px; height: 11px;
    border-radius: 6px;
    background: linear-gradient(180deg, var(--wood-light), var(--wood-mid));
    box-shadow: 0 2px 4px rgba(50, 28, 10, 0.4);
  }
}

.pot-lb {
  position: absolute; left: 0; right: 0; top: 24px; text-align: center;
  color: #f2e2c4; font-size: 11px; font-weight: 700; letter-spacing: 1px;
}

.pot-lb2 {
  position: absolute; left: 0; right: 0; top: 41px; text-align: center;
  color: rgba(242, 226, 196, 0.7); font-size: 8px;
}

/* ===== 桌前脸 + 内嵌抽屉 (v1) ===== */
.desk-front {
  flex: none;
  height: 96px;
  position: relative;
  background: linear-gradient(180deg, var(--wood-mid), var(--wood-dark));
  box-shadow: inset 0 4px 10px rgba(30, 15, 5, 0.45);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(90deg, rgba(30, 15, 5, 0.1) 0 3px, transparent 3px 30px);
    pointer-events: none;
  }
}

.drawer-face-panel {
  position: absolute;
  left: 5%;
  right: 5%;
  top: 12px;
  height: 72px;
  border-radius: 10px;
  background: linear-gradient(180deg, var(--wood-mid), var(--wood-dark));
  box-shadow: inset 0 2px 5px rgba(25, 12, 4, 0.55), inset 0 -1px 0 rgba(255, 220, 170, 0.2), 0 1px 0 rgba(255, 220, 170, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s;
  box-sizing: border-box;

  &:active { transform: scale(0.985); }
}

.brass-handle-box { display: flex; align-items: center; gap: 10px; position: relative; }

/* 拉手安装底板：让黄铜拉手有"装在抽屉上"的附着感 */
.brass-handle-box::before {
  content: '';
  position: absolute;
  left: -7px;
  top: -7px;
  width: 54px;
  height: 34px;
  border-radius: 7px;
  background: rgba(25, 12, 4, 0.28);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 220, 170, 0.18);
}

.brass-curved-pull {
  width: 40px;
  height: 20px;
  border-radius: 0 0 20px 20px;
  border: 4px solid var(--brass);
  border-top: none;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.45), inset 0 -2px 0 rgba(255, 255, 255, 0.3);
  position: relative;
  flex: none;

  &::before, &::after {
    content: '';
    position: absolute;
    top: -4px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #e8c96a, #8a6a1a);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  &::before { left: -5px; }
  &::after { right: -5px; }
}

.brass-label-plate { display: flex; align-items: center; gap: 7px; }

.drawer-plate-text {
  font-size: 12px;
  font-weight: 700;
  color: #f2e2c4;
  letter-spacing: 0.5px;
}

/* 火漆封信数徽章 (v1) */
.drawer-count-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  flex: none;
  background: radial-gradient(circle at 35% 30%, #c9524a, #8e2723 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffe9d8;
  font-size: 9px;
  font-weight: 700;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.45), inset 0 -2px 4px rgba(0, 0, 0, 0.35), inset 0 2px 3px rgba(255, 255, 255, 0.25);
  transform: rotate(-8deg);
}

.drawer-right-box { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }

.secret-pill {
  background: rgba(255, 233, 163, 0.16);
  border: 1px solid rgba(255, 233, 163, 0.5);
  border-radius: 11px;
  padding: 3px 9px;
  cursor: pointer;
}

.secret-tx { font-size: 10px; font-weight: 700; color: #ffe9a3; }

.drawer-action-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 11px;
  border-radius: 13px;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
}

.drawer-action-pill.open-pill {
  background: linear-gradient(180deg, #ffe9a3, #f0cd6d);
  color: #6b4a12;
}

.action-pill-icon { font-size: 12px; }
.action-pill-text { font-size: 11px; }

/* ===== 抽屉展开 overlay (D3) ===== */
.drawer-open-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 10, 5, 0.45);
  z-index: 40;
  display: flex;
  align-items: flex-end;
  /* 面板整体抬到底部 TabBar 之上，避免信封列表被导航裁切 */
  padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  animation: overlay-fade 0.2s ease-out;
}

@keyframes overlay-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.drawer-open-panel {
  width: 100%;
  max-height: 52vh;
  border-radius: 16px 16px 0 0;
  padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  animation: drawer-slide-up 0.28s cubic-bezier(0.25, 1, 0.5, 1);
}

@keyframes drawer-slide-up {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.drawer-inner-compartment {
  background: #2b1117; /* 暗红色复古丝绒内衬 */
  box-shadow: inset 0 6px 16px rgba(0, 0, 0, 0.75), 0 -6px 20px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 213, 79, 0.2);
}

.compartment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.15);
}

.comp-title-box { display: flex; align-items: center; gap: 6px; }
.comp-icon { font-size: 13px; }
.comp-title { font-size: 12px; color: #ffe082; font-weight: 700; letter-spacing: 0.3px; }

.comp-badge {
  font-size: 9px;
  background: rgba(255, 213, 79, 0.2);
  color: #ffe082;
  padding: 1px 6px;
  border-radius: 8px;
  border: 0.5px solid rgba(255, 213, 79, 0.4);
}

.comp-close-pill {
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(255, 213, 79, 0.15);
  border: 0.5px solid rgba(255, 213, 79, 0.4);
  color: #ffe082;
  cursor: pointer;
  transition: all 0.2s;

  &:active { transform: scale(0.95); background: rgba(255, 213, 79, 0.3); }
}

.close-pill-text { font-size: 11px; font-weight: 700; }

.drawer-letters-scroll { max-height: 32vh; margin-top: 8px; }

.drawer-empty-state {
  padding: 16px;
  text-align: center;
  color: #bcaaa4;
  font-size: 11px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.empty-icon { font-size: 22px; }

.drawer-letter-envelope {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #5d4037;
  border-radius: 6px;
  padding: 6px 8px;
  margin-bottom: 6px;
  border: 0.5px solid #795548;
  cursor: pointer;
}

.envelope-stamp-box { position: relative; }
.letter-avatar { width: 28px; height: 28px; border-radius: 50%; }

.real-wax-seal {
  position: absolute;
  bottom: -3px;
  right: -3px;
  background: #c62828;
  color: #fff;
  font-size: 8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.envelope-body { flex: 1; min-width: 0; }
.env-top { display: flex; justify-content: space-between; }
.env-sender { font-size: 11px; font-weight: 700; color: #fff; }
.env-time { font-size: 9px; color: #d7ccc8; }

.env-preview {
  font-size: 10px;
  color: #ffcc80;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 2px;
}

.env-open-arrow { color: #ffb74d; font-size: 14px; }/* ==================== 📖 全窗口手账阅读器 (Full-Window Diary) ==================== */
.diary-full-page {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
  z-index: 150;
  background: #f7f4ed;
  background-image: radial-gradient(#dfd7c8 0.8px, transparent 0.8px);
  background-size: 18px 18px;
  display: flex;
  flex-direction: column;
  animation: diary-slide-in 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes diary-slide-in {
  from {
    transform: translateY(100%);
    opacity: 0.8;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.diary-full-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(254, 252, 248, 0.96);
  backdrop-filter: blur(12px);
  border-bottom: 1.5px dashed rgba(62, 39, 35, 0.15);
  box-shadow: 0 4px 16px rgba(62, 39, 35, 0.05);
  z-index: 10;
  flex-shrink: 0;
}

.diary-nav-back {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 18px;
  background: rgba(62, 39, 35, 0.06);
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.95);
    background: rgba(62, 39, 35, 0.12);
  }

  .back-arrow {
    font-size: 18px;
    font-weight: 700;
    color: #4e342e;
    line-height: 1;
  }
  .back-text {
    font-size: 13px;
    font-weight: 600;
    color: #4e342e;
  }
}

.diary-nav-title-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.diary-nav-title {
  font-size: 15px;
  font-weight: 700;
  color: #3e2723;
  letter-spacing: 0.5px;
}

.diary-nav-sub {
  font-size: 11px;
  color: #8d6e63;
  margin-top: 1px;
}

.diary-nav-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(62, 39, 35, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:active {
    transform: scale(0.92);
    background: rgba(62, 39, 35, 0.12);
  }

  .close-icon {
    font-size: 14px;
    color: #5d4037;
    font-weight: 600;
  }
}

.diary-full-scroll {
  flex: 1;
  height: 0;
  width: 100%;
}

.diary-scroll-content {
  padding: 18px 16px;
  max-width: 620px;
  margin: 0 auto;
  box-sizing: border-box;
}

.diary-intro-card {
  position: relative;
  background: #fffdf9;
  border: 1px solid #ebd9c5;
  border-radius: 14px;
  padding: 20px 18px 14px;
  margin-bottom: 22px;
  box-shadow: 0 4px 16px rgba(93, 64, 55, 0.06);

  .washi-tape-strip {
    position: absolute;
    top: -9px;
    left: 50%;
    transform: translateX(-50%);
    width: 90px;
    height: 18px;
    background: rgba(224, 185, 140, 0.55);
    border: 1px dashed rgba(141, 110, 99, 0.4);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border-radius: 2px;
  }

  .intro-quote {
    position: relative;
    padding: 0 8px;

    .quote-mark {
      font-size: 20px;
      font-family: serif;
      color: #bcaaa4;
      line-height: 1;
      vertical-align: middle;
      &.right-mark { margin-left: 4px; }
    }

    .quote-text {
      font-size: 13px;
      line-height: 1.7;
      color: #5d4037;
      font-style: italic;
    }
  }

  .intro-author-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px dashed #efebe9;

    .intro-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1px solid #ffd54f;
    }

    .intro-author-name {
      font-size: 11px;
      font-weight: 600;
      color: #8d6e63;
    }
  }
}

.diary-entries-flow {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.diary-entry-fullcard {
  position: relative;
  border-radius: 14px;
  padding: 18px 18px 14px;
  box-shadow: 0 4px 18px rgba(62, 39, 35, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: transform 0.15s ease;

  &.paper-yellow { background: #fffbe6; border-color: #ffe58f; }
  &.paper-pink   { background: #fff0f6; border-color: #ffadd2; }
  &.paper-green  { background: #f6ffed; border-color: #b7eb8f; }
  &.paper-blue   { background: #e6f7ff; border-color: #91d5ff; }
  &.paper-white  { background: #ffffff; border-color: #d9d9d9; }
  &.paper-kraft  { background: #f5ece1; border-color: #d7ccc8; }

  .entry-tape-accent {
    position: absolute;
    top: -7px;
    right: 28px;
    width: 60px;
    height: 14px;
    background: rgba(255, 255, 255, 0.65);
    border: 0.5px dashed rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }

  .entry-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #795548;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 0.5px dashed rgba(121, 85, 72, 0.2);

    .entry-date {
      font-weight: 700;
      color: #5d4037;
    }
    .entry-loc {
      font-size: 11px;
      opacity: 0.85;
    }
  }

  .entry-title {
    font-size: 16px;
    font-weight: 700;
    color: #3e2723;
    margin-bottom: 8px;
    display: block;
    line-height: 1.4;
  }

  .entry-body {
    font-size: 13.5px;
    line-height: 1.7;
    color: #4e342e;
    display: block;
    letter-spacing: 0.3px;
  }

  .entry-footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 14px;
    padding-top: 8px;

    .entry-tag {
      font-size: 11px;
      font-weight: 600;
      color: #6d4c41;
      background: rgba(62, 39, 35, 0.06);
      padding: 3px 8px;
      border-radius: 6px;
    }

    .entry-stamp {
      border: 1px solid #d32f2f;
      color: #d32f2f;
      padding: 2px 7px;
      border-radius: 4px;
      transform: rotate(-4deg);
      opacity: 0.75;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1px;
    }
  }
}

.diary-bottom-sign {
  margin-top: 28px;
  padding-bottom: calc(50px + env(safe-area-inset-bottom, 20px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  .sign-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 80%;

    .line {
      flex: 1;
      height: 1px;
      background: rgba(62, 39, 35, 0.15);
    }
    .sign-star {
      color: #a1887f;
      font-size: 12px;
    }
  }

  .sign-text {
    font-size: 12px;
    font-weight: 700;
    color: #8d6e63;
    letter-spacing: 1px;
  }

  .sign-sub {
    font-size: 11px;
    color: #bcaaa4;
  }
}

.theme-selector-pop {
  position: absolute;
  top: 65px;
  right: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  z-index: 50;
  width: 170px;
}

.theme-pop-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.theme-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  background: #f7f7f7;
}

.chip-active {
  background: #fff3e0;
  color: #e65100;
  font-weight: 700;
}

/* 🔍 便签放大展开检视弹窗 */
.note-inspect-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: inspect-fade-in 0.2s ease-out;
}

@keyframes inspect-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.note-inspect-modal {
  width: 100%;
  max-width: 340px;
  border-radius: 8px;
  padding: 20px 16px 16px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
  position: relative;
  display: flex;
  flex-direction: column;
  animation: inspect-scale-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes inspect-scale-up {
  from { transform: scale(0.85); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.inspect-washi-tape {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 16px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border-left: 1.5px dashed rgba(0, 0, 0, 0.25);
  border-right: 1.5px dashed rgba(0, 0, 0, 0.25);
}

.inspect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 0.5px dashed rgba(0, 0, 0, 0.15);
}

.inspect-author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.8;
  }
}

.inspect-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.inspect-meta {
  display: flex;
  flex-direction: column;
}

.inspect-author-name {
  font-size: 13px;
  font-weight: 700;
  color: #3e2723;
}

.inspect-time {
  font-size: 10px;
  color: #8d6e63;
  margin-top: 1px;
}

.inspect-close-btn {
  font-size: 16px;
  color: #8d6e63;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.06);
  cursor: pointer;
}

.inspect-body {
  margin: 14px 0;
  min-height: 120px;
  max-height: 55vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.inspect-handwriting-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  padding: 8px;
  box-sizing: border-box;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
}

.inspect-full-hw-img {
  width: 100%;
  max-height: 48vh;
  object-fit: contain;
}

.inspect-text-wrapper {
  padding: 6px 4px;
}

.inspect-full-text {
  font-size: 14px;
  line-height: 1.7;
  color: #3e2723;
  word-break: break-all;
  white-space: pre-wrap;
}

.inspect-footer {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 10px;
  border-top: 0.5px dashed rgba(0, 0, 0, 0.15);
  gap: 8px;
}

.inspect-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 0;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  border: 0.5px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.95);
  }

  .action-icon {
    font-size: 14px;
  }

  .action-label {
    font-size: 12px;
    font-weight: 600;
    color: #4e342e;
  }

  &.like-btn .action-label {
    color: #c62828;
  }

  &.delete-btn .action-label {
    color: #d32f2f;
  }
}

/* 💌 桌洞私密信笺阅读弹窗 */
.secret-letter-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: letter-fade-in 0.2s ease-out;
}

@keyframes letter-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.secret-letter-card {
  width: 100%;
  max-width: 350px;
  background: linear-gradient(135deg, #fffcf5 0%, #fdf8eb 100%);
  border-radius: 12px;
  padding: 20px 18px 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(215, 204, 196, 0.7);
  position: relative;
  display: flex;
  flex-direction: column;
  animation: letter-pop-up 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes letter-pop-up {
  from { transform: translateY(20px) scale(0.9); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.letter-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px dashed #d7ccc8;
}

.letter-sender-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:active {
    opacity: 0.8;
  }
}

.letter-modal-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid #ffb300;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.letter-sender-meta {
  display: flex;
  flex-direction: column;
}

.letter-sender-name {
  font-size: 14px;
  font-weight: 700;
  color: #3e2723;
}

.letter-send-time {
  font-size: 10px;
  color: #8d6e63;
  margin-top: 2px;
}

.letter-seal-tag {
  display: flex;
  align-items: center;
  gap: 2px;
  background: #fbe9e7;
  border: 1px solid #ffab91;
  color: #d84315;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.letter-close-btn {
  font-size: 18px;
  color: #8d6e63;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.letter-sheet-body {
  margin: 16px 0;
  min-height: 100px;
  max-height: 50vh;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 12px;
  border: 0.5px solid rgba(215, 204, 196, 0.5);
}

.letter-text {
  font-size: 13.5px;
  line-height: 1.7;
  color: #3e2723;
  white-space: pre-wrap;
  word-break: break-all;
}

.letter-actions-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px dashed #d7ccc8;
}

.letter-reply-btn {
  flex: 1.4;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  border-radius: 20px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.35);
  cursor: pointer;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.96);
  }

  .reply-icon {
    font-size: 14px;
  }
  .reply-text {
    font-size: 12px;
    font-weight: 700;
  }
}

.letter-fold-btn {
  flex: 0.9;
  background: rgba(239, 235, 233, 0.8);
  border: 1px solid #d7ccc8;
  color: #5d4037;
  border-radius: 20px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  .fold-text {
    font-size: 12px;
    font-weight: 600;
  }
}
</style>
