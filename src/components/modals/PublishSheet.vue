<template>
  <view v-if="publishVisible" class="wechat-publish-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 1. 微信朋友圈标准顶栏: 取消 (左) | 居中标题 | 发表 (右) -->
    <view class="wechat-pub-header">
      <view class="pub-cancel-btn" @tap="closePublishSheet(true)">
        <text class="cancel-text">取消</text>
      </view>

      <view class="pub-title-box">
        <text class="pub-title">
          {{ currentPublishMode === 'emergency' ? '🚨 救命/急事呼救' : '🖌️ 小刷子刷浆糊 · 贴便签' }}
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
          {{ currentPublishMode === 'emergency' ? '发送呼救' : '🖌️ 刷浆糊，贴上地图' }}
        </button>
      </view>
    </view>

    <!-- 2. 救命呼救模式醒目提示条 -->
    <view v-if="currentPublishMode === 'emergency'" class="emergency-notice-banner">
      <text class="notice-icon">⚡</text>
      <text class="notice-text">救命求助将在 500m 地图打上特大红色警报，并向周边邻友全站闪烁广播！</text>
    </view>

    <!-- 3. 滚动输入与选项区 -->
    <scroll-view scroll-y class="pub-scroll-area">
      <!-- 手写真迹 / 键盘文字便签模式快速切换栏 -->
      <view v-if="currentPublishMode !== 'emergency'" class="pub-type-switcher-bar">
        <view
          class="pub-switch-pill"
          :class="{ 'pill-selected': !handwritingImg }"
          @tap="handwritingImg = ''"
        >
          <text class="pill-ico">⌨️</text>
          <text class="pill-txt">键盘文字便签</text>
        </view>
        <view
          class="pub-switch-pill"
          :class="{ 'pill-selected': !!handwritingImg }"
          @tap="showHandwritingPad = true"
        >
          <text class="pill-ico">✍️</text>
          <text class="pill-txt">真迹手写纸条</text>
        </view>
      </view>

      <!-- 如果已手写，展示真迹纸条与和纸胶带预览 -->
      <view v-if="handwritingImg" class="hw-preview-box" :class="'paper-' + selectedPaperColor">
        <view class="washi-tape-strip" />
        <image class="hw-preview-img" :src="handwritingImg" mode="widthFix" />
        <view class="hw-preview-actions">
          <text class="hw-action-btn redo-btn" @tap="showHandwritingPad = true">✏️ 重新手写</text>
          <text class="hw-action-btn del-btn" @tap="handwritingImg = ''">✕ 清除真迹</text>
        </view>
      </view>

      <!-- 键盘普通文字输入区 -->
      <view v-else class="wechat-textarea-box">
        <textarea
          class="wechat-textarea"
          v-model="newPostContent"
          :placeholder="placeholderText"
          placeholder-class="wechat-pub-placeholder"
          maxlength="500"
          :auto-height="true"
        />
        <view class="quick-hw-trigger-row" @tap="showHandwritingPad = true">
          <text class="quick-hw-link">✍️ 想要亲手写字？点击进入真迹手写绘板 ›</text>
        </view>
      </view>

      <!-- 微信标准九宫格图片选择器 -->
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
          <svg class="plus-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </view>
      </view>

      <!-- 快速填入精选街景配图 (方便免选图快捷测试与发布) -->
      <view v-if="pickedImages.length < 9" class="quick-sample-row">
        <text class="quick-sample-btn" @tap="addPresetSamplePhoto">📸 快捷添加街景美图</text>
        <text class="quick-sample-tip">(已选 {{ pickedImages.length }}/9，点击图片可放大预览)</text>
      </view>

      <!-- 微信朋友圈经典列表功能行 (Hairline 分割线) -->
      <view class="wechat-meta-rows">
        <!-- 行 1: 发布类型三档切换 (发朋友圈 / 发状态 / 救命呼救) -->
        <view class="wechat-cell-row">
          <view class="row-left">
            <text class="cell-icon">🏷️</text>
            <text class="cell-label">发布类型</text>
          </view>
          <view class="row-right mode-switcher-box">
            <view
              class="mode-pill"
              :class="{ 'pill-active': currentPublishMode === 'moments' }"
              @tap="currentPublishMode = 'moments'"
            >
              <text class="pill-text">📷 关注动态</text>
            </view>
            <view
              class="mode-pill"
              :class="{ 'pill-active': currentPublishMode === 'status' }"
              @tap="currentPublishMode = 'status'"
            >
              <text class="pill-text">📍 地图动态</text>
            </view>
            <view
              class="mode-pill pill-emergency"
              :class="{ 'pill-active': currentPublishMode === 'emergency' }"
              @tap="currentPublishMode = 'emergency'"
            >
              <text class="pill-text">🚨 救命呼救</text>
            </view>
          </view>
        </view>

        <!-- 便签底色选择 (小纸条/小便签拟物风格) -->
        <view class="wechat-cell-row">
          <view class="row-left">
            <text class="cell-icon">🎨</text>
            <view class="acgn-label-col">
              <text class="cell-label">便签贴纸色彩</text>
              <text class="acgn-sub-tip">挑选属于此地心情的彩纸底色</text>
            </view>
          </view>
          <view class="row-right color-palette-chips">
            <view
              v-for="c in paperColorList"
              :key="c.key"
              class="paper-dot"
              :class="['dot-' + c.key, { 'dot-active': selectedPaperColor === c.key }]"
              @tap="selectedPaperColor = c.key"
            />
          </view>
        </view>

        <!-- 行 1.5: 标注为二次元动态 -->
        <view v-if="currentPublishMode !== 'emergency'" class="wechat-cell-row acgn-toggle-row">
          <view class="row-left">
            <text class="cell-icon">🌸</text>
            <view class="acgn-label-col">
              <text class="cell-label">标注为二次元动态</text>
              <text class="acgn-sub-tip">Cosplay · 漫展 · 吃谷 · 番剧同好</text>
            </view>
          </view>
          <view class="row-right">
            <switch
              :checked="isAcgnPost"
              @change="isAcgnPost = $event.detail.value"
              color="#ec4899"
              class="wechat-switch"
            />
          </view>
        </view>

        <!-- 二次元细分标签选择区 -->
        <view v-if="currentPublishMode !== 'emergency' && isAcgnPost" class="acgn-subtags-section">
          <view class="subtags-heading">
            <text class="subtags-title">选择二次元细分同好标签：</text>
          </view>
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

        <!-- 行 2: 救命求助专属 - 紧急联系电话 -->
        <view v-if="currentPublishMode === 'emergency'" class="wechat-cell-row">
          <view class="row-left">
            <text class="cell-icon">📱</text>
            <text class="cell-label">紧急联系电话</text>
          </view>
          <view class="row-right">
            <input
              class="phone-input"
              v-model="helpContactPhone"
              placeholder="请输入方便联系的手机号..."
              maxlength="11"
            />
          </view>
        </view>

        <!-- 行 3: 所在位置 (显示当前 500m 中心点与地理标记) -->
        <view class="wechat-cell-row">
          <view class="row-left">
            <text class="cell-icon">📍</text>
            <text class="cell-label">所在位置</text>
          </view>
          <view class="row-right">
            <text class="cell-value">北京 · 当前中心点 500m 内</text>
            <text class="cell-arrow">›</text>
          </view>
        </view>

        <!-- 行 4: 谁可以看 -->
        <view class="wechat-cell-row">
          <view class="row-left">
            <text class="cell-icon">👥</text>
            <text class="cell-label">谁可以看</text>
          </view>
          <view class="row-right">
            <text class="cell-value">公开（周边500米邻友可见）</text>
            <text class="cell-arrow">›</text>
          </view>
        </view>

        <!-- 行 5: 发布身份 -->
        <view class="wechat-cell-row" @tap="openMyProfileSheet">
          <view class="row-left">
            <image class="author-mini-avatar" :src="myProfile.avatar" mode="aspectFill" />
            <text class="cell-label">以我的身份发布</text>
          </view>
          <view class="row-right">
            <text class="cell-value">{{ myProfile.name }}</text>
            <text class="cell-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="pub-bottom-safe-padding" />
    </scroll-view>

    <!-- 小刷子刷胶水拟物动效遮罩 -->
    <view v-if="isBrushingGlue" class="brush-glue-overlay">
      <view class="brush-hand-icon">🖌️</view>
      <view class="glue-streak" />
      <text class="brush-hint-text">小刷子正在刷胶水粘贴便签...</text>
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
    return "请详细描述您遇到的紧急危急情况、具体位置及所需救助，周边 500 米邻友将第一时间收到全站警报广播...";
  }
  if (currentPublishMode.value === "status") {
    return "写下此刻周边的风景、心情或新鲜事... (发布后将在 500 米地图自动打点)";
  }
  return "这一刻的想法...";
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
  background-color: #ffffff;
  z-index: 120;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 微信顶栏 */
.wechat-pub-header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #ffffff;
  border-bottom: 0.5px solid #ededed;
  flex-shrink: 0;

  .pub-cancel-btn {
    cursor: pointer;
    padding: 6px 0;

    .cancel-text {
      font-size: 16px;
      color: #191919;
    }
  }

  .pub-title-box {
    .pub-title {
      font-size: 16px;
      font-weight: 600;
      color: #191919;
    }
  }

  .pub-action-btn-box {
    .wechat-pub-btn {
      margin: 0;
      padding: 0 16px;
      height: 32px;
      line-height: 32px;
      background-color: #e2e8f0;
      color: #94a3b8;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      transition: all 0.2s ease;

      &.btn-active {
        background-color: #07c160;
        color: #ffffff;
      }

      &.btn-emergency.btn-active {
        background-color: #fa5151;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(250, 81, 81, 0.35);
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
  background-color: #ffffff;

  /* 手写 / 打字模式切换 */
  .pub-type-switcher-bar {
    display: flex;
    gap: 10px;
    padding: 12px 20px 4px;

    .pub-switch-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      border-radius: 16px;
      background: #f1f5f9;
      color: #64748b;
      font-size: 13px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;

      &.pill-selected {
        background: #fff8e1;
        color: #d97706;
        border-color: #ffd54f;
        font-weight: 700;
        box-shadow: 0 2px 6px rgba(245, 158, 11, 0.15);
      }
    }
  }

  /* 真迹手写纸条预览卡片 */
  .hw-preview-box {
    margin: 14px 20px 16px;
    border-radius: 8px;
    padding: 20px 14px 12px;
    position: relative;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;

    .washi-tape-strip {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 14px;
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
      border-left: 1.5px dashed rgba(0, 0, 0, 0.2);
      border-right: 1.5px dashed rgba(0, 0, 0, 0.2);
    }

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
        background: rgba(0, 0, 0, 0.08);
        color: #4e342e;
        font-weight: 600;
        cursor: pointer;

        &.del-btn {
          color: #d32f2f;
          background: #ffebee;
        }
      }
    }
  }

  .quick-hw-trigger-row {
    padding: 8px 0;
    cursor: pointer;

    .quick-hw-link {
      font-size: 12px;
      color: #d97706;
      font-weight: 600;
    }
  }

  /* 微信大输入框 */
  .wechat-textarea-box {
    padding: 16px 20px 8px;

    .wechat-textarea {
      width: 100%;
      min-height: 120px;
      font-size: 16px;
      line-height: 1.5;
      color: #191919;
      border: none;
      box-sizing: border-box;
    }

    .wechat-pub-placeholder {
      color: #b2b2b2;
      font-size: 16px;
    }
  }

  /* 微信九宫格媒体 */
  .wechat-grid-media {
    padding: 8px 20px 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .media-grid-item {
      width: calc((100% - 20px) / 3);
      aspect-ratio: 1 / 1;
      position: relative;
      border-radius: 6px;
      overflow: hidden;
      background-color: #f7f7f7;

      .media-preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .media-delete-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.6);
        color: #ffffff;
        font-size: 12px;
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
        border: 1px dashed #dcdcdc;

        .plus-svg {
          width: 36px;
          height: 36px;
          color: #b2b2b2;
        }

        &.add-box-hover {
          background-color: #ececec;
        }
      }
    }

    .quick-sample-row {
      margin-top: 10px;
      display: flex;
      align-items: center;
      gap: 8px;

      .quick-sample-btn {
        font-size: 12px;
        color: #576B95;
        background: #f2f5f9;
        padding: 4px 10px;
        border-radius: 12px;
        cursor: pointer;
        transition: background 0.15s ease;

        &:active {
          background: #e2eaf5;
        }
      }

      .quick-sample-tip {
        font-size: 11px;
        color: #999999;
      }
    }
  }

  /* 微信朋友圈功能列表行 */
  .wechat-meta-rows {
    border-top: 8px solid #f7f7f7;
    background-color: #ffffff;

    .wechat-cell-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 0.5px solid #ededed;
      cursor: pointer;

      &:active {
        background-color: #fcfcfc;
      }

      .row-left {
        display: flex;
        align-items: center;
        gap: 10px;

        .cell-icon { font-size: 18px; }
        .cell-label { font-size: 15px; color: #191919; font-weight: 500; }

        .author-mini-avatar {
          width: 24px;
          height: 24px;
          border-radius: 4px;
        }
      }

      .row-right {
        display: flex;
        align-items: center;
        gap: 6px;

        .cell-value {
          font-size: 13px;
          color: #7f7f7f;
        }

        .cell-arrow {
          font-size: 18px;
          color: #b2b2b2;
        }

        .phone-input {
          font-size: 14px;
          color: #191919;
          text-align: right;
          width: 180px;
        }

        &.mode-switcher-box {
          display: flex;
          gap: 6px;

          .mode-pill {
            padding: 4px 10px;
            border-radius: 14px;
            background-color: #f1f5f9;
            border: 0.5px solid #e2e8f0;
            cursor: pointer;

            .pill-text {
              font-size: 11px;
              color: #64748b;
              font-weight: 500;
            }

            &.pill-active {
              background-color: #07c160;
              border-color: #07c160;
              .pill-text { color: #ffffff; font-weight: 600; }
            }

            &.pill-emergency.pill-active {
              background-color: #fa5151;
              border-color: #fa5151;
            }
          }
        }
      }

      &.acgn-toggle-row {
        .acgn-label-col {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .acgn-sub-tip {
            font-size: 11px;
            color: #ec4899;
          }
        }

        .wechat-switch {
          transform: scale(0.85);
          transform-origin: right center;
        }
      }
    }

    .acgn-subtags-section {
      background-color: #fdf2f8;
      border-bottom: 0.5px solid #fbcfe8;
      padding: 10px 20px 14px;

      .subtags-heading {
        margin-bottom: 8px;

        .subtags-title {
          font-size: 12px;
          color: #be185d;
          font-weight: 500;
        }
      }

      .subtags-pills-wrap {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .acgn-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 16px;
          background-color: #ffffff;
          border: 1px solid #f472b6;
          cursor: pointer;
          transition: all 0.15s ease;

          .pill-emoji {
            font-size: 13px;
          }

          .pill-label {
            font-size: 12px;
            color: #9d174d;
            font-weight: 500;
          }

          &.acgn-pill-active {
            background-color: #ec4899;
            border-color: #db2777;

            .pill-label {
              color: #ffffff;
              font-weight: 600;
            }
          }
        }
      }
    }
  }

  .pub-bottom-safe-padding {
    height: 40px;
  }
}

.color-palette-chips {
  display: flex;
  gap: 10px;
}

.paper-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.15s;
}

.dot-active {
  border-color: #3e2723;
  transform: scale(1.2);
}

.dot-yellow { background-color: #fff59d; }
.dot-pink   { background-color: #f8bbd0; }
.dot-blue   { background-color: #b3e5fc; }
.dot-green  { background-color: #c8e6c9; }
.dot-kraft  { background-color: #d7ccc8; }

.brush-glue-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.brush-hand-icon {
  font-size: 48px;
  animation: brush-stroke 0.6s ease-in-out infinite alternate;
}

.glue-streak {
  width: 160px;
  height: 12px;
  background: linear-gradient(90deg, rgba(255, 235, 59, 0.8), rgba(255, 152, 0, 0.8));
  border-radius: 6px;
  margin-top: 14px;
  box-shadow: 0 0 16px rgba(255, 193, 7, 0.6);
}

.brush-hint-text {
  font-size: 14px;
  color: #fff;
  font-weight: bold;
  margin-top: 16px;
}

@keyframes brush-stroke {
  0% { transform: translate(-20px, 0) rotate(-15deg); }
  100% { transform: translate(20px, 0) rotate(15deg); }
}
</style>
