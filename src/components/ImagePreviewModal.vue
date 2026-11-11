<template>
  <view
    v-if="imagePreviewVisible"
    class="image-preview-modal"
    @tap="closeImagePreview"
  >
    <!-- 顶栏: 微信经典计数器 + 关闭按钮 -->
    <view class="preview-header" @tap.stop>
      <view class="header-left" @tap="closeImagePreview">
        <text class="close-icon">✕</text>
      </view>
      <view class="header-center">
        <text v-if="imagePreviewUrls.length > 1" class="page-indicator">
          {{ imagePreviewIndex + 1 }} / {{ imagePreviewUrls.length }}
        </text>
        <text v-else class="page-indicator">图片预览</text>
      </view>
      <view class="header-right"></view>
    </view>

    <!-- 主展示区: 微信原生滑动查看与高清居中呈现 -->
    <view class="preview-body" @tap="closeImagePreview">
      <swiper
        class="preview-swiper"
        :current="imagePreviewIndex"
        :duration="250"
        @change="onSwiperChange"
      >
        <swiper-item
          v-for="(url, idx) in imagePreviewUrls"
          :key="idx"
          class="swiper-slide"
        >
          <view class="image-wrapper" @tap="closeImagePreview">
            <image
              class="lightbox-image"
              :src="url"
              mode="aspectFit"
              @tap.stop="closeImagePreview"
            />
          </view>
        </swiper-item>
      </swiper>

      <!-- 桌面端贴心悬浮左右切换箭头 (多图时展示) -->
      <view
        v-if="imagePreviewUrls.length > 1 && imagePreviewIndex > 0"
        class="nav-arrow nav-prev"
        @tap.stop="prevImage"
      >
        ‹
      </view>
      <view
        v-if="imagePreviewUrls.length > 1 && imagePreviewIndex < imagePreviewUrls.length - 1"
        class="nav-arrow nav-next"
        @tap.stop="nextImage"
      >
        ›
      </view>
    </view>

    <!-- 底栏: 微信沉浸式操作指引 -->
    <view class="preview-footer" @tap.stop>
      <text class="footer-tip">轻触任意位置退出预览</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppState } from "../composables/useAppState";

const {
  imagePreviewVisible,
  imagePreviewUrls,
  imagePreviewIndex,
  closeImagePreview,
  setImagePreviewIndex,
} = useAppState();

function onSwiperChange(e: any) {
  const current = e.detail?.current;
  if (typeof current === "number") {
    setImagePreviewIndex(current);
  }
}

function prevImage() {
  if (imagePreviewIndex.value > 0) {
    setImagePreviewIndex(imagePreviewIndex.value - 1);
  }
}

function nextImage() {
  if (imagePreviewIndex.value < imagePreviewUrls.value.length - 1) {
    setImagePreviewIndex(imagePreviewIndex.value + 1);
  }
}
</script>

<style lang="scss" scoped>
.image-preview-modal {
  position: absolute;
  inset: 0;
  z-index: 99999;
  background-color: #000000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .preview-header {
    height: calc(50px + env(safe-area-inset-top, 0px));
    padding-top: env(safe-area-inset-top, 0px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 16px;
    padding-right: 16px;
    z-index: 10;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 100%);

    .header-left {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      cursor: pointer;

      .close-icon {
        color: #ffffff;
        font-size: 20px;
        font-weight: 300;
        opacity: 0.85;
      }
    }

    .header-center {
      flex: 1;
      text-align: center;

      .page-indicator {
        color: #ffffff;
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 1px;
        opacity: 0.9;
      }
    }

    .header-right {
      width: 44px;
      height: 44px;
    }
  }

  .preview-body {
    flex: 1;
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .preview-swiper {
      width: 100%;
      height: 100%;

      .swiper-slide {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .image-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          box-sizing: border-box;

          .lightbox-image {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
        }
      }
    }

    .nav-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: background 0.15s ease;
      z-index: 20;

      &:hover {
        background: rgba(255, 255, 255, 0.4);
      }

      &.nav-prev {
        left: 12px;
        padding-bottom: 3px;
      }

      &.nav-next {
        right: 12px;
        padding-bottom: 3px;
      }
    }
  }

  .preview-footer {
    height: calc(48px + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 100%);

    .footer-tip {
      color: rgba(255, 255, 255, 0.55);
      font-size: 12px;
      letter-spacing: 0.5px;
    }
  }
}
</style>
