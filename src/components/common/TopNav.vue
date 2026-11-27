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

  <!-- 地图模式：保留搜索框 + 兴趣标签筛选条 + 切换列表流按钮 -->
  <view v-else class="pure-top-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav-glass-bar">
      <!-- 地标与便签搜索框 (支持搜索丽江等城市地标) -->
      <view class="nav-search-box">
        <text class="search-ico">🔍</text>
        <input
          class="search-inp"
          v-model="mapSearchKeyword"
          placeholder="搜索地标（如丽江）或便签..."
          confirm-type="search"
          @focus="showSuggestions = true"
          @confirm="handleSearchConfirm"
        />
        <text v-if="mapSearchKeyword" class="clear-ico" @tap="clearSearch">✕</text>
      </view>

      <!-- 若正在远方漫游，显示返回当前位置小胶囊 -->
      <view v-if="activeLandmark" class="roaming-back-pill" @tap="exitRoamingToLocal">
        <text class="roam-txt">📍 {{ activeLandmark.city }} · 返回</text>
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
        <text class="suggest-title">✈️ 探索远方地标</text>
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

    <!-- 兴趣标签筛选条 (宠物 / 二次元 / 风景 / 极限运动) -->
    <scroll-view scroll-x class="interest-filter-strip" :show-scrollbar="false">
      <view class="filter-pills-row">
        <view
          v-for="tag in filterTags"
          :key="tag.value"
          class="filter-pill"
          :class="{ 'pill-active': selectedInterestTag === tag.value }"
          @tap="selectedInterestTag = tag.value"
        >
          <text class="pill-ico">{{ tag.icon }}</text>
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
  background: rgba(255, 253, 248, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 5px 8px 5px 10px;
  box-shadow: 0 4px 18px rgba(62, 39, 35, 0.08), 0 1px 3px rgba(62, 39, 35, 0.04);
  border: 0.5px solid rgba(226, 217, 204, 0.9);
  pointer-events: auto;
}

.nav-search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f1e8;
  border-radius: 16px;
  padding: 5px 10px;
  min-width: 0;

  .search-ico {
    font-size: 13px;
    opacity: 0.65;
  }

  .search-inp {
    flex: 1;
    font-size: 13px;
    color: #3e2723;
    border: none;
    background: transparent;
    min-width: 0;
  }

  .clear-ico {
    font-size: 12px;
    color: #8d6e63;
    padding: 0 4px;
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
  margin-top: 7px;
  width: 100%;
  white-space: nowrap;
  pointer-events: auto;
}

.filter-pills-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 2px;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 14px;
  background: rgba(255, 253, 248, 0.9);
  border: 1px solid rgba(215, 204, 196, 0.8);
  box-shadow: 0 2px 6px rgba(62, 39, 35, 0.05);
  cursor: pointer;

  .pill-ico {
    font-size: 11px;
  }

  .pill-label {
    font-size: 11px;
    font-weight: 600;
    color: #5d4037;
  }

  &.pill-active {
    background: #3e2723;
    border-color: #3e2723;

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
