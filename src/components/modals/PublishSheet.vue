<template>
  <view v-if="publishVisible" class="wechat-publish-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 1. 极简优雅顶栏: 取消 (左) | 居中标题 | 贴上 (右) -->
    <view class="wechat-pub-header">
      <view class="pub-cancel-btn" @tap="closePublishSheet(true)">
        <text class="cancel-text">取消</text>
      </view>

      <view class="pub-title-box">
        <text class="pub-title">
          {{ currentPublishMode === 'emergency' ? '🚨 救命求助' : '贴便签' }}
        </text>
      </view>

      <view class="pub-action-btn-box">
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
          {{ currentPublishMode === 'emergency' ? '发送求助' : '贴上' }}
        </button>
      </view>
    </view>

    <!-- 2. 救命呼救模式警示横幅 -->
    <view v-if="currentPublishMode === 'emergency'" class="emergency-notice-banner">
      <text class="notice-icon">⚡</text>
      <text class="notice-text">紧急求助将在周边 500 米地图标红，并向附近邻友广播！</text>
    </view>

    <!-- 3. 滚动输入与选项区 -->
    <scroll-view scroll-y class="pub-scroll-area">
      <!-- 模式切换：键盘打字 / 真迹手写 -->
      <view v-if="currentPublishMode !== 'emergency'" class="pub-type-switcher-bar">
        <view
          class="pub-switch-pill"
          :class="{ 'pill-selected': !handwritingImg }"
          @tap="handwritingImg = ''"
        >
          <text class="pill-ico">📝</text>
          <text class="pill-txt">键盘便签</text>
        </view>
        <view
          class="pub-switch-pill"
          :class="{ 'pill-selected': !!handwritingImg }"
          @tap="showHandwritingPad = true"
        >
          <text class="pill-ico">✍️</text>
          <text class="pill-txt">真迹手写</text>
        </view>
      </view>

      <!-- 核心便签纸编辑卡片 (真实拟物纸张质感) -->
      <view class="note-canvas-card" :class="'paper-' + selectedPaperColor">
        <!-- 拟物和纸胶带 -->
        <view class="washi-tape-strip" />

        <!-- 手写真迹模式 -->
        <view v-if="handwritingImg" class="hw-preview-inner">
          <image class="hw-preview-img" :src="handwritingImg" mode="widthFix" />
          <view class="hw-preview-actions">
            <text class="hw-action-btn redo-btn" @tap="showHandwritingPad = true">✏️ 重新手写</text>
            <text class="hw-action-btn del-btn" @tap="handwritingImg = ''">✕ 清除</text>
          </view>
        </view>

        <!-- 普通文字输入模式 -->
        <view v-else class="note-input-inner">
          <textarea
            class="note-textarea"
            v-model="newPostContent"
            :placeholder="placeholderText"
            placeholder-class="note-placeholder"
            maxlength="500"
            :auto-height="true"
          />
        </view>

        <!-- 便签底色内嵌选择条 (告别占整行大表格的说明文字) -->
        <view class="note-card-toolbar">
          <view class="palette-group">
            <text class="palette-label">底色</text>
            <view class="palette-dots">
              <view
                v-for="c in paperColorList"
                :key="c.key"
                class="palette-dot"
                :class="['dot-' + c.key, { 'dot-active': selectedPaperColor === c.key }]"
                @tap="selectedPaperColor = c.key"
              />
            </view>
          </view>
          <text v-if="!handwritingImg" class="word-counter">{{ newPostContent.length }}/500</text>
        </view>
      </view>

      <!-- 街景与配图选择区 (九宫格) -->
      <view class="media-section">
        <view class="media-header">
          <text class="media-title">添加配图</text>
          <text class="media-sub">{{ pickedImages.length }}/9</text>
        </view>

        <view class="wechat-grid-media">
          <view
            v-for="(img, index) in pickedImages"
            :key="index"
            class="media-grid-item"
          >
            <image
              class="media-preview-img"
              :src="img"
              mode="aspectFill"
              @tap="previewImage(img, pickedImages)"
            />
            <view class="media-delete-btn" @tap.stop="removePickedImage(index)">✕</view>
          </view>

          <!-- 添加图片方块 (+) -->
          <view
            v-if="pickedImages.length < 9"
            class="media-grid-item add-box"
            @tap="chooseImages"
            hover-class="add-box-hover"
          >
            <text class="plus-icon">+</text>
          </view>
        </view>

        <!-- 极简快捷配图引导 -->
        <view v-if="pickedImages.length < 9" class="quick-sample-row">
          <view class="quick-sample-btn" @tap="addPresetSamplePhoto">
            <text class="sample-btn-txt">📸 快捷选用街景样例图</text>
          </view>
        </view>
      </view>

      <!-- 便签属性设置卡片 (精致分组列表) -->
      <view class="settings-card">
        <!-- 发布场景选择 -->
        <view class="settings-row">
          <text class="settings-label">发布场景</text>
          <view class="scene-segmented">
            <view
              class="scene-seg-item"
              :class="{ 'seg-active': currentPublishMode === 'moments' }"
              @tap="currentPublishMode = 'moments'"
            >
              <text>关注动态</text>
            </view>
            <view
              class="scene-seg-item"
              :class="{ 'seg-active': currentPublishMode === 'status' }"
              @tap="currentPublishMode = 'status'"
            >
              <text>地图便签</text>
            </view>
            <view
              class="scene-seg-item seg-emergency"
              :class="{ 'seg-active': currentPublishMode === 'emergency' }"
              @tap="currentPublishMode = 'emergency'"
            >
              <text>求助</text>
            </view>
          </view>
        </view>

        <!-- 紧急联系电话 (求助模式专属) -->
        <view v-if="currentPublishMode === 'emergency'" class="settings-row">
          <text class="settings-label">紧急电话</text>
          <input
            class="phone-input"
            v-model="helpContactPhone"
            placeholder="方便邻友联系的手机号"
            maxlength="11"
          />
        </view>

        <!-- 二次元动态开关 -->
        <view v-if="currentPublishMode !== 'emergency'" class="settings-row">
          <view class="label-with-hint">
            <text class="settings-label">🌸 二次元同好</text>
            <text class="settings-hint">漫展 / 吃谷 / 痛包 / 番剧</text>
          </view>
          <switch
            :checked="isAcgnPost"
            @change="isAcgnPost = $event.detail.value"
            color="#ec4899"
            class="compact-switch"
          />
        </view>

        <!-- 二次元细分标签展开区 -->
        <view v-if="currentPublishMode !== 'emergency' && isAcgnPost" class="acgn-subtags-section">
          <view class="subtags-pills-wrap">
            <view
              v-for="tag in ACGN_TAGS"
              :key="tag.name"
              class="acgn-pill"
              :class="{ 'acgn-pill-active': acgnTag === tag.name }"
              @tap="acgnTag = tag.name"
            >
              <text class="pill-emoji">{{ tag.emoji }}</text>
              <text class="pill-label">{{ tag.name }}</text>
            </view>
          </view>
        </view>

        <!-- 所在位置 -->
        <view class="settings-row cell-clickable">
          <text class="settings-label">所在位置</text>
          <view class="settings-value-box">
            <text class="settings-value">北京 · 500m 生活圈内</text>
            <text class="settings-arrow">›</text>
          </view>
        </view>

        <!-- 谁可以看 -->
        <view class="settings-row cell-clickable">
          <text class="settings-label">谁可以看</text>
          <view class="settings-value-box">
            <text class="settings-value">公开（周边 500 米内可见）</text>
            <text class="settings-arrow">›</text>
          </view>
        </view>

        <!-- 发布身份 -->
        <view class="settings-row cell-clickable" @tap="openMyProfileSheet">
          <text class="settings-label">发布身份</text>
          <view class="settings-value-box">
            <image class="author-mini-avatar" :src="myProfile.avatar" mode="aspectFill" />
            <text class="settings-value">{{ myProfile.name }}</text>
            <text class="settings-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="pub-bottom-safe-padding" />
    </scroll-view>

    <!-- 小刷子刷胶水拟物动效遮罩 -->
    <view v-if="isBrushingGlue" class="brush-glue-overlay">
      <view class="brush-hand-icon">🖌️</view>
      <view class="glue-streak" />
      <text class="brush-hint-text">正在粘贴便签...</text>
    </view>

    <!-- 真迹手写画板组件 -->
    <HandwritingPad
      v-if="showHandwritingPad"
      actionConfirmText="💌 保存并贴在便签上"
      :defaultPattern="selectedPaperColor"
      @confirm="onHandwritingConfirmed"
      @close="showHandwritingPad = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { NotePaperColor } from "../../types";
import { useAppState } from "../../composables/useAppState";
import { ACGN_TAG_CATEGORIES as ACGN_TAGS } from "../../constants/acgn";
import HandwritingPad from "../common/HandwritingPad.vue";

const {
  statusBarHeight, currentPublishMode, publishVisible, newPostContent, pickedImages,
  isPublishing, myProfile, helpContactPhone,
  isAcgnPost, acgnTag, selectedPaperColor,
  closePublishSheet, chooseImages, removePickedImage, previewImage, addPresetSamplePhoto,
  submitNewPost, submitHelpPost, openMyProfileSheet, switchMainTab
} = useAppState();

const isBrushingGlue = ref(false);
const showHandwritingPad = ref(false);
const handwritingImg = ref("");

function onHandwritingConfirmed(dataUrl: string) {
  showHandwritingPad.value = false;
  handwritingImg.value = dataUrl;
}

const paperColorList: { key: NotePaperColor; name: string }[] = [
  { key: "yellow", name: "鹅黄" },
  { key: "pink", name: "樱粉" },
  { key: "blue", name: "天蓝" },
  { key: "green", name: "薄荷绿" },
  { key: "kraft", name: "牛皮纸" }
];

const canSubmit = computed(() => {
  return !!newPostContent.value.trim() || pickedImages.value.length > 0 || !!handwritingImg.value;
});

const placeholderText = computed(() => {
  if (currentPublishMode.value === "emergency") {
    return "请详细描述您遇到的紧急求助情况及位置，周边 500 米邻友将收到广播警报...";
  }
  if (currentPublishMode.value === "status") {
    return "写下此刻周边的风景、心情或新鲜事，贴在 500 米地图上...";
  }
  return "这一刻在想什么，或是周围的新鲜事...";
});

async function handlePublish() {
  if (!canSubmit.value) return;

  isBrushingGlue.value = true;
  await new Promise(r => setTimeout(r, 600));

  try {
    if (handwritingImg.value) {
      if (!newPostContent.value.trim()) {
        newPostContent.value = handwritingImg.value;
      }
      if (!pickedImages.value.includes(handwritingImg.value)) {
        pickedImages.value.unshift(handwritingImg.value);
      }
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
  background-color: #f7f6f2;
  z-index: 120;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 极简顶栏 */
.wechat-pub-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #ffffff;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;

  .pub-cancel-btn {
    cursor: pointer;
    padding: 6px 4px;

    .cancel-text {
      font-size: 15px;
      color: #666666;
    }
  }

  .pub-title-box {
    .pub-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c2c2c;
    }
  }

  .pub-action-btn-box {
    .wechat-pub-btn {
      margin: 0;
      padding: 0 16px;
      height: 32px;
      line-height: 32px;
      background-color: #eae8e3;
      color: #b0aba4;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      transition: all 0.2s ease;

      &.btn-active {
        background-color: #3e2723;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(62, 39, 35, 0.2);
      }

      &.btn-emergency.btn-active {
        background-color: #e53e3e;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(229, 62, 62, 0.35);
      }
    }
  }
}

/* 救命提示条 */
.emergency-notice-banner {
  background-color: #fef2f2;
  border-bottom: 1px solid #fee2e2;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  .notice-icon { font-size: 14px; }
  .notice-text { font-size: 12px; color: #dc2626; font-weight: 600; }
}

/* 滚动区域 */
.pub-scroll-area {
  flex: 1;
  background-color: #f7f6f2;

  /* 模式切换胶囊 */
  .pub-type-switcher-bar {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px 4px;

    .pub-switch-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 16px;
      border-radius: 16px;
      background: #eae7e0;
      color: #7a736a;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;

      &.pill-selected {
        background: #ffffff;
        color: #3e2723;
        font-weight: 600;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      }
    }
  }

  /* 真实拟物便签纸卡片 */
  .note-canvas-card {
    margin: 10px 14px 14px;
    border-radius: 12px;
    padding: 18px 16px 12px;
    position: relative;
    box-shadow: 0 3px 12px rgba(62, 39, 35, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: background-color 0.25s ease, border-color 0.25s ease;

    &.paper-yellow { background-color: #fffdec; border-color: #faecc0; }
    &.paper-pink   { background-color: #fef2f4; border-color: #fad2dc; }
    &.paper-blue   { background-color: #f0f7fe; border-color: #cde4fa; }
    &.paper-green  { background-color: #f1f9f2; border-color: #d1ebd5; }
    &.paper-kraft  { background-color: #f5efe6; border-color: #ded1c1; }

    /* 拟物和纸胶带 */
    .washi-tape-strip {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 54px;
      height: 15px;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 2px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      border-left: 2px dashed rgba(0, 0, 0, 0.15);
      border-right: 2px dashed rgba(0, 0, 0, 0.15);
    }

    .note-input-inner {
      .note-textarea {
        width: 100%;
        min-height: 110px;
        font-size: 16px;
        line-height: 1.6;
        color: #2c2420;
        border: none;
        background: transparent;
        box-sizing: border-box;
      }

      .note-placeholder {
        color: #aba29a;
        font-size: 15px;
      }
    }

    /* 真迹预览 */
    .hw-preview-inner {
      display: flex;
      flex-direction: column;
      align-items: center;

      .hw-preview-img {
        width: 100%;
        border-radius: 4px;
        object-fit: contain;
      }

      .hw-preview-actions {
        display: flex;
        gap: 12px;
        margin-top: 10px;

        .hw-action-btn {
          font-size: 12px;
          padding: 4px 12px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.06);
          color: #4e342e;
          font-weight: 500;
          cursor: pointer;

          &.del-btn {
            color: #d32f2f;
            background: #ffebee;
          }
        }
      }
    }

    /* 便签卡片底部内嵌工具条 */
    .note-card-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed rgba(0, 0, 0, 0.08);

      .palette-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .palette-label {
          font-size: 12px;
          color: #8c827a;
        }

        .palette-dots {
          display: flex;
          align-items: center;
          gap: 8px;

          .palette-dot {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            cursor: pointer;
            box-sizing: border-box;
            border: 1.5px solid transparent;
            transition: all 0.15s ease;

            &.dot-active {
              border-color: #3e2723;
              transform: scale(1.15);
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
            }

            &.dot-yellow { background-color: #fde047; }
            &.dot-pink   { background-color: #f472b6; }
            &.dot-blue   { background-color: #60a5fa; }
            &.dot-green  { background-color: #4ade80; }
            &.dot-kraft  { background-color: #d4a373; }
          }
        }
      }

      .word-counter {
        font-size: 11px;
        color: #aba29a;
      }
    }
  }

  /* 配图区域 */
  .media-section {
    background: #ffffff;
    margin: 0 14px 12px;
    border-radius: 12px;
    padding: 14px 14px 12px;
    border: 1px solid rgba(0, 0, 0, 0.04);

    .media-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .media-title {
        font-size: 14px;
        font-weight: 600;
        color: #333333;
      }

      .media-sub {
        font-size: 12px;
        color: #999999;
      }
    }

    .wechat-grid-media {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .media-grid-item {
        width: calc((100% - 16px) / 3);
        aspect-ratio: 1 / 1;
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        background-color: #f5f5f5;

        .media-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-delete-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.55);
          color: #ffffff;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        &.add-box {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1.5px dashed #d5d5d5;
          background: #fafafa;

          .plus-icon {
            font-size: 28px;
            color: #b0b0b0;
            font-weight: 300;
          }

          &.add-box-hover {
            background-color: #f0f0f0;
          }
        }
      }
    }

    .quick-sample-row {
      margin-top: 10px;

      .quick-sample-btn {
        display: inline-flex;
        padding: 5px 12px;
        border-radius: 14px;
        background: #f4f6f9;
        cursor: pointer;

        .sample-btn-txt {
          font-size: 12px;
          color: #576b95;
        }
      }
    }
  }

  /* 设置列表卡片 */
  .settings-card {
    background: #ffffff;
    margin: 0 14px 16px;
    border-radius: 12px;
    padding: 2px 14px;
    border: 1px solid rgba(0, 0, 0, 0.04);

    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 13px 0;
      border-bottom: 0.5px solid #f2f2f2;

      &:last-child {
        border-bottom: none;
      }

      &.cell-clickable {
        cursor: pointer;
      }

      .settings-label {
        font-size: 14px;
        color: #333333;
        font-weight: 500;
      }

      .label-with-hint {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .settings-hint {
          font-size: 11px;
          color: #ec4899;
        }
      }

      .compact-switch {
        transform: scale(0.8);
        transform-origin: right center;
      }

      .phone-input {
        font-size: 13px;
        text-align: right;
        color: #333333;
        width: 170px;
      }

      .settings-value-box {
        display: flex;
        align-items: center;
        gap: 6px;

        .author-mini-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
        }

        .settings-value {
          font-size: 13px;
          color: #888888;
        }

        .settings-arrow {
          font-size: 16px;
          color: #cccccc;
        }
      }

      .scene-segmented {
        display: flex;
        gap: 6px;

        .scene-seg-item {
          padding: 4px 10px;
          border-radius: 12px;
          background: #f3f3f3;
          font-size: 12px;
          color: #666666;
          cursor: pointer;
          transition: all 0.15s ease;

          &.seg-active {
            background: #3e2723;
            color: #ffffff;
            font-weight: 500;
          }

          &.seg-emergency.seg-active {
            background: #e53e3e;
            color: #ffffff;
          }
        }
      }
    }

    .acgn-subtags-section {
      padding: 6px 0 12px;
      border-bottom: 0.5px solid #f2f2f2;

      .subtags-pills-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .acgn-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 12px;
          background-color: #fdf2f8;
          border: 1px solid #fbcfe8;
          cursor: pointer;

          .pill-emoji { font-size: 12px; }
          .pill-label { font-size: 11px; color: #be185d; }

          &.acgn-pill-active {
            background-color: #ec4899;
            border-color: #db2777;
            .pill-label { color: #ffffff; font-weight: 600; }
          }
        }
      }
    }
  }

  .pub-bottom-safe-padding {
    height: 40px;
  }
}

/* 刷浆糊拟物动效遮罩 */
.brush-glue-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);

  .brush-hand-icon {
    font-size: 44px;
    animation: brush-stroke 0.6s ease-in-out infinite alternate;
  }

  .glue-streak {
    width: 140px;
    height: 10px;
    background: linear-gradient(90deg, rgba(255, 235, 59, 0.8), rgba(255, 152, 0, 0.8));
    border-radius: 5px;
    margin-top: 12px;
    box-shadow: 0 0 14px rgba(255, 193, 7, 0.6);
  }

  .brush-hint-text {
    font-size: 14px;
    color: #fff;
    font-weight: 600;
    margin-top: 14px;
  }
}

@keyframes brush-stroke {
  0% { transform: translate(-18px, 0) rotate(-15deg); }
  100% { transform: translate(18px, 0) rotate(15deg); }
}
</style>
