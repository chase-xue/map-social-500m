<template>
  <view v-if="publishVisible" class="wechat-publish-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 1. 极简优雅顶栏 -->
    <view class="wechat-pub-header">
      <view class="pub-cancel-btn" @tap="closePublishSheet(true)">
        <text class="cancel-text">取消</text>
      </view>

      <text class="pub-title">
        {{ currentPublishMode === 'emergency' ? '🚨 救命求助' : '贴便签' }}
      </text>

      <button
        class="wechat-pub-btn"
        :class="{
          'btn-emergency': currentPublishMode === 'emergency',
          'btn-active': canSubmit && !isPublishing
        }"
        :disabled="!canSubmit || isPublishing"
        :loading="isPublishing"
        @tap="handlePublish"
      >
        {{ currentPublishMode === 'emergency' ? '发送' : '贴上' }}
      </button>
    </view>

    <!-- 2. 救命呼救模式警示横幅 -->
    <view v-if="currentPublishMode === 'emergency'" class="emergency-notice-banner">
      <text class="notice-text">⚡ 紧急求助将在周边地图标红，并向附近邻友广播</text>
    </view>

    <!-- 3. 一体化拍立得手账主体 -->
    <scroll-view scroll-y class="pub-scroll-area">
      <view class="pub-inner-body">
        <!-- 键盘 / 手写轻盈分段切换 -->
        <view v-if="currentPublishMode !== 'emergency'" class="mode-switch">
          <view
            class="mode-btn"
            :class="{ active: !handwritingImg }"
            @tap="handwritingImg = ''"
          >
            <text>文字便签</text>
          </view>
          <view
            class="mode-btn"
            :class="{ active: !!handwritingImg }"
            @tap="showHandwritingPad = true"
          >
            <text>真迹手写</text>
          </view>
        </view>

        <!-- 核心：一体化「拍立得 + 70字」实体和纸便签卡 -->
        <view class="note-stage-card" :class="'p-' + selectedPaperColor">
          <view class="note-tape" />

          <!-- 手写真迹预览模式 -->
          <view v-if="handwritingImg" class="hw-preview-inner">
            <image class="hw-preview-img" :src="handwritingImg" mode="widthFix" />
            <view class="hw-preview-actions">
              <text class="hw-op-btn" @tap="showHandwritingPad = true">重新手写</text>
              <text class="hw-op-btn del" @tap="handwritingImg = ''">清除</text>
            </view>
          </view>

          <!-- 文字 + 拍立得插槽一体化模式 -->
          <template v-else>
            <!-- 内嵌拍立得单图插槽 (限 1 张) -->
            <view
              class="polaroid-slot"
              :class="{ 'has-photo': pickedImages.length > 0 }"
              @tap="pickedImages.length === 0 ? chooseImages() : previewImage(pickedImages[0], pickedImages)"
            >
              <template v-if="pickedImages.length > 0">
                <image class="polaroid-img" :src="pickedImages[0]" mode="aspectFill" />
                <view class="photo-remove" @tap.stop="removePickedImage(0)">✕</view>
              </template>
              <template v-else>
                <svg class="slot-cam-svg" viewBox="0 0 24 24" fill="none" stroke="#9C8772" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <text class="slot-main-txt">轻触添 1 张拍立得照片</text>
                <view class="slot-sample-link" @tap.stop="addPresetSamplePhoto">
                  <text>或点此选用街景样例图</text>
                </view>
              </template>
            </view>

            <!-- 横线手账 70 字书写区 -->
            <textarea
              class="note-textarea"
              v-model="newPostContent"
              :placeholder="placeholderText"
              placeholder-style="color: #A69582; font-size: 14px;"
              maxlength="70"
              :auto-height="true"
            />
          </template>

          <!-- 莫兰迪 5 色纸盘 + 字数计数 -->
          <view class="note-toolbar">
            <view class="morandi-dots">
              <text class="palette-label">纸色</text>
              <view
                v-for="c in paperColorList"
                :key="c.key"
                class="m-dot"
                :class="['dot-' + c.key, { active: selectedPaperColor === c.key }]"
                @tap="selectedPaperColor = c.key"
              />
            </view>
            <text v-if="!handwritingImg" class="char-cnt" :class="{ max: newPostContent.length >= 70 }">
              {{ newPostContent.length }} / 70
            </text>
          </view>
        </view>

        <!-- 下方紧凑标签与元数据区（一屏看完，告别 5 行微信长表单） -->
        <view class="meta-section">
          <!-- 4 大兴趣标签 -->
          <template v-if="currentPublishMode !== 'emergency'">
            <text class="meta-label">选择便签标签</text>
            <view class="tags-row">
              <view
                v-for="t in interestTagOptions"
                :key="t.value"
                class="tag-pill"
                :class="{ active: publishInterestTag === t.value }"
                @tap="selectInterestTag(t.value)"
              >
                <text>{{ t.label }}</text>
              </view>
            </view>
          </template>

          <!-- 紧急联系电话 (仅求助模式显示) -->
          <view v-if="currentPublishMode === 'emergency'" class="emergency-phone-bar">
            <text class="ep-label">紧急电话</text>
            <input
              class="ep-inp"
              v-model="helpContactPhone"
              placeholder="方便邻友联系的手机号"
              maxlength="11"
            />
          </view>

          <!-- 一行极简状态微胶囊（当前位置 + 发布场景切换 + 发布身份） -->
          <view class="compact-meta-bar">
            <view class="loc-part">
              <svg class="loc-svg" viewBox="0 0 24 24" fill="none" stroke="#C25B38" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <text class="loc-txt">当前所在位置</text>
            </view>

            <view class="meta-right-group">
              <view class="scene-pill" @tap="cyclePublishScene">
                <text>{{ sceneLabel }} ▾</text>
              </view>
              <image class="mini-ava" :src="myProfile.avatar" mode="aspectFill" @tap="openMyProfileSheet" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 小刷子刷胶水拟物动效遮罩 -->
    <view v-if="isBrushingGlue" class="brush-glue-overlay">
      <view class="brush-hand-icon">🖌️</view>
      <text class="brush-hint-text">正在刷胶贴上便签...</text>
    </view>

    <!-- 真迹手写画板 -->
    <HandwritingPad
      v-if="showHandwritingPad"
      actionConfirmText="保存并贴在便签上"
      :defaultPattern="selectedPaperColor"
      @confirm="onHandwritingConfirmed"
      @close="showHandwritingPad = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { NotePaperColor, InterestTag } from "../../types";
import { useAppState } from "../../composables/useAppState";
import HandwritingPad from "../common/HandwritingPad.vue";

const {
  statusBarHeight, currentPublishMode, publishVisible, newPostContent, pickedImages,
  isPublishing, myProfile, helpContactPhone,
  isAcgnPost, selectedPaperColor, publishInterestTag,
  closePublishSheet, chooseImages, removePickedImage, previewImage, addPresetSamplePhoto,
  submitNewPost, submitHelpPost, openMyProfileSheet, switchMainTab
} = useAppState();

const isBrushingGlue = ref(false);
const showHandwritingPad = ref(false);
const handwritingImg = ref("");

const interestTagOptions: { value: InterestTag; label: string }[] = [
  { value: "宠物", label: "宠物" },
  { value: "二次元", label: "二次元" },
  { value: "风景", label: "风景" },
  { value: "极限运动", label: "极限运动" },
];

const paperColorList: { key: NotePaperColor; name: string }[] = [
  { key: "yellow", name: "鹅黄" },
  { key: "pink", name: "落樱" },
  { key: "blue", name: "雾蓝" },
  { key: "green", name: "鼠尾草" },
  { key: "kraft", name: "牛皮纸" }
];

function selectInterestTag(tag: InterestTag) {
  publishInterestTag.value = tag;
  isAcgnPost.value = tag === "二次元";
}

function onHandwritingConfirmed(dataUrl: string) {
  showHandwritingPad.value = false;
  handwritingImg.value = dataUrl;
}

const sceneLabel = computed(() => {
  if (currentPublishMode.value === "emergency") return "紧急求助";
  if (currentPublishMode.value === "status") return "地图便签";
  return "关注动态";
});

function cyclePublishScene() {
  const order: ("status" | "moments" | "emergency")[] = ["status", "moments", "emergency"];
  const idx = order.indexOf(currentPublishMode.value);
  currentPublishMode.value = order[(idx + 1) % order.length];
}

const canSubmit = computed(() => {
  return !!newPostContent.value.trim() || pickedImages.value.length > 0 || !!handwritingImg.value;
});

const placeholderText = computed(() => {
  if (currentPublishMode.value === "emergency") {
    return "请简述遇到的紧急求助情况与位置...";
  }
  return "写下此刻的风景或心情，贴在此处（限 70 字）...";
});

async function handlePublish() {
  if (!canSubmit.value) return;

  isBrushingGlue.value = true;
  await new Promise((r) => setTimeout(r, 550));

  try {
    if (handwritingImg.value) {
      if (!newPostContent.value.trim()) {
        newPostContent.value = "分享了一张手写小便签";
      }
      pickedImages.value = [handwritingImg.value];
    }

    if (currentPublishMode.value === "emergency") {
      const { newHelpContent, pickedHelpImages } = useAppState();
      newHelpContent.value = newPostContent.value;
      pickedHelpImages.value = [...pickedImages.value];
      await submitHelpPost();
      closePublishSheet(true);
    } else {
      await submitNewPost();
      handwritingImg.value = "";
      if (currentPublishMode.value === "status") {
        switchMainTab("map");
      }
    }
  } finally {
    isBrushingGlue.value = false;
  }
}
</script>

<style lang="scss" scoped>
.wechat-publish-page {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: #f5f1e9;
  z-index: 120;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.wechat-pub-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  background: rgba(255, 253, 248, 0.88);
  backdrop-filter: blur(12px);
  border-bottom: 0.5px solid rgba(214, 200, 180, 0.6);
  flex-shrink: 0;

  .pub-cancel-btn {
    cursor: pointer;
    padding: 6px 4px;
    .cancel-text { font-size: 14px; color: #7d6a58; }
  }

  .pub-title {
    font-size: 15px;
    font-weight: 700;
    color: #3e2723;
  }

  .wechat-pub-btn {
    margin: 0;
    padding: 0 16px;
    height: 32px;
    line-height: 32px;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 700;
    border: none;
    background: #e8e2d6;
    color: #a89c8e;
    transition: all 0.2s ease;

    &.btn-active {
      background: linear-gradient(135deg, #d97742, #b8502c);
      color: #fffdf8;
      box-shadow: 0 4px 12px rgba(184, 80, 44, 0.3);
    }

    &.btn-emergency.btn-active {
      background: #dc2626;
      color: #fff;
    }
  }
}

.emergency-notice-banner {
  background: #fef2f2;
  border-bottom: 1px solid #fee2e2;
  padding: 8px 18px;
  .notice-text { font-size: 12px; color: #dc2626; font-weight: 600; }
}

.pub-scroll-area {
  flex: 1;
  min-height: 0;
}

.pub-inner-body {
  padding: 14px 18px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mode-switch {
  align-self: center;
  display: inline-flex;
  padding: 3px;
  border-radius: 18px;
  background: #eae3d5;
  gap: 2px;

  .mode-btn {
    padding: 5px 16px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 600;
    color: #7d6a58;
    cursor: pointer;

    &.active {
      background: #fffdf8;
      color: #3e2723;
      box-shadow: 0 2px 6px rgba(62, 39, 35, 0.1);
    }
  }
}

/* 核心一体化「拍立得 + 70字」和纸便签卡 */
.note-stage-card {
  position: relative;
  border-radius: 16px;
  padding: 20px 16px 14px;
  border: 1px solid #ebd9a7;
  box-shadow: 0 12px 30px rgba(62, 39, 35, 0.09), 0 2px 6px rgba(62, 39, 35, 0.04);
  transition: background 0.25s ease;

  &.p-yellow { background: linear-gradient(180deg, #fffdf2 0%, #fcf3d4 100%); border-color: #ebd9a7; }
  &.p-pink { background: linear-gradient(180deg, #fff8fa 0%, #fce8ee 100%); border-color: #eccad4; }
  &.p-blue { background: linear-gradient(180deg, #f6fafd 0%, #e6f0f8 100%); border-color: #c7dbec; }
  &.p-green { background: linear-gradient(180deg, #f6fbf6 0%, #e5f2e6 100%); border-color: #c8dfca; }
  &.p-kraft { background: linear-gradient(180deg, #f6ecdc 0%, #ead7bc 100%); border-color: #d6bc96; }

  .note-tape {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%) rotate(-1.5deg);
    width: 68px;
    height: 16px;
    background: rgba(255, 255, 255, 0.72);
    border: 0.5px dashed rgba(141, 110, 99, 0.35);
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(62, 39, 35, 0.08);
  }
}

.polaroid-slot {
  width: 100%;
  height: 170px;
  border-radius: 10px;
  background: rgba(255, 253, 248, 0.65);
  border: 1.5px dashed rgba(161, 136, 112, 0.48);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  &.has-photo {
    background: #fffdf8;
    border: 1px solid #eae0ce;
    padding: 7px 7px 20px;
    height: 196px;
    box-shadow: 0 6px 16px rgba(62, 39, 35, 0.12);
    transform: rotate(-0.8deg);
  }

  .slot-cam-svg { width: 26px; height: 26px; }
  .slot-main-txt { font-size: 12.5px; font-weight: 600; color: #8d7864; }
  .slot-sample-link {
    margin-top: 2px;
    padding: 3px 10px;
    border-radius: 10px;
    background: rgba(214, 198, 174, 0.28);
    font-size: 10.5px;
    color: #8d6e63;
  }

  .polaroid-img {
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }

  .photo-remove {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(44, 34, 26, 0.72);
    color: #fffdf8;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.note-textarea {
  width: 100%;
  min-height: 88px;
  font-size: 15px;
  line-height: 28px;
  color: #3e2723;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 27px,
    rgba(141, 110, 99, 0.16) 28px
  );
}

.hw-preview-inner {
  .hw-preview-img {
    width: 100%;
    border-radius: 8px;
    background: #fffdf8;
  }
  .hw-preview-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 8px;
    .hw-op-btn {
      font-size: 11.5px;
      font-weight: 600;
      color: #5d4037;
      background: rgba(255, 253, 248, 0.85);
      padding: 4px 10px;
      border-radius: 10px;
      &.del { color: #c25b38; }
    }
  }
}

.note-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 0.5px dashed rgba(141, 110, 99, 0.28);

  .morandi-dots {
    display: flex;
    align-items: center;
    gap: 9px;

    .palette-label { font-size: 11px; color: #8d7864; margin-right: 2px; }

    .m-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 1.5px solid rgba(62, 39, 35, 0.15);
      cursor: pointer;

      &.dot-yellow { background: #f7e8a8; }
      &.dot-pink { background: #f3cdd6; }
      &.dot-blue { background: #c9ddf0; }
      &.dot-green { background: #cde2ce; }
      &.dot-kraft { background: #dfc39d; }

      &.active {
        border: 2px solid #3e2723;
        transform: scale(1.15);
      }
    }
  }

  .char-cnt {
    font-size: 11px;
    font-weight: 600;
    color: #9a8776;
    &.max { color: #c25b38; }
  }
}

.meta-section {
  display: flex;
  flex-direction: column;
  gap: 10px;

  .meta-label {
    font-size: 11px;
    font-weight: 700;
    color: #9a8776;
    padding-left: 2px;
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .tag-pill {
      padding: 6px 14px;
      border-radius: 16px;
      background: #fffdf8;
      border: 1px solid #e5dac8;
      font-size: 12px;
      font-weight: 600;
      color: #6d5849;
      cursor: pointer;

      &.active {
        background: #3e2723;
        border-color: #3e2723;
        color: #fffdf8;
      }
    }
  }
}

.emergency-phone-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #fffdf8;
  border: 1px solid #f5c6c6;

  .ep-label { font-size: 12px; font-weight: 700; color: #c25b38; }
  .ep-inp { flex: 1; font-size: 13px; color: #3e2723; }
}

.compact-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 14px;
  background: #fffdf8;
  border: 1px solid #eae1d2;

  .loc-part {
    display: flex;
    align-items: center;
    gap: 5px;
    .loc-svg { width: 14px; height: 14px; }
    .loc-txt { font-size: 12px; color: #6d5849; }
  }

  .meta-right-group {
    display: flex;
    align-items: center;
    gap: 8px;

    .scene-pill {
      padding: 4px 10px;
      border-radius: 12px;
      background: #f5efe2;
      font-size: 11.5px;
      font-weight: 600;
      color: #3e2723;
      cursor: pointer;
    }

    .mini-ava {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1px solid #e2d6c3;
    }
  }
}

.brush-glue-overlay {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: rgba(44, 34, 26, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  .brush-hand-icon { font-size: 46px; }
  .brush-hint-text { font-size: 14px; font-weight: 600; color: #fffdf8; }
}
</style>
