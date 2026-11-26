<template>
  <view v-if="chatSheetVisible" class="chat-fullscreen-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="chat-sheet">
      <!-- 1. 暖心慢纸条顶栏: 返回键 + 昵称/距离 + 桌洞直达 -->
      <view class="chat-header">
        <view class="chat-back-btn" @tap="closeChatSheet(true)">
          <text class="back-arrow">‹</text>
          <text class="back-label">返回</text>
        </view>

        <view class="chat-header-center" @tap="openUserProfileCard(currentChatFriend, undefined)">
          <text class="chat-header-name">{{ currentChatFriend?.name }}</text>
          <view class="header-sub-row">
            <text class="relation-sub-pill">
              {{ currentRelTitle.icon }} {{ currentRelTitle.title }}
              <text v-if="!currentChatFriend?.isGroup"> · 相伴 {{ currentRelTitle.days }} 天</text>
            </text>
          </view>
        </view>

        <!-- 进TA桌洞入口 (私聊时展示) -->
        <view v-if="!currentChatFriend?.isGroup" class="chat-desk-btn" @tap="goToFriendDesk">
          <text class="desk-icon">🪟</text>
          <text class="desk-btn-text">进TA桌洞</text>
        </view>
        <view v-else class="chat-desk-btn group-info-pill">
          <text class="desk-btn-text">👥 {{ currentChatFriend?.members?.length || 3 }}人</text>
        </view>
      </view>

      <!-- 2. 纸飞机飞行航迹雷达 (有飞向TA的纸条时显示) -->
      <view v-if="flyingNoteInfo" class="flight-radar-banner">
        <view class="radar-top-row">
          <view class="radar-left">
            <text class="airplane-spin">🕊️</text>
            <text class="radar-text">{{ flyingNoteInfo.desc }}</text>
          </view>
          <view class="slow-flight-pill">
            <text class="flight-pill-txt">飞行进度 {{ flyingNoteInfo.progress }}%</text>
          </view>
        </view>
        <view class="radar-progress-track">
          <view class="track-fill" :style="{ width: flyingNoteInfo.progress + '%' }" />
        </view>
      </view>

      <!-- 3. 纸条消息流 -->
      <scroll-view scroll-y class="chat-messages-box" :scroll-top="chatScrollTop">
        <view class="chat-scroll-inner">
          <!-- 极简温情氛围小纸条引导 -->
          <view class="chat-security-tip">
            <text>💌 淡黄手账纸笺 · 日常文字速发 · 心事揉成纸团全屏展开</text>
          </view>

          <!-- 消息纸条列表 -->
          <view
            v-for="msg in currentChatMessages"
            :key="msg.id"
            class="chat-bubble-row"
            :class="msg.senderId === myProfile.id ? 'row-self' : 'row-other'"
          >
            <image
              class="msg-avatar"
              :src="msg.senderId === myProfile.id ? myProfile.avatar : (msg.senderAvatar || currentChatFriend?.avatar)"
              mode="aspectFill"
              @tap="openUserProfileCard(msg.senderId === myProfile.id ? myProfile : currentChatFriend, undefined)"
            />

            <!-- 形态 A：纸团消息（点击触发全屏展开动画才能阅读） -->
            <view
              v-if="msg.noteMode === 'crumpled'"
              class="crumpled-ball-bubble"
              :class="{ 'ball-opened': msg.isOpened }"
              @tap="openCrumpledBall(msg)"
            >
              <view class="paper-ball-sphere">
                <view class="ball-crease c1" />
                <view class="ball-crease c2" />
                <view class="ball-crease c3" />
                <text class="ball-emoji">{{ msg.isSealed ? '🔏' : '📄' }}</text>
              </view>
              <view class="ball-meta-col">
                <text class="ball-title">
                  {{ msg.isOpened ? '已展开的纸团' : '揉成团的小纸条' }}
                </text>
                <text class="ball-hint">👆 点击全屏展平查看{{ msg.crumpledImage ? '字画' : '正文' }}</text>
                <view class="ball-foot-row">
                  <text class="msg-timestamp">{{ formatTime(msg.createdAt) }}</text>
                  <text class="trash-mini-btn" @tap.stop="tossToTrash(msg)">🗑️</text>
                </view>
              </view>
            </view>

            <!-- 形态 B：淡黄纸质文字速发 / 图片素描纸条 -->
            <view
              v-else
              class="msg-paper-card paper-pale-yellow"
              :class="[
                'paper-skin-' + (msg.paperType || 'yellow'),
                { 'sealed-card': msg.isSealed, 'sketch-card': msg.sketchMode }
              ]"
            >
              <!-- 和纸胶带装饰 -->
              <view class="card-washi-tape" />

              <!-- 群聊他人昵称 -->
              <text v-if="currentChatFriend?.isGroup && msg.senderId !== myProfile.id && msg.senderName" class="group-sender-name">
                {{ msg.senderName }}
              </text>

              <!-- 未拆封火漆密封纸条 -->
              <view v-if="msg.isSealed && !msg.isOpened && msg.senderId !== myProfile.id" class="sealed-unopened-box" @tap="crackWaxSeal(msg)">
                <view class="wax-seal-big-stamp">
                  <text class="stamp-seal-icon">🔏</text>
                  <text class="stamp-seal-name">{{ msg.sealType || '古铜月相火漆' }}</text>
                </view>
                <text class="unopened-hint">💌 这是一封私密小纸条</text>
                <view class="crack-seal-btn">
                  <text>👆 点击戳破火漆 · 拆信阅读</text>
                </view>
              </view>

              <!-- 已拆开内容区 -->
              <view v-else class="msg-content-body">
                <view v-if="msg.isSealed" class="wax-seal-badge">
                  <text class="seal-icon">🔏 {{ msg.sealType || '火漆印封' }}</text>
                </view>

                <!-- 手写原迹或素描照片 -->
                <view v-if="msg.contentType === 'image' && msg.content" class="hw-img-wrap">
                  <image
                    class="msg-hw-img"
                    :class="{ 'css-sketch-fallback': msg.sketchMode && !msg.content.startsWith('data:image/') }"
                    :src="msg.content"
                    mode="widthFix"
                    @tap="previewImage(msg.content, [msg.content])"
                  />
                  <view class="img-tag-row">
                    <text class="hw-view-tip">{{ msg.sketchMode ? '✏️ 素描手绘风' : '🔍 点击查看大图' }}</text>
                  </view>
                </view>

                <!-- 文字正文 -->
                <text v-if="msg.contentType === 'text'" class="msg-text">{{ msg.content }}</text>

                <!-- 纸条卡片底部：时间戳、桌洞收藏、丢入纸篓 -->
                <view class="msg-card-footer">
                  <view class="footer-left">
                    <text class="transit-status status-delivered">📬 已送达</text>
                    <text class="msg-dot">·</text>
                    <text class="msg-timestamp">{{ formatTime(msg.createdAt) }}</text>
                  </view>

                  <view class="footer-right-ops">
                    <view class="footer-pin-btn" @tap.stop="pinNoteToDesk(msg)">
                      <text class="pin-icon">{{ msg.isPinnedToDesk ? '⭐️ 已珍藏' : '📌 存桌洞' }}</text>
                    </view>
                    <text class="trash-mini-btn" @tap.stop="tossToTrash(msg)">🗑️</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 4. 纸条书写托盘 (彻底告别简陋单行框) -->
      <view class="stationery-tray-panel">
        <!-- 顶部拟物工具胶囊栏 -->
        <view class="stationery-tools-bar">
          <view class="tools-left-group">
            <!-- 揉纸团 (可写字+画画+素描图，对方点击全屏展开) -->
            <view class="tray-chip crumpled-chip" @tap="openCrumpledComposer">
              <text class="chip-icon">🏐</text>
              <text class="chip-text">揉纸团</text>
            </view>

            <!-- 照片 / 一键转素描 -->
            <view class="tray-chip" @tap="openPhotoSketchPicker">
              <text class="chip-icon">✏️</text>
              <text class="chip-text">素描照</text>
            </view>

            <!-- 火漆盖章开关 -->
            <view
              class="tray-chip"
              :class="{ 'chip-active-seal': isSealedMode }"
              @tap="openSealDrawer"
            >
              <text class="chip-icon">🔏</text>
              <text class="chip-text">{{ isSealedMode ? activeSealName : '火漆' }}</text>
            </view>

            <!-- 特权信纸选择 -->
            <view class="tray-chip" @tap="openPaperDrawer">
              <text class="chip-icon">📜</text>
              <text class="chip-text">{{ activePaperName }}</text>
            </view>
          </view>

          <!-- 70字数指示器 -->
          <view class="char-counter" :class="{ 'char-warning': newChatMessageText.length >= 70 }">
            <text>{{ newChatMessageText.length }}/70</text>
          </view>
        </view>

        <!-- 戳印选择小抽屉 (如果展开) -->
        <view v-if="showStickerPicker" class="stickers-tray-drawer">
          <view
            v-for="stk in stickerList"
            :key="stk"
            class="sticker-item"
            @tap="insertSticker(stk)"
          >
            <text>{{ stk }}</text>
          </view>
        </view>

        <!-- 便签书写纸台与寄出动作行 -->
        <view class="stationery-input-box" :class="'paper-bg-' + currentPaperColor">
          <textarea
            class="note-writing-textarea"
            v-model="newChatMessageText"
            placeholder="写下70字折纸小纸条，伴随微风折叠寄出..."
            placeholder-class="note-textarea-ph"
            maxlength="70"
            :auto-height="true"
          />

          <!-- 寄出纸飞机按钮 -->
          <button
            class="note-send-btn"
            :class="{ 'send-ready': !!newChatMessageText.trim() }"
            :disabled="!newChatMessageText.trim()"
            @tap="sendPaperNote"
          >
            <text class="send-plane-icon">🕊️</text>
            <text class="send-label">寄出</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 真实手写纸条画板 -->
    <HandwritingPad
      v-if="showHwPad"
      actionConfirmText="✈️ 折成纸条寄出"
      defaultPattern="lined"
      @confirm="onHwConfirmed"
      @close="showHwPad = false"
    />

    <!-- 拟物信笺抽屉 (彻底取代原生 ActionSheet，保持吉卜力手账风格统一) -->
    <view v-if="showPaperDrawer" class="custom-drawer-mask" @tap="showPaperDrawer = false">
      <view class="custom-drawer-card" @tap.stop>
        <view class="drawer-header-row">
          <view class="drawer-pill-bar" />
          <text class="drawer-main-title">📜 挑选本次寄信的特权信纸</text>
          <text class="drawer-sub-title">慢节奏触感信笺，为文字镀上温暖温度</text>
        </view>
        <view class="drawer-items-list">
          <view
            v-for="p in paperOptions"
            :key="p.name"
            class="paper-item-card"
            :class="['paper-skin-' + p.colorKey, { 'item-card-active': activePaperName === p.name }]"
            @tap="applyPaper(p)"
          >
            <view class="paper-swatch-box">
              <text class="swatch-emoji">{{ p.icon }}</text>
            </view>
            <view class="paper-text-col">
              <view class="p-title-row">
                <text class="p-name">{{ p.name }}</text>
                <text v-if="activePaperName === p.name" class="p-badge">当前使用</text>
              </view>
              <text class="p-desc">{{ p.desc }}</text>
            </view>
            <view class="p-select-indicator">
              <text class="indicator-icon">{{ activePaperName === p.name ? '✓' : '›' }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 拟物火漆印章盒抽屉 (彻底取代原生弹窗，保持吉卜力手账风格统一) -->
    <view v-if="showSealDrawer" class="custom-drawer-mask" @tap="showSealDrawer = false">
      <view class="custom-drawer-card" @tap.stop>
        <view class="drawer-header-row">
          <view class="drawer-pill-bar" />
          <text class="drawer-main-title">🔏 加盖专属火漆印章</text>
          <text class="drawer-sub-title">私密慢纸条 · 对方需亲手戳破火漆方可拆信</text>
        </view>
        <view class="drawer-items-list seal-list">
          <view
            v-for="s in sealOptions"
            :key="s.name"
            class="seal-item-card"
            :class="{ 'seal-card-active': isSealedMode && activeSealName === s.name }"
            @tap="applySeal(s)"
          >
            <view class="seal-wax-stamp" :style="{ background: s.bg, borderColor: s.border }">
              <text class="seal-stamp-ico">{{ s.icon }}</text>
            </view>
            <view class="seal-text-col">
              <view class="p-title-row">
                <text class="s-name">{{ s.name }}</text>
                <text v-if="isSealedMode && activeSealName === s.name" class="s-badge">已加盖</text>
              </view>
              <text class="s-desc">{{ s.desc }}</text>
            </view>
            <view class="p-select-indicator">
              <text class="indicator-icon">{{ isSealedMode && activeSealName === s.name ? '✓' : '›' }}</text>
            </view>
          </view>
        </view>
        <view v-if="isSealedMode" class="drawer-footer-action" @tap="removeSeal">
          <text class="cancel-seal-btn">✕ 撤下火漆印（改为普通纸条）</text>
        </view>
      </view>
    </view>

    <!-- 揉纸团创作抽屉（支持写字 + 手绘涂鸦/素描图，发出后为纸团） -->
    <view v-if="showCrumpledComposer" class="custom-drawer-mask" @tap="showCrumpledComposer = false">
      <view class="custom-drawer-card crumpled-composer-card" @tap.stop>
        <view class="drawer-header-row">
          <view class="drawer-pill-bar" />
          <text class="drawer-main-title">🏐 揉一个手账纸团</text>
          <text class="drawer-sub-title">既能写字也能涂鸦画画，对方需点击全屏展平才能查看</text>
        </view>

        <view class="crumpled-paper-editor">
          <textarea
            class="crumpled-textarea"
            v-model="crumpledDraftText"
            placeholder="在淡黄信纸上写下悄悄话..."
            maxlength="200"
          />
          <view v-if="crumpledDraftImage" class="crumpled-img-preview">
            <image class="draft-img" :src="crumpledDraftImage" mode="aspectFit" />
            <view class="draft-img-ops">
              <text class="draft-op-btn" @tap="toggleDraftSketch">{{ isDraftSketch ? '🎨 还原原图' : '✏️ 转为素描' }}</text>
              <text class="draft-op-btn del" @tap="clearDraftImage">✕ 清除</text>
            </view>
          </view>
          <view class="crumpled-attach-bar">
            <view class="attach-pill" @tap="showHwPad = true">✍️ 涂鸦/手写画板</view>
            <view class="attach-pill" @tap="pickImageForCrumpled">🖼️ 附照片(可转素描)</view>
          </view>
        </view>

        <view class="crumpled-send-row">
          <view class="crumpled-send-btn" @tap="sendCrumpledBall">🏐 揉成纸团扔出去</view>
        </view>
      </view>
    </view>

    <!-- 照片转素描预览抽屉（需求 12） -->
    <view v-if="showSketchDrawer" class="custom-drawer-mask" @tap="showSketchDrawer = false">
      <view class="custom-drawer-card" @tap.stop>
        <view class="drawer-header-row">
          <view class="drawer-pill-bar" />
          <text class="drawer-main-title">✏️ 照片转素描工坊</text>
          <text class="drawer-sub-title">本地离线实时转换，让照片融入淡黄手账纸感</text>
        </view>

        <view class="sketch-stage-box">
          <image
            v-if="sketchPreviewSrc"
            class="sketch-stage-img"
            :class="{ 'css-sketch-fallback': sketchToggleOn && sketchPreviewSrc === sketchOriginalSrc }"
            :src="sketchPreviewSrc"
            mode="aspectFit"
          />
          <view v-else class="sketch-empty-pick" @tap="choosePhotoForSketch">
            <text class="pick-ico">📷</text>
            <text class="pick-txt">选择相册照片或拍一张</text>
          </view>
        </view>

        <view class="sketch-tools-row">
          <view class="sketch-btn" @tap="choosePhotoForSketch">📷 换一张</view>
          <view class="sketch-btn" @tap="useSamplePhotoForSketch">🌿 样例图</view>
          <view
            v-if="sketchOriginalSrc"
            class="sketch-btn"
            :class="{ active: sketchToggleOn }"
            @tap="toggleSketchConvert"
          >
            {{ sketchConverting ? '转换中...' : sketchToggleOn ? '✏️ 素描态 (点此看原图)' : '🎨 原图态 (一键转素描)' }}
          </view>
        </view>

        <view v-if="sketchPreviewSrc" class="sketch-send-actions">
          <view class="send-opt-btn secondary" @tap="sendSketchAsFastImage">📬 直接发送图片</view>
          <view class="send-opt-btn primary" @tap="sendSketchAsCrumpledBall">🏐 揉成纸团寄出</view>
        </view>
      </view>
    </view>

    <!-- 纸团全屏展平动画弹窗（需求 8 核心亮点） -->
    <view v-if="unfoldingMsg" class="crumpled-fullscreen-mask" @tap="closeUnfoldingModal">
      <view
        class="unfolded-paper-stage"
        :class="{ 'is-unfolded': isPaperUnfolded }"
        @tap.stop
      >
        <view class="unfold-washi-top" />
        <view class="unfold-header">
          <text class="unfold-from">💌 来自 {{ unfoldingMsg.senderId === myProfile.id ? '我' : (unfoldingMsg.senderName || currentChatFriend?.name) }} 的纸团</text>
          <view class="unfold-close-btn" @tap="closeUnfoldingModal">✕ 收起</view>
        </view>

        <scroll-view scroll-y class="unfold-content-scroll">
          <text v-if="unfoldingMsg.crumpledText" class="unfold-text-body">{{ unfoldingMsg.crumpledText }}</text>
          <image
            v-if="unfoldingMsg.crumpledImage"
            class="unfold-art-img"
            :class="{ 'css-sketch-fallback': unfoldingMsg.sketchMode && !unfoldingMsg.crumpledImage.startsWith('data:image/') }"
            :src="unfoldingMsg.crumpledImage"
            mode="widthFix"
          />
          <text v-if="!unfoldingMsg.crumpledText && !unfoldingMsg.crumpledImage" class="unfold-text-body">
            {{ unfoldingMsg.content }}
          </text>
        </scroll-view>

        <view class="unfold-footer">
          <text class="unfold-time">{{ formatTime(unfoldingMsg.createdAt) }}</text>
          <view class="unfold-pin-btn" @tap="pinNoteToDesk(unfoldingMsg)">
            {{ unfoldingMsg.isPinnedToDesk ? '⭐️ 已珍藏入桌洞' : '📌 存入桌洞' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAppState } from "../../composables/useAppState";
import {
  sendSlowPaperNote,
  computeFlightProgress,
  getRelationshipTitle,
  moveNoteToTrash
} from "../../services/slowNotesService";
import { convertImageToSketch } from "../../services/sketchFilter";
import { ChatMessage } from "../../types";
import HandwritingPad from "../common/HandwritingPad.vue";

const showHwPad = ref(false);
const showStickerPicker = ref(false);
const showPaperDrawer = ref(false);
const showSealDrawer = ref(false);

// 揉纸团创作 & 全屏展开状态
const showCrumpledComposer = ref(false);
const crumpledDraftText = ref("");
const crumpledDraftImage = ref("");
const crumpledDraftOriginal = ref("");
const isDraftSketch = ref(false);
const unfoldingMsg = ref<ChatMessage | null>(null);
const isPaperUnfolded = ref(false);

// 照片转素描工坊状态
const showSketchDrawer = ref(false);
const sketchOriginalSrc = ref("");
const sketchPreviewSrc = ref("");
const sketchToggleOn = ref(false);
const sketchConverting = ref(false);

const paperOptions = [
  { name: "京都和纸", colorKey: "yellow", icon: "🌾", desc: "古法棉麻纤维手感，水墨温润微黄底纹" },
  { name: "星空流光纸", colorKey: "blue", icon: "🌌", desc: "幽蓝深邃星辰，适合夜读轻语" },
  { name: "樱花手账纸", colorKey: "pink", icon: "🌸", desc: "柔和落樱微粉，温润少女心事" },
  { name: "古朴牛皮卷", colorKey: "kraft", icon: "🪵", desc: "复古怀旧质感，手感厚重质朴" }
];

const sealOptions = [
  { name: "古铜月相印", icon: "🌙", bg: "linear-gradient(135deg, #78350f, #92400e)", border: "#f59e0b", desc: "复古古铜压痕，月相清冷" },
  { name: "玫瑰金猫爪印", icon: "🐾", bg: "linear-gradient(135deg, #9d174d, #be185d)", border: "#fbcfe8", desc: "治愈肉垫浮雕，温情陪伴" },
  { name: "欧式皇家徽印", icon: "👑", bg: "linear-gradient(135deg, #7f1d1d, #991b1b)", border: "#fbbf24", desc: "双狮展翼纹章，庄重誓约" }
];

const {
  statusBarHeight,
  chatSheetVisible,
  currentChatFriend,
  currentChatMessages,
  newChatMessageText,
  chatScrollTop,
  myProfile,
  closeChatSheet,
  formatTime,
  previewImage,
  openUserProfileCard,
  switchMainTab,
  visitDesk
} = useAppState();

const isSealedMode = ref(false);
const isSketchMode = ref(false);
const currentPaperColor = ref<string>("yellow");
const activePaperName = ref<string>("京都和纸");
const activeSealName = ref<string>("古铜月相印");

const stickerList = ["☕ 暖心咖啡", "🌸 浪漫落樱", "🐾 温暖猫爪", "📮 街角邮戳", "💌 悄悄心意", "🍃 窗台微风", "✨ 繁星闪烁"];

let progressTimer: any = null;

onMounted(() => {
  // 同步用户成长中心装备的印章与信纸
  if (myProfile.value?.growth?.activeSeal) {
    activeSealName.value = myProfile.value.growth.activeSeal;
  }
  if (myProfile.value?.growth?.activePaper) {
    activePaperName.value = myProfile.value.growth.activePaper;
  }

  progressTimer = setInterval(() => {
    if (chatSheetVisible.value && currentChatFriend.value) {
      updateFlyingStatus();
    }
  }, 1000);
});

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer);
});

const flyingMsg = ref<any>(null);

function updateFlyingStatus() {
  const list = currentChatMessages.value || [];
  const inFlight = list.find(m => m.senderId === myProfile.value.id && !m.isDelivered);
  flyingMsg.value = inFlight || null;
}

const flyingNoteInfo = computed(() => {
  if (!flyingMsg.value) return null;
  const { progress, currentDesc, isDelivered } = computeFlightProgress(flyingMsg.value);
  if (isDelivered) {
    flyingMsg.value.isDelivered = true;
    return null;
  }
  return {
    progress,
    desc: currentDesc
  };
});

function openSealDrawer() {
  showSealDrawer.value = true;
}

function applySeal(s: typeof sealOptions[0]) {
  activeSealName.value = s.name;
  isSealedMode.value = true;
  showSealDrawer.value = false;
  uni.showToast({ title: `已盖上「${s.name}」🔏`, icon: "none" });
}

function removeSeal() {
  isSealedMode.value = false;
  showSealDrawer.value = false;
  uni.showToast({ title: "已撤下火漆印（改为普通纸条）", icon: "none" });
}

function openPaperDrawer() {
  showPaperDrawer.value = true;
}

function applyPaper(p: typeof paperOptions[0]) {
  activePaperName.value = p.name;
  currentPaperColor.value = p.colorKey;
  showPaperDrawer.value = false;
  uni.showToast({ title: `已换上：${p.name} 📜`, icon: "none" });
}

function insertSticker(stk: string) {
  if (newChatMessageText.value.length + stk.length <= 70) {
    newChatMessageText.value += (newChatMessageText.value ? " " : "") + stk;
  } else {
    uni.showToast({ title: "纸条限70字以内哦", icon: "none" });
  }
  showStickerPicker.value = false;
}

function crackWaxSeal(msg: ChatMessage) {
  uni.showLoading({ title: "正在戳破火漆封口..." });
  setTimeout(() => {
    uni.hideLoading();
    msg.isOpened = true;
    uni.showToast({ title: "火漆印已启封，展信悦！💌", icon: "success" });
  }, 400);
}

function pinNoteToDesk(msg: ChatMessage) {
  msg.isPinnedToDesk = true;
  uni.showToast({ title: "已将此小纸条珍藏入你的桌洞！🪟", icon: "success" });
}

const currentRelTitle = computed(() => {
  if (!currentChatFriend.value) return { title: "初遇笔友", icon: "🌱", days: 1 };
  return getRelationshipTitle(currentChatFriend.value, currentChatMessages.value.length);
});

function openCrumpledComposer() {
  crumpledDraftText.value = "";
  crumpledDraftImage.value = "";
  crumpledDraftOriginal.value = "";
  isDraftSketch.value = false;
  showCrumpledComposer.value = true;
}

function clearDraftImage() {
  crumpledDraftImage.value = "";
  crumpledDraftOriginal.value = "";
  isDraftSketch.value = false;
}

function pickImageForCrumpled() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      if (res.tempFilePaths?.[0]) {
        crumpledDraftOriginal.value = res.tempFilePaths[0];
        crumpledDraftImage.value = res.tempFilePaths[0];
        isDraftSketch.value = false;
      }
    }
  });
}

async function toggleDraftSketch() {
  if (!crumpledDraftOriginal.value) return;
  if (isDraftSketch.value) {
    crumpledDraftImage.value = crumpledDraftOriginal.value;
    isDraftSketch.value = false;
  } else {
    uni.showLoading({ title: "素描绘制中..." });
    const sketched = await convertImageToSketch(crumpledDraftOriginal.value);
    uni.hideLoading();
    crumpledDraftImage.value = sketched;
    isDraftSketch.value = true;
  }
}

function sendCrumpledBall() {
  if (!currentChatFriend.value) return;
  if (!crumpledDraftText.value.trim() && !crumpledDraftImage.value) {
    uni.showToast({ title: "写点字或画张图再揉成纸团吧", icon: "none" });
    return;
  }
  const newMsg = sendSlowPaperNote(currentChatFriend.value.userId, crumpledDraftText.value.trim() || "[纸团]", {
    noteMode: "crumpled",
    crumpledText: crumpledDraftText.value.trim(),
    crumpledImage: crumpledDraftImage.value || undefined,
    isSealed: isSealedMode.value,
    sealType: isSealedMode.value ? activeSealName.value : undefined,
    paperType: activePaperName.value,
    sketchMode: isDraftSketch.value
  });
  currentChatMessages.value.push(newMsg);
  showCrumpledComposer.value = false;
  isSealedMode.value = false;
  chatScrollTop.value = 999999 + Math.random();
  uni.showToast({ title: "纸团已扔出！🏐", icon: "success" });
}

function openCrumpledBall(msg: ChatMessage) {
  msg.isOpened = true;
  unfoldingMsg.value = msg;
  isPaperUnfolded.value = false;
  setTimeout(() => {
    isPaperUnfolded.value = true;
  }, 40);
}

function closeUnfoldingModal() {
  isPaperUnfolded.value = false;
  setTimeout(() => {
    unfoldingMsg.value = null;
  }, 240);
}

function openPhotoSketchPicker() {
  sketchOriginalSrc.value = "";
  sketchPreviewSrc.value = "";
  sketchToggleOn.value = false;
  showSketchDrawer.value = true;
}

function choosePhotoForSketch() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      if (res.tempFilePaths?.[0]) {
        sketchOriginalSrc.value = res.tempFilePaths[0];
        sketchPreviewSrc.value = res.tempFilePaths[0];
        sketchToggleOn.value = false;
      }
    }
  });
}

function useSamplePhotoForSketch() {
  const sample = "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&auto=format&fit=crop&q=80";
  sketchOriginalSrc.value = sample;
  sketchPreviewSrc.value = sample;
  sketchToggleOn.value = false;
}

async function toggleSketchConvert() {
  if (!sketchOriginalSrc.value || sketchConverting.value) return;
  if (sketchToggleOn.value) {
    sketchPreviewSrc.value = sketchOriginalSrc.value;
    sketchToggleOn.value = false;
    return;
  }
  sketchConverting.value = true;
  const result = await convertImageToSketch(sketchOriginalSrc.value);
  sketchPreviewSrc.value = result;
  sketchToggleOn.value = true;
  sketchConverting.value = false;
}

function sendSketchAsFastImage() {
  if (!currentChatFriend.value || !sketchPreviewSrc.value) return;
  const newMsg = sendSlowPaperNote(currentChatFriend.value.userId, sketchPreviewSrc.value, {
    noteMode: "fast",
    imageUri: sketchPreviewSrc.value,
    originalImage: sketchOriginalSrc.value,
    sketchMode: sketchToggleOn.value,
    paperType: activePaperName.value
  });
  currentChatMessages.value.push(newMsg);
  showSketchDrawer.value = false;
  chatScrollTop.value = 999999 + Math.random();
  uni.showToast({ title: sketchToggleOn.value ? "素描照片已发出 ✏️" : "图片已发出", icon: "success" });
}

function sendSketchAsCrumpledBall() {
  if (!currentChatFriend.value || !sketchPreviewSrc.value) return;
  const newMsg = sendSlowPaperNote(currentChatFriend.value.userId, "[素描纸团]", {
    noteMode: "crumpled",
    crumpledImage: sketchPreviewSrc.value,
    sketchMode: sketchToggleOn.value,
    paperType: activePaperName.value
  });
  currentChatMessages.value.push(newMsg);
  showSketchDrawer.value = false;
  chatScrollTop.value = 999999 + Math.random();
  uni.showToast({ title: "已揉成纸团扔出 🏐", icon: "success" });
}

function tossToTrash(msg: ChatMessage) {
  if (!currentChatFriend.value) return;
  moveNoteToTrash(currentChatFriend.value.userId, currentChatFriend.value.name, msg);
  currentChatMessages.value = currentChatMessages.value.filter((m) => m.id !== msg.id);
  uni.showToast({ title: "已丢进纸篓，可定时回收或捡回 🗑️", icon: "none" });
}

function sendPaperNote() {
  const text = newChatMessageText.value.trim();
  if (!text || !currentChatFriend.value) return;

  const newMsg = sendSlowPaperNote(currentChatFriend.value.userId, text, {
    noteMode: "fast",
    isSealed: isSealedMode.value,
    sealType: isSealedMode.value ? activeSealName.value : undefined,
    paperType: activePaperName.value,
    sketchMode: isSketchMode.value,
    targetDistanceMeters: currentChatFriend.value.distanceMeters || 450
  });

  currentChatMessages.value.push(newMsg);
  newChatMessageText.value = "";
  isSealedMode.value = false;
  showStickerPicker.value = false;
  chatScrollTop.value = 999999 + Math.random();
  uni.showToast({ title: "文字速发成功！📬", icon: "none" });
}

function onHwConfirmed(dataUrl: string) {
  showHwPad.value = false;
  if (showCrumpledComposer.value) {
    crumpledDraftOriginal.value = dataUrl;
    crumpledDraftImage.value = dataUrl;
    isDraftSketch.value = false;
    return;
  }
  if (!currentChatFriend.value) return;

  const newMsg = sendSlowPaperNote(currentChatFriend.value.userId, "[手绘纸团]", {
    noteMode: "crumpled",
    crumpledImage: dataUrl,
    isSealed: isSealedMode.value,
    sealType: isSealedMode.value ? activeSealName.value : undefined,
    paperType: activePaperName.value
  });

  currentChatMessages.value.push(newMsg);
  isSealedMode.value = false;
  chatScrollTop.value = 999999 + Math.random();
  uni.showToast({ title: "手绘已揉成纸团扔出！🏐", icon: "success" });
}

function goToFriendDesk() {
  if (!currentChatFriend.value) return;
  const { userId, name, avatar } = currentChatFriend.value;
  closeChatSheet(true);
  visitDesk(userId, name, avatar);
}
</script>

<style lang="scss" scoped>
.chat-fullscreen-page {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: #f7f5f0;
  z-index: 150;
  display: flex;
  flex-direction: column;
}

.chat-sheet {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 1. 顶栏 */
.chat-header {
  height: 50px;
  background-color: #ffffff;
  border-bottom: 0.5px solid rgba(220, 210, 198, 0.6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(62, 39, 35, 0.03);

  .chat-back-btn {
    display: flex;
    align-items: center;
    gap: 2px;
    cursor: pointer;
    padding: 6px 4px;

    .back-arrow {
      font-size: 24px;
      color: #5d4037;
      line-height: 1;
      margin-top: -2px;
    }

    .back-label {
      font-size: 15px;
      color: #5d4037;
    }
  }

  .chat-header-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;

    .chat-header-name {
      font-size: 15px;
      font-weight: 600;
      color: #2c2420;
    }

    .header-sub-row {
      display: flex;
      align-items: center;
      margin-top: 1px;

      .online-tag {
        font-size: 11px;
        color: #8c827a;
      }
    }
  }

  .chat-desk-btn {
    background: #fbf5ea;
    padding: 5px 12px;
    border-radius: 16px;
    border: 1px solid #ebd9c5;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(62, 39, 35, 0.06);

    .desk-icon {
      font-size: 13px;
    }

    .desk-btn-text {
      font-size: 12px;
      color: #8c5835;
      font-weight: 600;
    }
  }
}

/* 2. 飞行航迹状态横幅 */
.flight-radar-banner {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  padding: 10px 16px;
  border-bottom: 1px solid #fde68a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  flex-shrink: 0;

  .radar-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .radar-left {
      display: flex;
      align-items: center;
      gap: 6px;

      .airplane-spin {
        font-size: 15px;
      }

      .radar-text {
        font-size: 12px;
        font-weight: 600;
        color: #92400e;
      }
    }

    .slow-flight-pill {
      background: rgba(146, 64, 14, 0.12);
      padding: 2px 8px;
      border-radius: 10px;

      .flight-pill-txt {
        font-size: 11px;
        color: #78350f;
        font-weight: 600;
      }
    }
  }

  .radar-progress-track {
    margin-top: 6px;
    height: 4px;
    background: rgba(0, 0, 0, 0.08);
    border-radius: 2px;
    overflow: hidden;

    .track-fill {
      height: 100%;
      background: #d97706;
      border-radius: 2px;
      transition: width 0.3s ease;
    }
  }
}

/* 3. 消息流 */
.chat-messages-box {
  flex: 1;
  background-color: #f7f5f0;
}

.chat-scroll-inner {
  padding: 14px 14px 20px;

  .chat-security-tip {
    text-align: center;
    padding: 6px 14px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 14px;
    font-size: 11px;
    color: #8c827a;
    margin: 4px auto 16px;
    width: fit-content;
  }

  .chat-bubble-row {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
    align-items: flex-start;

    &.row-self {
      flex-direction: row-reverse;

      .msg-paper-card {
        border-radius: 12px 2px 12px 12px;
        background: #fffdf2;
        border-color: #faecc0;

        .card-washi-tape {
          right: 12px;
          left: auto;
        }

        .msg-card-footer {
          flex-direction: row-reverse;
        }
      }
    }

    .msg-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.08);
      flex-shrink: 0;
    }

    /* 纸条卡片 */
    .msg-paper-card {
      max-width: 74%;
      background: #ffffff;
      border-radius: 2px 12px 12px 12px;
      padding: 14px 14px 10px;
      box-shadow: 0 3px 10px rgba(62, 39, 35, 0.06);
      border: 1px solid #ebd9c5;
      position: relative;
      transition: all 0.2s ease;

      /* 和纸胶带修饰 */
      .card-washi-tape {
        position: absolute;
        top: -6px;
        left: 12px;
        width: 36px;
        height: 12px;
        background: rgba(255, 255, 255, 0.85);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-radius: 1px;
        border-left: 1.5px dashed rgba(0, 0, 0, 0.15);
        border-right: 1.5px dashed rgba(0, 0, 0, 0.15);
      }

      /* 未拆开的火漆信封 */
      .sealed-unopened-box {
        padding: 10px 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        cursor: pointer;

        .wax-seal-big-stamp {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #b91c1c;
          border: 2px solid #7f1d1d;
          box-shadow: 0 4px 12px rgba(185, 28, 28, 0.35);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .stamp-seal-icon {
            font-size: 18px;
          }

          .stamp-seal-name {
            font-size: 8px;
            color: #ffffff;
            font-weight: bold;
            transform: scale(0.85);
          }
        }

        .unopened-hint {
          font-size: 13px;
          font-weight: 600;
          color: #7f1d1d;
        }

        .crack-seal-btn {
          background: #fee2e2;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          color: #b91c1c;
          font-weight: 500;
        }
      }

      /* 已拆开正文 */
      .msg-content-body {
        .wax-seal-badge {
          display: inline-block;
          background: #fee2e2;
          border: 0.5px solid #fca5a5;
          color: #b91c1c;
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 6px;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .hw-img-wrap {
          margin-bottom: 6px;

          .msg-hw-img {
            width: 100%;
            max-width: 220px;
            border-radius: 6px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          }

          .hw-view-tip {
            display: block;
            font-size: 10px;
            color: #8c827a;
            margin-top: 2px;
          }
        }

        .msg-text {
          font-size: 15px;
          color: #2c2420;
          line-height: 1.55;
          word-break: break-all;
          display: block;
          letter-spacing: 0.3px;
        }

        .msg-card-footer {
          margin-top: 8px;
          padding-top: 6px;
          border-top: 0.5px dashed rgba(0, 0, 0, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;

          .footer-left {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;

            .transit-status {
              font-size: 11px;
              &.status-flying {
                color: #d97706;
                font-weight: 500;
              }
              &.status-delivered {
                color: #8c827a;
              }
            }

            .msg-dot {
              color: #cccccc;
            }

            .msg-timestamp {
              color: #a8a096;
            }
          }

          .footer-pin-btn {
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 6px;
            background: rgba(0, 0, 0, 0.03);

            .pin-icon {
              font-size: 10px;
              color: #8c5835;
            }
          }
        }
      }
    }
  }
}

/* 4. 纸条书写托盘 (Redesigned) */
.stationery-tray-panel {
  background: #ffffff;
  border-top: 1px solid rgba(220, 210, 198, 0.7);
  padding: 10px 14px calc(12px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -2px 10px rgba(62, 39, 35, 0.04);
  flex-shrink: 0;

  .stationery-tools-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .tools-left-group {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow-x: auto;

      .tray-chip {
        display: flex;
        align-items: center;
        gap: 3px;
        padding: 4px 9px;
        border-radius: 14px;
        background: #f7f5f0;
        border: 0.5px solid #ebd9c5;
        font-size: 11px;
        color: #6d5b52;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;

        .chip-icon {
          font-size: 12px;
        }

        &.hw-chip {
          background: #fff8eb;
          border-color: #fde047;
          color: #b45309;
          font-weight: 600;
        }

        &.chip-active-seal {
          background: #fee2e2;
          border-color: #f87171;
          color: #b91c1c;
          font-weight: 600;
        }
      }
    }

    .char-counter {
      font-size: 11px;
      color: #a8a096;
      white-space: nowrap;
      margin-left: 6px;

      &.char-warning {
        color: #dc2626;
        font-weight: bold;
      }
    }
  }

  /* 戳印抽屉 */
  .stickers-tray-drawer {
    display: flex;
    gap: 8px;
    padding: 6px 0 8px;
    overflow-x: auto;

    .sticker-item {
      padding: 4px 10px;
      border-radius: 12px;
      background: #fdf6ec;
      border: 1px dashed #fbd38d;
      font-size: 12px;
      color: #7b341e;
      cursor: pointer;
      white-space: nowrap;
    }
  }

  /* 便签书写台与寄出动作行 */
  .stationery-input-box {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 14px;
    background: #fffdf7;
    border: 1.5px solid #e8decb;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;

    &.paper-bg-yellow { background: #fffef2; border-color: #faecc0; }
    &.paper-bg-blue   { background: #f0f7fe; border-color: #cde4fa; }
    &.paper-bg-pink   { background: #fef2f4; border-color: #fad2dc; }
    &.paper-bg-kraft  { background: #f5efe6; border-color: #ded1c1; }

    .note-writing-textarea {
      flex: 1;
      min-height: 40px;
      max-height: 84px;
      font-size: 14px;
      line-height: 1.5;
      color: #2c2420;
      border: none;
      background: transparent;
      padding: 4px 0;
      box-sizing: border-box;
    }

    .note-textarea-ph {
      color: #aba29a;
      font-size: 14px;
    }

    .note-send-btn {
      margin: 0;
      padding: 0 14px;
      height: 36px;
      border-radius: 18px;
      background: #e5e2da;
      color: #a8a096;
      border: none;
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s ease;

      .send-plane-icon {
        font-size: 15px;
      }

      .send-label {
        font-size: 13px;
        font-weight: 600;
      }

      &.send-ready {
        background: #3e2723;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(62, 39, 35, 0.25);

        &:active {
          transform: scale(0.96);
        }
      }
    }
  }
}

/* 拟物手账抽屉 (统一定制设计，杜绝生硬原生白框弹窗) */
.custom-drawer-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  z-index: 220;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  animation: fadeIn 0.2s ease;
}

.custom-drawer-card {
  background: #fffdf8;
  border-radius: 20px 20px 0 0;
  padding: 16px 18px calc(24px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -8px 24px rgba(62, 39, 35, 0.15);
  border-top: 1px solid rgba(220, 210, 198, 0.8);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  .drawer-header-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 16px;

    .drawer-pill-bar {
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background: #ded8ce;
      margin-bottom: 12px;
    }

    .drawer-main-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c2420;
    }

    .drawer-sub-title {
      font-size: 12px;
      color: #8c827a;
      margin-top: 3px;
    }
  }

  .drawer-items-list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .paper-item-card, .seal-item-card {
      display: flex;
      align-items: center;
      padding: 12px 14px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid #ebd9c5;
      box-shadow: 0 2px 6px rgba(62, 39, 35, 0.04);
      cursor: pointer;
      transition: all 0.18s ease;

      &:active {
        transform: scale(0.985);
      }

      &.item-card-active, &.seal-card-active {
        border-color: #3e2723;
        box-shadow: 0 3px 12px rgba(62, 39, 35, 0.12);
        background: #fffef2;
      }

      &.paper-skin-yellow {
        background: #fffdf2;
      }
      &.paper-skin-blue {
        background: #f0f7fe;
        border-color: #cde4fa;
      }
      &.paper-skin-pink {
        background: #fef2f4;
        border-color: #fad2dc;
      }
      &.paper-skin-kraft {
        background: #f7f3ec;
        border-color: #ded1c1;
      }

      .paper-swatch-box {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.03);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;

        .swatch-emoji {
          font-size: 22px;
        }
      }

      .paper-text-col, .seal-text-col {
        flex: 1;
        display: flex;
        flex-direction: column;

        .p-title-row {
          display: flex;
          align-items: center;
          gap: 6px;

          .p-name, .s-name {
            font-size: 15px;
            font-weight: 600;
            color: #2c2420;
          }

          .p-badge, .s-badge {
            font-size: 10px;
            padding: 1px 6px;
            border-radius: 8px;
            background: #3e2723;
            color: #ffffff;
            font-weight: 500;
          }
        }

        .p-desc, .s-desc {
          font-size: 12px;
          color: #8c827a;
          margin-top: 2px;
        }
      }

      .seal-wax-stamp {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #fff;
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
        margin-right: 12px;
        flex-shrink: 0;

        .seal-stamp-ico {
          font-size: 20px;
        }
      }

      .p-select-indicator {
        font-size: 16px;
        color: #8c827a;
        margin-left: 8px;
        font-weight: bold;
      }
    }
  }

  .drawer-footer-action {
    margin-top: 14px;
    text-align: center;
    padding: 8px 0;
    cursor: pointer;

    .cancel-seal-btn {
      font-size: 13px;
      color: #b91c1c;
      font-weight: 500;
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
.relation-sub-pill {
  font-size: 11px;
  color: #8b5a2b;
  background: #fff8e1;
  border: 0.5px solid #edd9a3;
  padding: 1px 8px;
  border-radius: 10px;
}

.paper-pale-yellow {
  background: linear-gradient(180deg, #fffdf2 0%, #fdf5d5 100%) !important;
  border: 1px solid #ede0b4 !important;
}

.group-sender-name {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #8d6e63;
  margin-bottom: 4px;
}

.footer-right-ops {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trash-mini-btn {
  font-size: 12px;
  opacity: 0.65;
  cursor: pointer;
  padding: 0 2px;
}

.css-sketch-fallback {
  filter: grayscale(100%) contrast(165%) brightness(112%) sepia(14%);
}

/* 立体纸团消息气泡（需求 8） */
.crumpled-ball-bubble {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  max-width: 245px;
  background: linear-gradient(135deg, #fffdf0 0%, #f8ecc2 100%);
  border: 1.5px dashed #d8be7d;
  border-radius: 18px;
  box-shadow: 0 4px 12px rgba(62, 39, 35, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.96);
  }

  .paper-ball-sphere {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 44% 56% 52% 48% / 48% 45% 55% 52%;
    background: radial-gradient(circle at 32% 30%, #fffef7, #f3e2a9 68%, #d7bc74 100%);
    box-shadow: inset -3px -4px 8px rgba(121, 85, 72, 0.25), 0 4px 10px rgba(62, 39, 35, 0.16);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .ball-crease {
      position: absolute;
      background: rgba(121, 85, 72, 0.22);
      height: 1px;
    }
    .c1 { width: 28px; transform: rotate(28deg); top: 18px; left: 10px; }
    .c2 { width: 24px; transform: rotate(-38deg); bottom: 16px; right: 8px; }
    .c3 { width: 18px; transform: rotate(75deg); top: 22px; left: 14px; }

    .ball-emoji {
      font-size: 18px;
      position: relative;
      z-index: 2;
    }
  }

  .ball-meta-col {
    flex: 1;
    min-width: 0;
  }

  .ball-title {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #3e2723;
  }

  .ball-hint {
    display: block;
    font-size: 11px;
    color: #c25b38;
    margin-top: 2px;
  }

  .ball-foot-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;
  }
}

.crumpled-chip {
  background: #fff3d6 !important;
  border-color: #e6c675 !important;
}

/* 揉纸团创作抽屉 */
.crumpled-paper-editor {
  background: linear-gradient(180deg, #fffdf2 0%, #fdf5d5 100%);
  border: 1px solid #eadba8;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;

  .crumpled-textarea {
    width: 100%;
    min-height: 92px;
    font-size: 14px;
    color: #3e2723;
    line-height: 1.6;
  }

  .crumpled-img-preview {
    margin-top: 8px;
    background: #fffdf8;
    border-radius: 10px;
    padding: 8px;
    border: 1px solid #ece2c6;

    .draft-img {
      width: 100%;
      height: 140px;
      border-radius: 6px;
    }

    .draft-img-ops {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 6px;

      .draft-op-btn {
        font-size: 11px;
        font-weight: 600;
        color: #5d4037;
        background: #f5efe0;
        padding: 3px 10px;
        border-radius: 10px;
        cursor: pointer;

        &.del { color: #c25b38; }
      }
    }
  }

  .crumpled-attach-bar {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 0.5px dashed #decb95;

    .attach-pill {
      font-size: 12px;
      font-weight: 600;
      color: #5d4037;
      background: #fffdf8;
      border: 1px solid #e2d5b2;
      padding: 5px 10px;
      border-radius: 14px;
      cursor: pointer;
    }
  }
}

.crumpled-send-btn {
  width: 100%;
  text-align: center;
  padding: 12px 0;
  border-radius: 18px;
  background: #3e2723;
  color: #fffdf8;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* 照片转素描工坊 */
.sketch-stage-box {
  height: 220px;
  background: #faf5e8;
  border: 1px dashed #d7c7a3;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 12px;

  .sketch-stage-img {
    width: 100%;
    height: 100%;
  }

  .sketch-empty-pick {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    .pick-ico { font-size: 32px; }
    .pick-txt { font-size: 13px; color: #795548; }
  }
}

.sketch-tools-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;

  .sketch-btn {
    font-size: 12px;
    font-weight: 600;
    color: #5d4037;
    background: #f5efe0;
    border: 1px solid #e3d6b8;
    padding: 6px 12px;
    border-radius: 14px;
    cursor: pointer;

    &.active {
      background: #3e2723;
      color: #fffdf8;
      border-color: #3e2723;
    }
  }
}

.sketch-send-actions {
  display: flex;
  gap: 10px;

  .send-opt-btn {
    flex: 1;
    text-align: center;
    padding: 11px 0;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;

    &.secondary {
      background: #f3ead6;
      color: #3e2723;
    }
    &.primary {
      background: #3e2723;
      color: #fffdf8;
    }
  }
}

/* 纸团全屏展平动画层（需求 8） */
.crumpled-fullscreen-mask {
  position: fixed;
  inset: 0;
  z-index: 260;
  background: rgba(34, 24, 18, 0.72);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.unfolded-paper-stage {
  position: relative;
  width: 100%;
  max-width: 390px;
  height: 82vh;
  background:
    repeating-linear-gradient(
      to bottom,
      transparent 0px,
      transparent 29px,
      rgba(161, 136, 127, 0.14) 30px
    ),
    linear-gradient(180deg, #fffef4 0%, #fcf2cf 100%);
  border-radius: 18px;
  border: 1.5px solid #e6d39c;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.42);
  padding: 20px 18px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* 初始揉皱球态 */
  opacity: 0;
  transform: scale(0.22) rotate(-22deg) skewX(12deg);
  border-radius: 50%;
  transition: transform 0.52s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.32s ease, border-radius 0.48s ease;

  &.is-unfolded {
    opacity: 1;
    transform: scale(1) rotate(0deg) skewX(0deg);
    border-radius: 18px;
  }

  .unfold-washi-top {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 72px;
    height: 16px;
    background: rgba(255, 255, 255, 0.75);
    border: 0.5px dashed rgba(141, 110, 99, 0.45);
    border-radius: 3px;
  }

  .unfold-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px dashed #decb95;

    .unfold-from {
      font-size: 14px;
      font-weight: 700;
      color: #3e2723;
    }

    .unfold-close-btn {
      font-size: 12px;
      font-weight: 600;
      color: #6d4c41;
      background: #f4e8c6;
      padding: 4px 10px;
      border-radius: 12px;
      cursor: pointer;
    }
  }

  .unfold-content-scroll {
    flex: 1;
    min-height: 0;
    padding: 14px 0;

    .unfold-text-body {
      display: block;
      font-size: 16px;
      line-height: 1.9;
      color: #3e2723;
      white-space: pre-wrap;
      margin-bottom: 14px;
    }

    .unfold-art-img {
      width: 100%;
      border-radius: 10px;
      border: 4px solid #fffdf8;
      box-shadow: 0 4px 16px rgba(62, 39, 35, 0.14);
    }
  }

  .unfold-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
    border-top: 1px dashed #decb95;

    .unfold-time {
      font-size: 12px;
      color: #8d6e63;
    }

    .unfold-pin-btn {
      font-size: 12px;
      font-weight: 700;
      color: #3e2723;
      background: #f5e6bd;
      padding: 6px 12px;
      border-radius: 14px;
      cursor: pointer;
    }
  }
}
</style>
