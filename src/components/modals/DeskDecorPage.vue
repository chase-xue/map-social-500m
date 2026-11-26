<template>
  <view v-if="visible" class="decor-fullscreen-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 顶栏 -->
    <view class="decor-header">
      <view class="back-btn" @tap="$emit('close')">
        <text class="back-ico">‹</text>
        <text class="back-txt">返回桌洞</text>
      </view>
      <text class="decor-title">🎨 桌洞装扮工坊</text>
      <view class="save-pill" @tap="saveAndClose">保存装扮</view>
    </view>

    <!-- 上半屏：实时迷你书桌预览舞台 -->
    <view class="preview-stage" :class="'wp-' + draft.wallpaperStyle">
      <view class="pv-window" :class="'terrain-' + draft.terrain">
        <view class="pv-sky" />
        <view class="pv-silhouette" />
        <view class="pv-curtain left" :class="'curt-' + draft.curtainStyle" />
        <view class="pv-curtain right" :class="'curt-' + draft.curtainStyle" />
      </view>
      <view class="pv-wall-left">留言板</view>
      <view class="pv-wall-right">便签墙</view>
      <view class="pv-desk" :class="'desk-' + draft.deskStyle">
        <view class="pv-book">📖</view>
        <view class="pv-schedule">📅</view>
        <view v-if="draft.petSlot !== 'none'" class="pv-pet">
          {{ draft.petSlot === 'cat' ? '🐱' : draft.petSlot === 'shiba' ? '🐕' : '🐦' }}
        </view>
      </view>
      <view class="preview-tag-row">
        <text class="pv-chip">地形：{{ terrainLabel }}</text>
        <text class="pv-chip">宠物位：{{ petLabel }}</text>
      </view>
    </view>

    <!-- 下半屏：分 Tab 装扮选项 -->
    <view class="decor-tabs-bar">
      <view
        v-for="t in decorTabs"
        :key="t.key"
        class="d-tab"
        :class="{ active: activeTab === t.key }"
        @tap="activeTab = t.key"
      >
        <text>{{ t.label }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="decor-options-scroll">
      <!-- 1. 换桌子 -->
      <view v-if="activeTab === 'desk'" class="options-grid">
        <view
          v-for="d in deskOptions"
          :key="d.id"
          class="opt-card"
          :class="{ selected: draft.deskStyle === d.id }"
          @tap="draft.deskStyle = d.id"
        >
          <view class="swatch" :style="{ background: d.color }" />
          <text class="opt-name">{{ d.name }}</text>
          <text class="opt-desc">{{ d.desc }}</text>
        </view>
      </view>

      <!-- 2. 换窗帘 -->
      <view v-else-if="activeTab === 'curtain'" class="options-grid">
        <view
          v-for="c in curtainOptions"
          :key="c.id"
          class="opt-card"
          :class="{ selected: draft.curtainStyle === c.id }"
          @tap="draft.curtainStyle = c.id"
        >
          <view class="swatch" :style="{ background: c.color }" />
          <text class="opt-name">{{ c.name }}</text>
          <text class="opt-desc">{{ c.desc }}</text>
        </view>
      </view>

      <!-- 3. 换墙纸 -->
      <view v-else-if="activeTab === 'wallpaper'" class="options-grid">
        <view
          v-for="w in wallpaperOptions"
          :key="w.id"
          class="opt-card"
          :class="{ selected: draft.wallpaperStyle === w.id }"
          @tap="draft.wallpaperStyle = w.id"
        >
          <view class="swatch" :style="{ background: w.color }" />
          <text class="opt-name">{{ w.name }}</text>
          <text class="opt-desc">{{ w.desc }}</text>
        </view>
      </view>

      <!-- 4. 窗外地形楼房 -->
      <view v-else-if="activeTab === 'terrain'" class="options-grid">
        <view
          v-for="tr in terrainOptions"
          :key="tr.id"
          class="opt-card"
          :class="{ selected: draft.terrain === tr.id }"
          @tap="draft.terrain = tr.id"
        >
          <view class="swatch emoji-swatch">{{ tr.icon }}</view>
          <text class="opt-name">{{ tr.name }}</text>
          <text class="opt-desc">{{ tr.desc }}</text>
        </view>
      </view>

      <!-- 5. 养宠物扩展位（架构预留） -->
      <view v-else-if="activeTab === 'pet'" class="options-grid">
        <view
          v-for="p in petOptions"
          :key="p.id"
          class="opt-card"
          :class="{ selected: draft.petSlot === p.id }"
          @tap="draft.petSlot = p.id"
        >
          <view class="swatch emoji-swatch">{{ p.icon }}</view>
          <text class="opt-name">{{ p.name }}</text>
          <text class="opt-desc">{{ p.desc }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { DeskDecorConfig } from "../../services/deskService";
import { TerrainType } from "../../types";

const props = defineProps<{
  visible: boolean;
  statusBarHeight: number;
  modelValue: DeskDecorConfig;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", config: DeskDecorConfig): void;
}>();

const activeTab = ref<"desk" | "curtain" | "wallpaper" | "terrain" | "pet">("desk");
const draft = ref<DeskDecorConfig>({ ...props.modelValue });

watch(
  () => props.visible,
  (v) => {
    if (v) draft.value = { ...props.modelValue };
  }
);

const decorTabs = [
  { key: "desk" as const, label: "🪵 桌子" },
  { key: "curtain" as const, label: "🎋 窗帘" },
  { key: "wallpaper" as const, label: "🖼️ 墙纸" },
  { key: "terrain" as const, label: "🏙️ 窗景" },
  { key: "pet" as const, label: "🐾 宠物(扩展)" },
];

const deskOptions: { id: DeskDecorConfig["deskStyle"]; name: string; desc: string; color: string }[] = [
  { id: "classic", name: "原木怀旧课桌", desc: "温暖实木色泽", color: "linear-gradient(135deg, #d7b28a, #b6895b)" },
  { id: "walnut", name: "京都黑胡桃木", desc: "深邃老书屋质感", color: "linear-gradient(135deg, #6d4c41, #3e2723)" },
  { id: "cream", name: "法式奶油书桌", desc: "温柔奶白极简风", color: "linear-gradient(135deg, #f7f1e3, #e6dcc8)" },
  { id: "sakura", name: "春日樱木桌", desc: "淡淡樱粉木纹", color: "linear-gradient(135deg, #f5d5d8, #dca6ae)" },
];

const curtainOptions = [
  { id: 1, name: "素白薄纱", desc: "微风轻透阳光", color: "linear-gradient(135deg, #fffdf8, #ece6da)" },
  { id: 2, name: "燕麦棉麻", desc: "日式自然手作", color: "linear-gradient(135deg, #e8dcc8, #d4c0a1)" },
  { id: 3, name: "雨雾灰蓝", desc: "静谧雨天氛围", color: "linear-gradient(135deg, #cbd8e2, #9db4c4)" },
  { id: 4, name: "春日鼠尾草", desc: "森林治愈绿意", color: "linear-gradient(135deg, #d5e2d3, #aec4ab)" },
  { id: 5, name: "暖杏格纹", desc: "复古手账格纹", color: "linear-gradient(135deg, #f3dec0, #e1be8d)" },
];

const wallpaperOptions: { id: DeskDecorConfig["wallpaperStyle"]; name: string; desc: string; color: string }[] = [
  { id: "warm", name: "米白和纸墙", desc: "经典温暖底色", color: "linear-gradient(180deg, #f7f2e8, #ebe1cf)" },
  { id: "linen", name: "复古亚麻纹", desc: "手作咖啡馆风", color: "linear-gradient(180deg, #ede3d2, #dccbb0)" },
  { id: "sage", name: "森林薄荷绿", desc: "吉卜力夏日小屋", color: "linear-gradient(180deg, #e5eee3, #cfe0cb)" },
  { id: "starry", name: "静夜星蓝", desc: "夜晚安静读书角", color: "linear-gradient(180deg, #d8e1ec, #b9c9dd)" },
];

const terrainOptions: { id: TerrainType; name: string; icon: string; desc: string }[] = [
  { id: "city", name: "都市暖光楼宇", icon: "🏙️", desc: "现代街区与暖黄窗灯" },
  { id: "ancient", name: "古城青瓦飞檐", icon: "🏯", desc: "丽江/古镇青瓦屋脊" },
  { id: "mountain", name: "远山森林树影", icon: "🏔️", desc: "雪山松林慢生活" },
  { id: "coastal", name: "海滨灯塔浪花", icon: "🌊", desc: "洱海/海边清爽视野" },
];

const petOptions: { id: DeskDecorConfig["petSlot"]; name: string; icon: string; desc: string }[] = [
  { id: "none", name: "暂不放置", icon: "✨", desc: "保留整洁桌面角落" },
  { id: "cat", name: "橘猫团子", icon: "🐱", desc: "趴在桌面陪你写纸条" },
  { id: "shiba", name: "柴犬布丁", icon: "🐕", desc: "摇尾巴守护你的桌洞" },
  { id: "bird", name: "蓝山雀啾啾", icon: "🐦", desc: "停在窗台帮你送信" },
];

const terrainLabel = computed(() => terrainOptions.find((t) => t.id === draft.value.terrain)?.name || "都市楼宇");
const petLabel = computed(() => petOptions.find((p) => p.id === draft.value.petSlot)?.name || "未放置");

function saveAndClose() {
  emit("save", { ...draft.value });
  emit("close");
}
</script>

<style lang="scss" scoped>
.decor-fullscreen-page {
  position: fixed;
  inset: 0;
  z-index: 220;
  background: #f7f5f0;
  display: flex;
  flex-direction: column;
  max-width: 430px;
  margin: 0 auto;
}

.decor-header {
  height: 50px;
  padding: 0 14px;
  background: #fffdf8;
  border-bottom: 0.5px solid #e5dfd3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;

  .back-btn {
    display: flex;
    align-items: center;
    gap: 2px;
    color: #5d4037;
    cursor: pointer;
    .back-ico { font-size: 22px; line-height: 1; }
    .back-txt { font-size: 13px; font-weight: 600; }
  }

  .decor-title {
    font-size: 15px;
    font-weight: 700;
    color: #3e2723;
  }

  .save-pill {
    padding: 5px 12px;
    border-radius: 14px;
    background: #3e2723;
    color: #fffdf8;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }
}

.preview-stage {
  position: relative;
  height: 230px;
  margin: 12px 14px;
  border-radius: 18px;
  border: 1px solid #e3d9c7;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(62, 39, 35, 0.08);
  flex-shrink: 0;

  &.wp-warm { background: linear-gradient(180deg, #f7f2e8, #ebe1cf); }
  &.wp-linen { background: linear-gradient(180deg, #ede3d2, #dccbb0); }
  &.wp-sage { background: linear-gradient(180deg, #e5eee3, #cfe0cb); }
  &.wp-starry { background: linear-gradient(180deg, #d8e1ec, #b9c9dd); }

  .pv-window {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 146px;
    height: 112px;
    border: 4px solid #fffdf8;
    border-radius: 8px;
    overflow: hidden;
    background: linear-gradient(180deg, #a7d4f2, #e5f3fb);

    .pv-silhouette {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: #7b90a0;
      clip-path: polygon(0 100%, 0 38%, 18% 38%, 18% 18%, 35% 18%, 35% 48%, 55% 48%, 55% 22%, 75% 22%, 75% 42%, 100% 42%, 100% 100%);
    }

    &.terrain-ancient .pv-silhouette {
      background: #5b5049;
      clip-path: polygon(0 100%, 0 55%, 16% 32%, 34% 55%, 52% 28%, 74% 55%, 88% 35%, 100% 55%, 100% 100%);
    }

    &.terrain-mountain .pv-silhouette {
      background: #6c8a72;
      clip-path: polygon(0 100%, 18% 30%, 42% 72%, 68% 20%, 100% 78%, 100% 100%);
    }

    &.terrain-coastal .pv-silhouette {
      background: #5c9ec4;
      clip-path: polygon(0 100%, 0 56%, 30% 48%, 62% 58%, 100% 46%, 100% 100%);
    }

    .pv-curtain {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 24px;
      background: rgba(255, 253, 248, 0.88);
      &.left { left: 0; border-radius: 0 0 12px 0; }
      &.right { right: 0; border-radius: 0 0 0 12px; }
      &.curt-2 { background: rgba(232, 218, 194, 0.9); }
      &.curt-3 { background: rgba(186, 206, 220, 0.9); }
      &.curt-4 { background: rgba(196, 218, 194, 0.9); }
      &.curt-5 { background: rgba(238, 206, 162, 0.9); }
    }
  }

  .pv-wall-left, .pv-wall-right {
    position: absolute;
    top: 46px;
    width: 58px;
    height: 68px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    color: #5d4037;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(62, 39, 35, 0.12);
  }
  .pv-wall-left { left: 16px; background: #dfc099; border: 2px solid #9d754e; }
  .pv-wall-right { right: 16px; background: #fff9db; border: 1.5px dashed #d6bc7c; }

  .pv-desk {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 76px;
    border-top: 3px solid rgba(62, 39, 35, 0.15);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 24px;

    &.desk-classic { background: linear-gradient(180deg, #d9b58e, #bd9266); }
    &.desk-walnut { background: linear-gradient(180deg, #6d4c41, #4a3129); }
    &.desk-cream { background: linear-gradient(180deg, #f8f2e6, #e7dcc8); }
    &.desk-sakura { background: linear-gradient(180deg, #f4d4d8, #dca6ae); }

    .pv-book, .pv-schedule, .pv-pet {
      font-size: 26px;
      filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.18));
    }
  }

  .preview-tag-row {
    position: absolute;
    top: 8px;
    left: 10px;
    display: flex;
    gap: 6px;

    .pv-chip {
      font-size: 10px;
      font-weight: 600;
      color: #3e2723;
      background: rgba(255, 253, 248, 0.88);
      padding: 2px 7px;
      border-radius: 10px;
    }
  }
}

.decor-tabs-bar {
  display: flex;
  padding: 0 14px;
  gap: 6px;
  margin-bottom: 10px;
  flex-shrink: 0;

  .d-tab {
    flex: 1;
    text-align: center;
    padding: 7px 2px;
    border-radius: 12px;
    background: #efeae0;
    font-size: 11px;
    font-weight: 600;
    color: #6d4c41;
    cursor: pointer;

    &.active {
      background: #3e2723;
      color: #fffdf8;
    }
  }
}

.decor-options-scroll {
  flex: 1;
  min-height: 0;
  padding: 0 14px 20px;
  box-sizing: border-box;
}

.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.opt-card {
  background: #fffdf8;
  border: 1.5px solid #e7dfd0;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;

  &.selected {
    border-color: #3e2723;
    background: #fffaf0;
    box-shadow: 0 4px 12px rgba(62, 39, 35, 0.1);
  }

  .swatch {
    height: 46px;
    border-radius: 10px;
    border: 1px solid rgba(62, 39, 35, 0.08);
  }

  .emoji-swatch {
    background: #f5efe3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
  }

  .opt-name {
    font-size: 13px;
    font-weight: 700;
    color: #3e2723;
  }

  .opt-desc {
    font-size: 11px;
    color: #8d6e63;
  }
}
</style>
