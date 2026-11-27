<template>
  <view class="growth-settings-tab" :style="{ paddingTop: statusBarHeight + 'px' }">
    <scroll-view scroll-y class="settings-scroll">
      <view class="settings-inner-body">
        <!-- 1. 手账个人名片护照卡 -->
        <view class="passport-card">
          <view class="passport-washi-tape" />
          <view class="passport-top-row">
            <view class="ava-ring" @tap="openMyProfileSheet">
              <image class="passport-avatar" :src="myProfile.avatar" mode="aspectFill" />
            </view>
            <view class="passport-info" @tap="openMyProfileSheet">
              <view class="passport-name-row">
                <text class="passport-name">{{ myProfile.name }}</text>
                <view class="passport-title-pill" @tap.stop="mallDrawerType = 'titles'">
                  <text>{{ myGrowth.grade }} · {{ myGrowth.title }} ▾</text>
                </view>
              </view>
              <text class="passport-bio">{{ myProfile.bio || '在慢生活里写下真实的自己' }}</text>
            </view>
            <text class="passport-arrow" @tap="openMyProfileSheet">›</text>
          </view>

          <view class="passport-exp-wrap">
            <view class="passport-exp-head">
              <text class="exp-lbl">手账成长值</text>
              <text class="exp-num">{{ myGrowth.experience }} / 1000 EXP</text>
            </view>
            <view class="passport-exp-track">
              <view class="passport-exp-fill" :style="{ width: Math.min(100, myGrowth.experience / 10) + '%' }" />
            </view>
          </view>
        </view>

        <!-- 2. 极简三列资产条 -->
        <view class="assets-strip-card">
          <view class="asset-col" @tap="buyCoins">
            <text class="a-num">{{ myGrowth.coins }}</text>
            <text class="a-lbl">慢币余额</text>
          </view>
          <view class="asset-col" @tap="openSealsMall">
            <text class="a-num">{{ myGrowth.ownedSeals?.length || 2 }} 款</text>
            <text class="a-lbl">火漆印章</text>
          </view>
          <view class="asset-col" @tap="openPapersMall">
            <text class="a-num">{{ myGrowth.ownedPapers?.length || 2 }} 款</text>
            <text class="a-lbl">典藏信纸</text>
          </view>
        </view>

        <!-- 3. 核心功能前置：记忆、推送与偏好设置 -->
        <text class="st-group-title">记忆与偏好</text>
        <view class="st-group-card">
          <view class="st-row" @tap="openMemoryDrawer">
            <view class="st-ico accent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </view>
            <view class="st-main">
              <text class="st-title">传输记忆 · 账号互传</text>
              <text class="st-sub">优先本地存储 · 一键导出或口令迁移</text>
            </view>
            <view class="st-right">
              <text class="st-val">{{ memoryStats.sizeKB }} KB</text>
              <text class="st-arr">›</text>
            </view>
          </view>

          <view class="st-row" @tap="openPushDrawer">
            <view class="st-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </view>
            <view class="st-main">
              <text class="st-title">小标签订阅推送</text>
              <text class="st-sub">已订阅：{{ pushSettings.tags.join('、') || '未选择' }}</text>
            </view>
            <view class="st-right">
              <text class="st-val">{{ pushSettings.enabled ? '已开启' : '已关闭' }}</text>
              <text class="st-arr">›</text>
            </view>
          </view>

          <view class="st-row" @tap="toggleShowPhone">
            <view class="st-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </view>
            <view class="st-main">
              <text class="st-title">向附近邻友公开联系电话</text>
              <text class="st-sub">关闭后仅通过小纸条联系</text>
            </view>
            <switch :checked="myProfile.showPhone" color="#c25b38" @change="toggleShowPhone" />
          </view>

          <view class="st-row" @tap="mallDrawerType = 'titles'">
            <view class="st-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="7"/>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
              </svg>
            </view>
            <view class="st-main">
              <text class="st-title">学级与趣味称号</text>
              <text class="st-sub">切换佩戴的专属身份徽章</text>
            </view>
            <view class="st-right">
              <text class="st-val">更换</text>
              <text class="st-arr">›</text>
            </view>
          </view>
        </view>

        <!-- 4. 克制优雅的「文创手账馆」横向小卡 -->
        <view class="atelier-head-row">
          <text class="st-group-title no-margin">文创手账馆</text>
          <text class="atelier-motto">只做情怀 · 拒绝提速</text>
        </view>
        <scroll-view scroll-x class="atelier-scroll" :show-scrollbar="false">
          <view class="atelier-row">
            <view class="atelier-card" @tap="openSealsMall">
              <view class="atelier-swatch sw-seal"><text>🔏</text></view>
              <text class="atelier-name">特权火漆印章</text>
              <text class="atelier-price">¥6 · 永久</text>
            </view>
            <view class="atelier-card" @tap="openPapersMall">
              <view class="atelier-swatch sw-paper"><text>📜</text></view>
              <text class="atelier-name">京都和纸信笺</text>
              <text class="atelier-price">¥9 · 永久</text>
            </view>
            <view class="atelier-card" @tap="openThemesMall">
              <view class="atelier-swatch sw-desk"><text>🪵</text></view>
              <text class="atelier-name">桌洞装扮皮肤</text>
              <text class="atelier-price">¥12 · 典藏</text>
            </view>
            <view class="atelier-card" @tap="openMerchOrder">
              <view class="atelier-swatch sw-gift"><text>🎁</text></view>
              <text class="atelier-name">实体文创礼盒</text>
              <text class="atelier-price">¥39 · 包邮</text>
            </view>
          </view>
        </scroll-view>

        <!-- 5. 关于与个人资料 -->
        <view class="st-group-card">
          <view class="st-row" @tap="openMyProfileSheet">
            <view class="st-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </view>
            <view class="st-main">
              <text class="st-title">个人信息修改</text>
            </view>
            <view class="st-right"><text class="st-arr">›</text></view>
          </view>
          <view class="st-row" @tap="showAboutApp">
            <view class="st-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </view>
            <view class="st-main">
              <text class="st-title">关于《小纸条》</text>
            </view>
            <view class="st-right">
              <text class="st-val">v3.0</text>
              <text class="st-arr">›</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 统一治愈系文创与拟物装扮抽屉 (彻底取代生硬的原生 ActionSheet 与 Modal) -->
    <view v-if="mallDrawerType" class="ghibli-drawer-mask" @tap="mallDrawerType = null">
      <view class="ghibli-drawer-card" @tap.stop>
        <view class="drawer-header-row">
          <view class="drawer-handle" />
          <text class="drawer-title">
            {{
              mallDrawerType === 'seals' ? '🔏 火漆印章外观典藏馆' :
              mallDrawerType === 'papers' ? '📜 典藏和纸与星空信笺套装' :
              mallDrawerType === 'themes' ? '🪵 治愈桌洞拟物化装扮皮肤' :
              mallDrawerType === 'merch' ? '🎁 《小纸条》实体文创慢寄礼盒' :
              mallDrawerType === 'merchant' ? '🏪 本地商户 500m 慢递合作' :
              mallDrawerType === 'memory' ? '🧠 传输记忆 · 账号与设备互传' :
              mallDrawerType === 'push' ? '🔔 小标签订阅推送偏好' :
              mallDrawerType === 'titles' ? '🏅 学级与专属趣味称号' :
              '🕊️ 关于《小纸条 (Slow Notes 500m)》'
            }}
          </text>
          <text class="drawer-subtitle">
            {{
              mallDrawerType === 'seals' ? '手工压印浮雕印记，专属慢纸条个性身份' :
              mallDrawerType === 'papers' ? '京都和纸与星空信笺，让文字在纸上呼吸' :
              mallDrawerType === 'themes' ? '雨夜咖啡馆、老书屋写字台，沉浸书桌氛围' :
              mallDrawerType === 'merch' ? '手工黄铜折纸飞机书签 + 手账和纸胶带盲盒 + 慢递信笺' :
              mallDrawerType === 'merchant' ? '支持周边独立小店、手作人投放专属福利便签' :
              mallDrawerType === 'memory' ? '个人数据优先存本地 · 一键导出记忆包或口令互传' :
              mallDrawerType === 'push' ? '仅推送你订阅的兴趣标签与关注地标新便签' :
              '现代快节奏生活里的一方温柔自留地'
            }}
          </text>
        </view>

        <!-- 印章列表 -->
        <view v-if="mallDrawerType === 'seals'" class="drawer-cards-flow">
          <view
            v-for="s in sealsData"
            :key="s.name"
            class="mall-item-card"
            :class="{ 'card-active': myGrowth.activeSeal === s.name }"
            @tap="handleSelectSeal(s)"
          >
            <view class="seal-icon-box" :style="{ background: s.bg, borderColor: s.border }">
              <text class="seal-stamp-ico">{{ s.icon }}</text>
            </view>
            <view class="mall-card-info">
              <view class="card-name-row">
                <text class="mall-name">{{ s.name }}</text>
                <text v-if="myGrowth.activeSeal === s.name" class="active-pill">当前佩戴</text>
                <text v-else-if="isOwnedSeal(s.name)" class="owned-pill">已拥有</text>
              </view>
              <text class="mall-desc">{{ s.desc }}</text>
            </view>
            <button class="mall-action-btn" :class="{ 'btn-equipped': myGrowth.activeSeal === s.name }">
              {{ myGrowth.activeSeal === s.name ? '佩戴中' : isOwnedSeal(s.name) ? '佩戴' : '¥6 解锁' }}
            </button>
          </view>
        </view>

        <!-- 信纸列表 -->
        <view v-else-if="mallDrawerType === 'papers'" class="drawer-cards-flow">
          <view
            v-for="p in papersData"
            :key="p.name"
            class="mall-item-card"
            :class="['card-skin-' + p.colorKey, { 'card-active': myGrowth.activePaper === p.name }]"
            @tap="handleSelectPaper(p)"
          >
            <view class="paper-icon-box">
              <text class="paper-emoji">{{ p.icon }}</text>
            </view>
            <view class="mall-card-info">
              <view class="card-name-row">
                <text class="mall-name">{{ p.name }}</text>
                <text v-if="myGrowth.activePaper === p.name" class="active-pill">当前使用</text>
                <text v-else-if="isOwnedPaper(p.name)" class="owned-pill">已拥有</text>
              </view>
              <text class="mall-desc">{{ p.desc }}</text>
            </view>
            <button class="mall-action-btn" :class="{ 'btn-equipped': myGrowth.activePaper === p.name }">
              {{ myGrowth.activePaper === p.name ? '使用中' : isOwnedPaper(p.name) ? '换上' : '¥9 解锁' }}
            </button>
          </view>
        </view>

        <!-- 桌洞皮肤列表 -->
        <view v-else-if="mallDrawerType === 'themes'" class="drawer-cards-flow">
          <view
            v-for="t in themesData"
            :key="t.id"
            class="mall-item-card"
            :class="{ 'card-active': myGrowth.activeTheme === t.id }"
            @tap="handleSelectTheme(t)"
          >
            <view class="theme-icon-box">
              <text class="theme-emoji">{{ t.icon }}</text>
            </view>
            <view class="mall-card-info">
              <view class="card-name-row">
                <text class="mall-name">{{ t.name }}</text>
                <text v-if="myGrowth.activeTheme === t.id" class="active-pill">当前装扮</text>
                <text v-else-if="isOwnedTheme(t.id)" class="owned-pill">已拥有</text>
              </view>
              <text class="mall-desc">{{ t.desc }}</text>
            </view>
            <button class="mall-action-btn" :class="{ 'btn-equipped': myGrowth.activeTheme === t.id }">
              {{ myGrowth.activeTheme === t.id ? '装扮中' : isOwnedTheme(t.id) ? '应用' : '¥12 装扮' }}
            </button>
          </view>
        </view>

        <!-- 实体礼盒详情 -->
        <view v-else-if="mallDrawerType === 'merch'" class="merch-detail-box">
          <view class="merch-items-grid">
            <view class="merch-prop-card">
              <text class="prop-ico">✈️</text>
              <text class="prop-title">手工黄铜折纸飞机</text>
              <text class="prop-sub">慢生活专属金属书签</text>
            </view>
            <view class="merch-prop-card">
              <text class="prop-ico">🎨</text>
              <text class="prop-title">和纸胶带盲盒</text>
              <text class="prop-sub">500米原创手账撕边胶带</text>
            </view>
            <view class="merch-prop-card">
              <text class="prop-ico">💌</text>
              <text class="prop-title">纯棉慢递信笺</text>
              <text class="prop-sub">3套复古信纸与火漆封套</text>
            </view>
          </view>
          <view class="merch-bottom-row">
            <view class="merch-price-col">
              <text class="price-val">¥39.00</text>
              <text class="price-tip">慢递包邮 · 预计 3-5 天送达案头</text>
            </view>
            <button class="order-submit-btn" @tap="submitMerchOrder">
              🏮 慢递预订 · 支持情怀
            </button>
          </view>
        </view>

        <!-- 商户合作抽屉 -->
        <view v-else-if="mallDrawerType === 'merchant'" class="drawer-info-flow">
          <view class="info-content-card">
            <view class="info-tag-row">
              <text class="info-tag">📍 500m 极近圈精准获客</text>
              <text class="info-tag">🏮 无佣金纯福利</text>
            </view>
            <text class="info-body-p">支持周边咖啡馆、烘焙店、手作工坊、书店等实体独立小店投放定向打卡便签。凭 500 米生活圈身份核销，促进真实社区温情连接。</text>
            <view class="info-privilege-list">
              <view class="info-privilege-item">
                <text class="ip-ico">📜</text>
                <text class="ip-txt">专属手账风格便签排版，告别硬广牛皮癣</text>
              </view>
              <view class="info-privilege-item">
                <text class="ip-ico">🔏</text>
                <text class="ip-txt">定制商户联名火漆印章与专属打卡勋章</text>
              </view>
              <view class="info-privilege-item">
                <text class="ip-ico">🤝</text>
                <text class="ip-txt">支持线下慢纸条“留声簿”与代收桌洞纸条</text>
              </view>
            </view>
          </view>
          <button class="drawer-confirm-btn" @tap="submitMerchantApply">
            ✨ 申请入驻周边生活圈
          </button>
        </view>

        <!-- 传输记忆 / 账号互传抽屉（需求 10 & 17） -->
        <view v-else-if="mallDrawerType === 'memory'" class="drawer-info-flow">
          <view class="info-content-card">
            <view class="mem-stats-row">
              <text class="mem-stat-pill">💾 优先本地存储</text>
              <text class="mem-stat-pill">已保存 {{ memoryStats.keysCount }} 项 · {{ memoryStats.sizeKB }} KB</text>
            </view>
            <text class="info-body-p">你的桌洞装扮、日记、课程表、记账本、收藏纸条与聊天记录全部优先保存在本机。换机或切换账号时，可通过下方记忆包无损互传：</text>

            <view class="mem-action-grid">
              <view class="mem-btn" @tap="handleDownloadMemory">💾 导出记忆文件</view>
              <view class="mem-btn" @tap="handleCopyMemoryToken">📋 复制记忆口令</view>
            </view>

            <textarea
              class="mem-import-box"
              v-model="importMemoryText"
              placeholder="在此粘贴另一台设备/账号导出的记忆口令或 JSON 内容..."
              maxlength="200000"
            />
          </view>
          <button class="drawer-confirm-btn" @tap="handleImportMemory">
            📥 导入并恢复全部本地记忆
          </button>
        </view>

        <!-- 小标签订阅推送抽屉（需求 19） -->
        <view v-else-if="mallDrawerType === 'push'" class="drawer-info-flow">
          <view class="info-content-card">
            <view class="push-switch-row">
              <text class="push-label">开启小标签新动态轻推送</text>
              <switch :checked="pushSettings.enabled" color="#3e2723" @change="togglePushEnabled" />
            </view>

            <text class="push-group-title">订阅兴趣标签</text>
            <view class="push-chips-wrap">
              <view
                v-for="tag in pushTagOptions"
                :key="tag"
                class="push-chip"
                :class="{ active: pushSettings.tags.includes(tag) }"
                @tap="togglePushTag(tag)"
              >
                {{ tag }}
              </view>
            </view>

            <text class="push-group-title">关注远方地标</text>
            <view class="push-chips-wrap">
              <view
                v-for="city in pushCityOptions"
                :key="city"
                class="push-chip"
                :class="{ active: pushSettings.cities.includes(city) }"
                @tap="togglePushCity(city)"
              >
                📍 {{ city }}
              </view>
            </view>
          </view>
          <button class="drawer-confirm-btn" @tap="sendTestPush">
            🔔 发送一条测试推送横幅
          </button>
        </view>

        <!-- 学级与趣味称号抽屉 -->
        <view v-else-if="mallDrawerType === 'titles'" class="drawer-info-flow">
          <view class="info-content-card">
            <text class="push-group-title">切换学级身份</text>
            <view class="push-chips-wrap">
              <view
                v-for="g in gradesList"
                :key="g"
                class="push-chip"
                :class="{ active: myGrowth.grade === g }"
                @tap="switchGrade(g)"
              >
                {{ g }}
              </view>
            </view>

            <text class="push-group-title">佩戴趣味称号</text>
            <view class="push-chips-wrap">
              <view
                v-for="t in titlesList"
                :key="t"
                class="push-chip"
                :class="{ active: myGrowth.title === t }"
                @tap="selectTitle(t)"
              >
                {{ t }}
              </view>
            </view>
          </view>
          <button class="drawer-confirm-btn" @tap="mallDrawerType = null">完成佩戴</button>
        </view>

        <!-- 关于我们抽屉 -->
        <view v-else-if="mallDrawerType === 'about'" class="drawer-info-flow">
          <view class="info-content-card">
            <view class="about-logo-row">
              <text class="about-logo-ico">📜</text>
              <text class="about-app-name">小纸条 · Slow Notes</text>
              <text class="about-version">v1.2.0 · 治愈手账版</text>
            </view>
            <text class="info-body-p">灵感来自学生时代前后座悄悄传递的折纸小纸条与弄堂弄口的手写小告示。</text>
            <text class="info-body-p">在信息过载的时代，我们没有冰冷的数据算法推荐，而是按物理距离换算传递延迟，为城市里的人们留下一方带着纸香与温热的慢社交净土。</text>
            <view class="about-values-box">
              <view class="value-item">
                <text class="v-label">🌲 慢生活</text>
                <text class="v-desc">距离决定投递时间，找回期待的浪漫</text>
              </view>
              <view class="value-item">
                <text class="v-label">🛡️ 严隐私</text>
                <text class="v-desc">模糊区间保护真实坐标，杜绝人身追踪</text>
              </view>
              <view class="value-item">
                <text class="v-label">🪵 轻拟物</text>
                <text class="v-desc">吉卜力手账质感，温润和纸与火漆印</text>
              </view>
            </view>
          </view>
          <button class="drawer-confirm-btn" @tap="mallDrawerType = null">
            🌿 温暖同行 · 留住回忆
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { GradeLevel, DeskTheme, InterestTag } from "../../types";
import { useAppState } from "../../composables/useAppState";
import { saveUserProfile } from "../../services/storage";
import {
  getLocalMemoryStats,
  exportMemoryToken,
  downloadMemoryJsonFile,
  importMemoryFromText
} from "../../services/memoryTransfer";

const {
  statusBarHeight,
  myProfile,
  openMyProfileSheet,
  pushSettings,
  savePushSettings,
  triggerPushNotification,
  allStatuses,
  initApp
} = useAppState();

const mallDrawerType = ref<'seals' | 'papers' | 'themes' | 'merch' | 'merchant' | 'memory' | 'push' | 'titles' | 'about' | null>(null);
const memoryStats = ref(getLocalMemoryStats());
const importMemoryText = ref("");
const pushTagOptions: InterestTag[] = ["宠物", "二次元", "风景", "极限运动"];
const pushCityOptions = ["丽江", "大理", "成都", "北京", "厦门"];

function openMemoryDrawer() {
  memoryStats.value = getLocalMemoryStats();
  importMemoryText.value = "";
  mallDrawerType.value = "memory";
}

function openPushDrawer() {
  mallDrawerType.value = "push";
}

function handleDownloadMemory() {
  const ok = downloadMemoryJsonFile();
  uni.showToast({
    title: ok ? "已导出 .slownotes.json 记忆文件 💾" : "当前环境请使用「复制记忆口令」",
    icon: "none"
  });
}

function handleCopyMemoryToken() {
  const token = exportMemoryToken();
  uni.setClipboardData({
    data: token,
    success: () => {
      uni.showToast({ title: "记忆口令已复制，可粘贴到另一账号导入 📋", icon: "none" });
    }
  });
}

function handleImportMemory() {
  const res = importMemoryFromText(importMemoryText.value);
  if (res.ok) {
    initApp();
    memoryStats.value = getLocalMemoryStats();
    mallDrawerType.value = null;
    uni.showToast({ title: res.msg, icon: "success" });
  } else {
    uni.showToast({ title: res.msg, icon: "none" });
  }
}

function togglePushEnabled(e: any) {
  savePushSettings({ ...pushSettings.value, enabled: !!e.detail?.value });
}

function togglePushTag(tag: InterestTag) {
  const tags = [...pushSettings.value.tags];
  const idx = tags.indexOf(tag);
  if (idx >= 0) tags.splice(idx, 1);
  else tags.push(tag);
  savePushSettings({ ...pushSettings.value, tags });
}

function togglePushCity(city: string) {
  const cities = [...pushSettings.value.cities];
  const idx = cities.indexOf(city);
  if (idx >= 0) cities.splice(idx, 1);
  else cities.push(city);
  savePushSettings({ ...pushSettings.value, cities });
}

function sendTestPush() {
  const sample = allStatuses.value.find((s) => s.address?.includes("丽江")) || allStatuses.value[0];
  if (sample) {
    savePushSettings({ ...pushSettings.value, enabled: true });
    mallDrawerType.value = null;
    triggerPushNotification({
      ...sample,
      interestTag: pushSettings.value.tags[0] || "风景"
    });
  }
}

const sealsData = [
  { name: "古铜月相印", icon: "🌙", bg: "linear-gradient(135deg, #78350f, #92400e)", border: "#f59e0b", desc: "复古古铜压痕，月相清冷" },
  { name: "玫瑰金猫爪印", icon: "🐾", bg: "linear-gradient(135deg, #9d174d, #be185d)", border: "#fbcfe8", desc: "治愈肉垫浮雕，温情陪伴" },
  { name: "欧式皇家徽印", icon: "👑", bg: "linear-gradient(135deg, #7f1d1d, #991b1b)", border: "#fbbf24", desc: "双狮展翼纹章，庄重誓约" }
];

const papersData = [
  { name: "京都古法和纸", colorKey: "yellow", icon: "🌾", desc: "温润纤维手感，水墨温润微黄底纹" },
  { name: "星空流光纸", colorKey: "blue", icon: "🌌", desc: "深蓝渐变微光，适合夜读轻语" },
  { name: "午后羊皮卷信纸", colorKey: "kraft", icon: "🪵", desc: "怀旧中世纪泛黄卷边，手感厚重" }
];

const themesData: { id: DeskTheme; name: string; icon: string; desc: string }[] = [
  { id: "wood", name: "温暖原木书桌", icon: "🪵", desc: "怀旧学生课桌，温暖木质纹理" },
  { id: "cherry", name: "樱花漫舞台", icon: "🌸", desc: "清爽微粉调，落樱时光" },
  { id: "retro", name: "雨夜复古咖啡馆", icon: "☕", desc: "深色红木，微暗暖光雨声" },
  { id: "modern", name: "温室花房透光台", icon: "🌿", desc: "绿色植物环绕，玻璃天窗阳光" }
];

function isOwnedSeal(name: string): boolean {
  return myProfile.value?.growth?.ownedSeals?.includes(name) ?? false;
}

function isOwnedPaper(name: string): boolean {
  return myProfile.value?.growth?.ownedPapers?.includes(name) ?? false;
}

function isOwnedTheme(id: DeskTheme): boolean {
  return myProfile.value?.growth?.ownedThemes?.includes(id) ?? false;
}

function handleSelectSeal(s: typeof sealsData[0]) {
  const g = myProfile.value.growth;
  if (!g) return;
  if (!g.ownedSeals) g.ownedSeals = ["古铜月相印", "玫瑰金猫爪印"];
  if (g.ownedSeals.includes(s.name)) {
    g.activeSeal = s.name;
    saveUserProfile(myProfile.value);
    uni.showToast({ title: `已佩戴火漆印章：${s.name}`, icon: "success" });
  } else {
    g.ownedSeals.push(s.name);
    g.activeSeal = s.name;
    saveUserProfile(myProfile.value);
    uni.showToast({ title: `成功解锁并佩戴 ${s.name} 🔏`, icon: "success" });
  }
}

function handleSelectPaper(p: typeof papersData[0]) {
  const g = myProfile.value.growth;
  if (!g) return;
  if (!g.ownedPapers) g.ownedPapers = ["京都古法和纸", "星空流光纸"];
  if (g.ownedPapers.includes(p.name)) {
    g.activePaper = p.name;
    saveUserProfile(myProfile.value);
    uni.showToast({ title: `已换上信笺：${p.name}`, icon: "success" });
  } else {
    g.ownedPapers.push(p.name);
    g.activePaper = p.name;
    saveUserProfile(myProfile.value);
    uni.showToast({ title: `已解锁特权信笺 ${p.name} 📜`, icon: "success" });
  }
}

function handleSelectTheme(t: typeof themesData[0]) {
  const g = myProfile.value.growth;
  if (!g) return;
  if (!g.ownedThemes) g.ownedThemes = ["wood", "cherry", "retro"];
  if (g.ownedThemes.includes(t.id)) {
    g.activeTheme = t.id;
    saveUserProfile(myProfile.value);
    uni.showToast({ title: `已应用桌洞皮肤：${t.name}`, icon: "success" });
  } else {
    g.ownedThemes.push(t.id);
    g.activeTheme = t.id;
    saveUserProfile(myProfile.value);
    uni.showToast({ title: `已装扮 ${t.name} 🪵`, icon: "success" });
  }
}

function submitMerchOrder() {
  mallDrawerType.value = null;
  uni.showToast({ title: "已加入慢递清单，感谢支持纯粹情怀！🎁", icon: "success" });
}

function openSealsMall() {
  mallDrawerType.value = 'seals';
}

function openPapersMall() {
  mallDrawerType.value = 'papers';
}

function openThemesMall() {
  mallDrawerType.value = 'themes';
}

function openMerchOrder() {
  mallDrawerType.value = 'merch';
}

const gradesList: GradeLevel[] = ["幼儿园", "小学生", "初中生", "高中生", "大学生", "老教授"];

function getGradeIcon(g: GradeLevel): string {
  switch (g) {
    case "幼儿园": return "🌱";
    case "小学生": return "🧣";
    case "初中生": return "🥈";
    case "高中生": return "🥇";
    case "大学生": return "🎓";
    case "老教授": return "🦉";
    default: return "⭐";
  }
}

const titlesList = [
  "传纸条课代表",
  "课堂捣蛋鬼",
  "窗台守望者",
  "后排折纸大师",
  "500米街区巡视员",
  "慢生活诗人"
];

const myGrowth = computed(() => {
  if (!myProfile.value.growth) {
    myProfile.value.growth = {
      grade: "大学生" as GradeLevel,
      title: "传纸条课代表",
      experience: 860,
      coins: 66,
      ownedSeals: ["古铜月相印", "玫瑰金猫爪印"],
      activeSeal: "古铜月相印",
      ownedPapers: ["京都古法和纸", "星空流光纸"],
      activePaper: "京都古法和纸",
      charExpandCards: 2,
      activeTheme: "wood",
      ownedThemes: ["wood", "cherry", "retro"]
    };
  }
  return myProfile.value.growth;
});

function switchGrade(grade: GradeLevel) {
  if (!myProfile.value.growth) return;
  myProfile.value.growth.grade = grade;
  saveUserProfile(myProfile.value);
  uni.showToast({ title: `已切换学级为：${grade}`, icon: "none" });
}

function selectTitle(title: string) {
  if (!myProfile.value.growth) return;
  myProfile.value.growth.title = title;
  saveUserProfile(myProfile.value);
  uni.showToast({ title: `已佩戴称号：${title}`, icon: "success" });
}

function buyCoins() {
  if (!myProfile.value.growth) return;
  myProfile.value.growth.coins += 20;
  saveUserProfile(myProfile.value);
  uni.showToast({ title: "每日签到成功，慢币 +20 🪙", icon: "success" });
}

function openMerchantPublishModal() {
  mallDrawerType.value = 'merchant';
}

function submitMerchantApply() {
  mallDrawerType.value = null;
  uni.showToast({ title: "🎉 已收到商户意向，社区管理员将在24小时内联系您", icon: "none", duration: 3000 });
}

function toggleShowPhone() {
  myProfile.value.showPhone = !myProfile.value.showPhone;
  saveUserProfile(myProfile.value);
  uni.showToast({
    title: myProfile.value.showPhone ? "已开启公开联系方式" : "已隐藏联系方式",
    icon: "none"
  });
}

function showAboutApp() {
  mallDrawerType.value = 'about';
}
</script>

<style lang="scss" scoped>
.growth-settings-tab {
  width: 100%;
  height: 100%;
  background: #f7f5f0;
  box-sizing: border-box;
  padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
}

.settings-scroll {
  height: 100%;
  padding: 12px 14px 40px;
  box-sizing: border-box;
}

/* 个人信息卡 */
.user-hero-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 14px rgba(62, 39, 35, 0.05);
  border: 0.5px solid rgba(220, 210, 198, 0.5);
}

.hero-main-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hero-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #ffd54f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.hero-info {
  flex: 1;
}

.hero-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-name {
  font-size: 17px;
  font-weight: bold;
  color: #3e2723;
}

.grade-badge {
  font-size: 11px;
  background: #eefeeb;
  color: #27ae60;
  border: 0.5px solid #a8e6cf;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: bold;
}

.title-tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.title-pill {
  font-size: 11px;
  background: #fff3e0;
  color: #e67e22;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.phone-tip {
  font-size: 11px;
  color: #999;
}

.hero-bio {
  font-size: 12px;
  color: #795548;
  margin-top: 4px;
}

.edit-arrow {
  font-size: 20px;
  color: #ccc;
}

/* 成长进度条与珐琅校徽学级 */
.growth-exp-section {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 0.5px solid #f0eae1;
}

.exp-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8d6e63;
  margin-bottom: 6px;
}

.exp-progress-bar {
  height: 7px;
  background: #ede8e1;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.exp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #10b981);
  border-radius: 4px;
}

.grades-step-row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin-top: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.grade-step-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10.5px;
  color: #8d6e63;
  padding: 4px 7px;
  border-radius: 12px;
  background: rgba(239, 235, 233, 0.7);
  border: 0.5px solid #d7ccc8;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  white-space: nowrap;

  .grade-badge-icon {
    font-size: 12px;
  }

  &.step-active {
    background: linear-gradient(135deg, #fff9c4 0%, #ffe082 100%);
    color: #b45309;
    border: 1px solid #ffd54f;
    box-shadow: 0 3px 8px rgba(245, 158, 11, 0.3);
    font-weight: 700;
    transform: translateY(-2px);
  }
}

/* 资产网格 */
.assets-grid-box {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.asset-item {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 12px rgba(62, 39, 35, 0.04);
  border: 0.5px solid rgba(220, 210, 198, 0.5);
  cursor: pointer;
  transition: transform 0.15s;

  &:active {
    transform: scale(0.96);
  }
}

.asset-num {
  font-size: 19px;
  font-weight: bold;
  color: #d84315;
  letter-spacing: 0.5px;
}

.asset-label {
  font-size: 11px;
  color: #8d6e63;
  margin-top: 3px;
}

/* 卡片模块 */
.section-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
}

.section-header {
  margin-bottom: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #3e2723;
}

.section-sub {
  font-size: 11px;
  color: #999;
  margin-left: 8px;
}

.titles-flow {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.title-chip {
  font-size: 12px;
  background: #f7f5f0;
  color: #5d4037;
  padding: 5px 12px;
  border-radius: 16px;
  border: 1px solid #ebd9c5;
}

.title-chip-active {
  background: #e67e22;
  color: #fff;
  border-color: #e67e22;
  font-weight: bold;
}

/* 特权商城 */
.privilege-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.privilege-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 0.5px solid #f5f0e8;
}

.privilege-icon {
  font-size: 26px;
}

.privilege-desc {
  flex: 1;
}

.p-title {
  font-size: 13px;
  font-weight: bold;
  color: #333;
  display: block;
}

.p-sub {
  font-size: 11px;
  color: #888;
  display: block;
  margin-top: 2px;
}

.buy-btn {
  background: #e67e22;
  color: #fff;
  font-size: 11px;
  font-weight: bold;
  border-radius: 16px;
  padding: 4px 10px;
  border: none;
}

.merchant-btn {
  background: #27ae60;
}

/* 列表操作行 */
.cell-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 0.5px solid #f5f0e8;
}

.cell-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cell-icon {
  font-size: 16px;
}

.cell-title {
  font-size: 13px;
  color: #333;
}

.cell-arrow {
  color: #ccc;
  font-size: 16px;
}

.settings-footer {
  text-align: center;
  padding: 16px;
  font-size: 11px;
  color: #aaa;
}

/* 统一治愈系吉卜力手账抽屉 (统一定制设计，杜绝脱节生硬原生弹窗) */
.ghibli-drawer-mask {
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

.ghibli-drawer-card {
  background: #fffdf8;
  border-radius: 20px 20px 0 0;
  padding: 16px 18px calc(24px + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -8px 24px rgba(62, 39, 35, 0.15);
  border-top: 1px solid rgba(220, 210, 198, 0.8);
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 82vh;
  display: flex;
  flex-direction: column;

  .drawer-header-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 16px;

    .drawer-handle {
      width: 40px;
      height: 4px;
      border-radius: 2px;
      background: #ded8ce;
      margin-bottom: 12px;
    }

    .drawer-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c2420;
    }

    .drawer-subtitle {
      font-size: 12px;
      color: #8c827a;
      margin-top: 3px;
    }
  }

  .drawer-cards-flow {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .mall-item-card {
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

      &.card-active {
        border-color: #3e2723;
        box-shadow: 0 3px 12px rgba(62, 39, 35, 0.12);
        background: #fffef2;
      }

      &.card-skin-yellow { background: #fffdf2; }
      &.card-skin-blue   { background: #f0f7fe; border-color: #cde4fa; }
      &.card-skin-pink   { background: #fef2f4; border-color: #fad2dc; }
      &.card-skin-kraft  { background: #f7f3ec; border-color: #ded1c1; }

      .seal-icon-box {
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

      .paper-icon-box, .theme-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.04);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;

        .paper-emoji, .theme-emoji {
          font-size: 22px;
        }
      }

      .mall-card-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .card-name-row {
          display: flex;
          align-items: center;
          gap: 6px;

          .mall-name {
            font-size: 15px;
            font-weight: 600;
            color: #2c2420;
          }

          .active-pill {
            font-size: 10px;
            padding: 1px 6px;
            border-radius: 8px;
            background: #3e2723;
            color: #ffffff;
            font-weight: 500;
          }

          .owned-pill {
            font-size: 10px;
            padding: 1px 6px;
            border-radius: 8px;
            background: #fbf5ea;
            color: #8c5835;
            border: 0.5px solid #ebd9c5;
          }
        }

        .mall-desc {
          font-size: 12px;
          color: #8c827a;
          margin-top: 2px;
        }
      }

      .mall-action-btn {
        margin: 0;
        padding: 0 12px;
        height: 30px;
        line-height: 30px;
        border-radius: 15px;
        background: #3e2723;
        color: #ffffff;
        font-size: 12px;
        font-weight: 600;
        border: none;
        flex-shrink: 0;
        cursor: pointer;

        &.btn-equipped {
          background: #eae7e0;
          color: #8c827a;
        }
      }
    }
  }

  /* 实体礼盒详情 */
  .merch-detail-box {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .merch-items-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .merch-prop-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 10px;
        background: #fff;
        border: 0.5px solid #ebd9c5;

        .prop-ico {
          font-size: 24px;
        }

        .prop-title {
          font-size: 14px;
          font-weight: 600;
          color: #2c2420;
          margin-right: 8px;
        }

        .prop-sub {
          font-size: 12px;
          color: #8c827a;
        }
      }
    }

    .merch-bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px dashed rgba(0, 0, 0, 0.08);

      .merch-price-col {
        display: flex;
        flex-direction: column;

        .price-val {
          font-size: 20px;
          font-weight: 700;
          color: #c25b38;
        }

        .price-tip {
          font-size: 11px;
          color: #8c827a;
        }
      }

      .order-submit-btn {
        margin: 0;
        padding: 0 16px;
        height: 38px;
        line-height: 38px;
        border-radius: 19px;
        background: #c25b38;
        color: #ffffff;
        font-size: 13px;
        font-weight: 600;
        border: none;
        box-shadow: 0 2px 8px rgba(194, 91, 56, 0.3);
      }
    }
  }

  /* 详细介绍型抽屉 (商户与关于) */
  .drawer-info-flow {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .info-content-card {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #ebd9c5;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .info-tag-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;

        .info-tag {
          font-size: 11px;
          background: #fbf5ea;
          color: #8c5835;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 500;
        }
      }

      .info-body-p {
        font-size: 13px;
        color: #5d4037;
        line-height: 1.6;
      }

      .info-privilege-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;

        .info-privilege-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #3e2723;

          .ip-ico { font-size: 14px; }
          .ip-txt { flex: 1; }
        }
      }

      .about-logo-row {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding-bottom: 8px;
        border-bottom: 1px dashed #ebd9c5;

        .about-logo-ico { font-size: 32px; }
        .about-app-name { font-size: 16px; font-weight: 700; color: #3e2723; }
        .about-version { font-size: 11px; color: #a89f91; }
      }

      .about-values-box {
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: #fdfcf9;
        padding: 10px;
        border-radius: 8px;

        .value-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;

          .v-label { font-weight: 600; color: #3e2723; }
          .v-desc { color: #8c7e74; font-size: 11px; }
        }
      }
    }

    .drawer-confirm-btn {
      margin: 0;
      height: 42px;
      line-height: 42px;
      border-radius: 21px;
      background: #3e2723;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      border: none;
      box-shadow: 0 4px 12px rgba(62, 39, 35, 0.15);
      cursor: pointer;

      &:active {
        transform: scale(0.98);
        background: #2c1a17;
      }
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
.mem-stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;

  .mem-stat-pill {
    font-size: 11px;
    font-weight: 600;
    color: #5d4037;
    background: #f5efe0;
    border: 0.5px solid #e2d5b2;
    padding: 3px 9px;
    border-radius: 10px;
  }
}

.mem-action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 12px 0;

  .mem-btn {
    text-align: center;
    padding: 10px 8px;
    border-radius: 12px;
    background: #fff8e1;
    border: 1px solid #e6c675;
    font-size: 12px;
    font-weight: 700;
    color: #3e2723;
    cursor: pointer;
  }
}

.mem-import-box {
  width: 100%;
  height: 86px;
  background: #faf6ee;
  border: 1px dashed #cbbba6;
  border-radius: 12px;
  padding: 10px;
  box-sizing: border-box;
  font-size: 12px;
  color: #3e2723;
}

.push-switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 0.5px dashed #e2d8c8;
  margin-bottom: 10px;

  .push-label {
    font-size: 13px;
    font-weight: 700;
    color: #3e2723;
  }
}

.push-group-title {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #795548;
  margin: 10px 0 8px;
}

.push-chips-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.push-chip {
  padding: 6px 12px;
  border-radius: 14px;
  background: #f5f0e4;
  border: 1px solid #e2d8c8;
  font-size: 12px;
  font-weight: 600;
  color: #5d4037;
  cursor: pointer;

  &.active {
    background: #3e2723;
    border-color: #3e2723;
    color: #fffdf8;
  }
}
/* ============ 吉卜力手账风设置页重塑样式 ============ */
.settings-inner-body {
  padding: 14px 16px calc(100px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.passport-card {
  position: relative;
  background: linear-gradient(165deg, #fffdf5 0%, #faf1d8 100%);
  border: 1px solid #e9dbb7;
  border-radius: 20px;
  padding: 18px 16px 15px;
  box-shadow: 0 6px 20px rgba(62, 39, 35, 0.06);
}

.passport-washi-tape {
  position: absolute;
  top: -6px;
  right: 28px;
  width: 48px;
  height: 13px;
  background: rgba(255, 255, 255, 0.72);
  border: 0.5px dashed rgba(141, 110, 99, 0.35);
  transform: rotate(3deg);
  border-radius: 2px;
}

.passport-top-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ava-ring {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(135deg, #d9b170, #b07d42);
  flex-shrink: 0;
  cursor: pointer;

  .passport-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid #fffdf5;
    box-sizing: border-box;
  }
}

.passport-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.passport-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.passport-name {
  font-size: 16px;
  font-weight: 700;
  color: #3e2723;
}

.passport-title-pill {
  font-size: 10px;
  font-weight: 700;
  color: #8b5a2b;
  background: rgba(217, 155, 64, 0.18);
  padding: 2px 7px;
  border-radius: 8px;
  cursor: pointer;
}

.passport-bio {
  display: block;
  font-size: 11.5px;
  color: #795548;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.passport-arrow {
  font-size: 18px;
  color: #a1887f;
  padding-left: 4px;
}

.passport-exp-wrap {
  margin-top: 14px;
}

.passport-exp-head {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  color: #8d7b6c;
  .exp-num { font-weight: 600; color: #5d4037; }
}

.passport-exp-track {
  height: 5px;
  border-radius: 4px;
  background: rgba(139, 110, 78, 0.14);
  overflow: hidden;
  margin-top: 6px;
}

.passport-exp-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #c89b54, #b8502c);
}

.assets-strip-card {
  background: #fffdf8;
  border: 1px solid #eae1d2;
  border-radius: 16px;
  padding: 13px 8px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  box-shadow: 0 3px 12px rgba(62, 39, 35, 0.04);

  .asset-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    cursor: pointer;
    position: relative;

    &:not(:last-child)::after {
      content: "";
      position: absolute;
      right: 0;
      top: 18%;
      bottom: 18%;
      width: 1px;
      background: #ece4d7;
    }

    .a-num { font-size: 17px; font-weight: 700; color: #3e2723; }
    .a-lbl { font-size: 10.5px; color: #8d7b6c; }
  }
}

.st-group-title {
  font-size: 11px;
  font-weight: 700;
  color: #9a8776;
  padding-left: 6px;
  margin-bottom: -6px;
  letter-spacing: 0.6px;

  &.no-margin { margin-bottom: 0; }
}

.st-group-card {
  background: #fffdf8;
  border: 1px solid #eae1d2;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 3px 12px rgba(62, 39, 35, 0.04);
}

.st-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  cursor: pointer;

  &:not(:last-child) {
    border-bottom: 0.5px solid #f0e9dc;
  }

  .st-ico {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: #f6efe2;
    color: #5d4037;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg { width: 17px; height: 17px; }

    &.accent {
      background: rgba(194, 91, 56, 0.11);
      color: #c25b38;
    }
  }

  .st-main {
    flex: 1;
    min-width: 0;

    .st-title { display: block; font-size: 13.5px; font-weight: 600; color: #3e2723; }
    .st-sub { display: block; font-size: 11px; color: #9a8776; margin-top: 2px; }
  }

  .st-right {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11.5px;
    color: #8d7b6c;
    flex-shrink: 0;
    .st-arr { font-size: 15px; color: #b5a392; }
  }
}

.atelier-head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px;
  margin-bottom: -6px;

  .atelier-motto {
    font-size: 10.5px;
    color: #b09a84;
  }
}

.atelier-scroll {
  width: 100%;
  white-space: nowrap;
}

.atelier-row {
  display: inline-flex;
  gap: 10px;
  padding: 2px 2px 4px;
}

.atelier-card {
  width: 132px;
  background: #fffdf8;
  border: 1px solid #eae1d2;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 3px 10px rgba(62, 39, 35, 0.04);
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  box-sizing: border-box;

  .atelier-swatch {
    height: 52px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;

    &.sw-seal { background: linear-gradient(135deg, #f7e7ce, #ead0a8); }
    &.sw-paper { background: linear-gradient(135deg, #e7eef5, #d2dfec); }
    &.sw-desk { background: linear-gradient(135deg, #e8efe4, #d0dfc9); }
    &.sw-gift { background: linear-gradient(135deg, #f6e4df, #e8cac1); }
  }

  .atelier-name { font-size: 12.5px; font-weight: 700; color: #3e2723; }
  .atelier-price { font-size: 11px; font-weight: 600; color: #b8502c; }
}
</style>
