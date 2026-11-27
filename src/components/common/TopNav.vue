<template>
  <!-- 列表流模式：隐藏搜索框与标签栏，仅保留右上角极简「返回地图」悬浮按钮 -->
  <view v-if="mapSubTab !== 'map'" class="moments-back-map-wrap" :style="{ top: (statusBarHeight + 12) + 'px' }">
    <view class="moments-back-map-pill" @tap="toggleViewMode">
      <svg class="pill-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/>
        <line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
      <text class="pill-txt">地图</text>
    </view>
  </view>

  <!-- 地图模式：精致一体化搜索栏 + 极简标签筛选条 -->
  <view v-else class="pure-top-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav-glass-bar">
      <!-- 地标与便签搜索框 (定制线框搜索图标 + 修正 H5 输入框字号) -->
      <view class="nav-search-box">
        <svg class="search-svg" viewBox="0 0 24 24" fill="none" stroke="#8D7B6C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          class="search-inp"
          v-model="mapSearchKeyword"
          placeholder="搜索地标（如丽江）或便签"
          placeholder-style="font-size: 13px; color: #A09284;"
          confirm-type="search"
          @focus="showSuggestions = true"
          @confirm="handleSearchConfirm"
        />
        <text v-if="mapSearchKeyword" class="clear-ico" @tap="clearSearch">✕</text>
      </view>

      <!-- 若正在远方漫游，显示返回当前位置小胶囊 -->
      <view v-if="activeLandmark" class="roaming-back-pill" @tap="exitRoamingToLocal">
        <text class="roam-txt">{{ activeLandmark.city }} · 返回</text>
      </view>

      <!-- 右侧：定制线框 SVG 切换为列表流 -->
      <view class="view-switch-btn" @tap="toggleViewMode">
        <svg class="switch-svg" viewBox="0 0 24 24" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      </view>
    </view>

    <!-- 搜索联想下拉抽屉 (快速选丽江等地标) -->
    <view v-if="showSuggestions && filteredLandmarks.length > 0" class="search-suggest-panel">
      <view class="suggest-header">
        <text class="suggest-title">探索远方地标</text>
        <text class="suggest-close" @tap="showSuggestions = false">收起</text>
      </view>
      <view
        v-for="lm in filteredLandmarks"
        :key="lm.id"
        class="suggest-item"
        @tap="selectLandmark(lm)"
      >
        <view class="suggest-left">
          <text class="suggest-name">{{ lm.name }}</text>
          <text class="suggest-desc">{{ lm.desc }}</text>
        </view>
        <text class="suggest-go">去看看 ›</text>
      </view>
    </view>

    <!-- 极简克制兴趣标签筛选条 (去杂乱 Emoji，统一手账胶囊质感) -->
    <scroll-view scroll-x class="interest-filter-strip" :show-scrollbar="false">
      <view class="filter-pills-row">
        <view
          v-for="tag in filterTags"
          :key="tag.value"
          class="filter-pill"
          :class="{ 'pill-active': selectedInterestTag === tag.value }"
          @tap="selectedInterestTag = tag.value"
        >
          <text class="pill-label">{{ tag.label }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { InterestTag, LandmarkPreset } from "../../types";
import { useAppState } from "../../composables/useAppState";

const {
  statusBarHeight,
  mapSubTab,
  mapSearchKeyword,
  activeLandmark,
  selectedInterestTag,
  LANDMARK_PRESETS,
  searchAndJumpToLandmark,
  jumpToLandmark,
  exitRoamingToLocal,
} = useAppState();

const showSuggestions = ref(false);

const filterTags: { value: InterestTag | '全部'; label: string; icon: string }[] = [
  { value: '全部', label: '全部', icon: '✨' },
  { value: '宠物', label: '宠物', icon: '🐾' },
  { value: '二次元', label: '二次元', icon: '🌸' },
  { value: '风景', label: '风景', icon: '🏔️' },
  { value: '极限运动', label: '极限运动', icon: '🏂' },
];

const filteredLandmarks = computed(() => {
  const kw = mapSearchKeyword.value.trim().toLowerCase();
  if (!kw) return LANDMARK_PRESETS;
  return LANDMARK_PRESETS.filter(
    (lm) =>
      lm.name.toLowerCase().includes(kw) ||
      lm.city.toLowerCase().includes(kw) ||
      lm.desc.toLowerCase().includes(kw)
  );
});

function handleSearchConfirm() {
  showSuggestions.value = false;
  if (mapSearchKeyword.value.trim()) {
    searchAndJumpToLandmark(mapSearchKeyword.value.trim());
  }
}

function selectLandmark(lm: LandmarkPreset) {
  showSuggestions.value = false;
  mapSearchKeyword.value = lm.city;
  jumpToLandmark(lm);
}

function clearSearch() {
  mapSearchKeyword.value = "";
  showSuggestions.value = false;
  if (activeLandmark.value) {
    exitRoamingToLocal();
  }
}

function toggleViewMode() {
  mapSubTab.value = mapSubTab.value === 'map' ? 'moments' : 'map';
}
</script>

<style lang="scss" scoped>
.pure-top-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 8px 12px 4px;
  pointer-events: none;
}

.nav-glass-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  background: rgba(255, 253, 248, 0.94);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-radius: 22px;
  padding: 0 6px 0 12px;
  box-shadow: 0 6px 20px rgba(62, 39, 35, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(218, 204, 184, 0.85);
  pointer-events: auto;
  box-sizing: border-box;
}

.nav-search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 32px;
  background: transparent;
  min-width: 0;

  .search-svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }

  .search-inp {
    flex: 1;
    height: 28px;
    line-height: 28px;
    font-size: 13px;
    color: #3e2723;
    border: none;
    background: transparent;
    min-width: 0;

    :deep(input) {
      font-size: 13px !important;
      color: #3e2723 !important;
    }
  }

  .clear-ico {
    font-size: 12px;
    color: #8d6e63;
    padding: 0 6px;
    cursor: pointer;
  }
}

.roaming-back-pill {
  background: #fff3e0;
  border: 1px solid #f5c07a;
  border-radius: 14px;
  padding: 4px 8px;
  cursor: pointer;
  flex-shrink: 0;

  .roam-txt {
    font-size: 11px;
    font-weight: 700;
    color: #c25b38;
    white-space: nowrap;
  }
}

.view-switch-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fffdf8;
  border: 1px solid #e0d8cc;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(62, 39, 35, 0.06);
  cursor: pointer;
  flex-shrink: 0;

  .switch-icon {
    font-size: 15px;
  }
}

.search-suggest-panel {
  margin-top: 6px;
  background: rgba(255, 253, 248, 0.97);
  backdrop-filter: blur(18px);
  border-radius: 16px;
  padding: 10px 12px;
  box-shadow: 0 10px 28px rgba(62, 39, 35, 0.14);
  border: 1px solid #e7dfd2;
  pointer-events: auto;

  .suggest-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    padding-bottom: 6px;
    border-bottom: 0.5px dashed #e2d8c8;

    .suggest-title {
      font-size: 11px;
      font-weight: 700;
      color: #8d6e63;
    }

    .suggest-close {
      font-size: 11px;
      color: #a1887f;
      cursor: pointer;
    }
  }

  .suggest-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 4px;
    border-bottom: 0.5px solid rgba(226, 216, 200, 0.45);
    cursor: pointer;

    &:last-child {
      border-bottom: none;
    }

    .suggest-left {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .suggest-name {
        font-size: 13px;
        font-weight: 600;
        color: #3e2723;
      }

      .suggest-desc {
        font-size: 11px;
        color: #8d6e63;
      }
    }

    .suggest-go {
      font-size: 11px;
      font-weight: 600;
      color: #c25b38;
      background: #fff3e0;
      padding: 3px 8px;
      border-radius: 10px;
    }
  }
}

.interest-filter-strip {
  margin-top: 8px;
  width: 100%;
  white-space: nowrap;
  pointer-events: auto;
}

.filter-pills-row {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 1px 2px;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 13px;
  border-radius: 14px;
  background: rgba(255, 253, 248, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(218, 204, 184, 0.85);
  box-shadow: 0 3px 10px rgba(62, 39, 35, 0.07);
  cursor: pointer;
  transition: all 0.18s ease;

  .pill-label {
    font-size: 12px;
    font-weight: 600;
    color: #5d4037;
    letter-spacing: 0.2px;
  }

  &.pill-active {
    background: #3e2723;
    border-color: #3e2723;
    box-shadow: 0 4px 12px rgba(62, 39, 35, 0.22);

    .pill-label {
      color: #fffdf8;
    }
  }
}
.switch-svg {
  width: 16px;
  height: 16px;
}

.moments-back-map-wrap {
  position: absolute;
  right: 14px;
  z-index: 55;
}

.moments-back-map-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 18px;
  background: rgba(255, 253, 248, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 0.5px solid rgba(226, 217, 204, 0.9);
  box-shadow: 0 4px 14px rgba(44, 34, 26, 0.16);
  color: #3e2723;
  cursor: pointer;

  .pill-svg {
    width: 14px;
    height: 14px;
  }

  .pill-txt {
    font-size: 12px;
    font-weight: 700;
    color: #3e2723;
  }
}
</style>
