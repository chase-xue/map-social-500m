<template>
  <view class="pure-top-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav-glass-bar">
      <!-- 左侧：位置与范围切换胶囊 -->
      <view class="range-selector-pill" @tap="toggleRadius">
        <text class="loc-pin">📍</text>
        <text class="range-txt">{{ searchRadius === 500 ? '500m 生活圈' : '1km 街区' }}</text>
        <text class="dropdown-chevron">▼</text>
      </view>

      <!-- 中间：地标与便签搜索框 -->
      <view class="nav-search-box">
        <text class="search-ico">🔍</text>
        <input
          class="search-inp"
          v-model="searchText"
          placeholder="搜索附近地标/生活便签..."
          @confirm="onSearch"
        />
        <text v-if="searchText" class="clear-ico" @tap="searchText = ''">✕</text>
      </view>

      <!-- 右侧：地图 / 列表流视图无缝切换 -->
      <view class="view-switch-btn" @tap="toggleViewMode" :title="mapSubTab === 'map' ? '切换为列表流' : '切换为地图'">
        <text class="switch-icon">{{ mapSubTab === 'map' ? '📜' : '🗺️' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAppState } from "../../composables/useAppState";

const {
  statusBarHeight,
  mapSubTab,
  visibleStatuses,
  recenterToUser
} = useAppState();

const searchRadius = ref(500);
const searchText = ref("");

function toggleRadius() {
  searchRadius.value = searchRadius.value === 500 ? 1000 : 500;
  uni.showToast({
    title: `已切换至 ${searchRadius.value === 500 ? '500米圈' : '1公里街区'}`,
    icon: "none"
  });
}

function toggleViewMode() {
  mapSubTab.value = mapSubTab.value === 'map' ? 'moments' : 'map';
}

function onSearch() {
  if (!searchText.value.trim()) return;
  uni.showToast({
    title: `正在检索附近“${searchText.value}”...`,
    icon: "none"
  });
}
</script>

<style lang="scss" scoped>
.pure-top-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 8px 12px 6px;
  pointer-events: none;
}

.nav-glass-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 24px;
  padding: 5px 8px 5px 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 0.5px solid rgba(255, 255, 255, 0.9);
  pointer-events: auto;
}

/* 范围切换 */
.range-selector-pill {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 14px;
  cursor: pointer;
  flex-shrink: 0;

  .loc-pin {
    font-size: 13px;
  }

  .range-txt {
    font-size: 11px;
    font-weight: 700;
    color: #e65100;
    white-space: nowrap;
  }

  .dropdown-chevron {
    font-size: 8px;
    color: #f57c00;
    margin-left: 1px;
  }
}

/* 搜索框 */
.nav-search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f2eb;
  border-radius: 16px;
  padding: 4px 10px;
  min-width: 0;

  .search-ico {
    font-size: 12px;
    opacity: 0.6;
  }

  .search-inp {
    flex: 1;
    font-size: 12px;
    color: #3e2723;
    border: none;
    background: transparent;
    min-width: 0;
  }

  .clear-ico {
    font-size: 11px;
    color: #9e9e9e;
    padding: 0 4px;
    cursor: pointer;
  }
}

/* 视图模式切换 */
.view-switch-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e0d8cc;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  flex-shrink: 0;

  .switch-icon {
    font-size: 15px;
  }

  &:active {
    transform: scale(0.92);
  }
}
</style>
