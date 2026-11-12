<template>
  <view class="growth-settings-tab" :style="{ paddingTop: statusBarHeight + 'px' }">
    <scroll-view scroll-y class="settings-scroll">
      <!-- 个人资料卡片与学级头衔 -->
      <view class="user-hero-card">
        <view class="hero-main-row">
          <image class="hero-avatar" :src="myProfile.avatar" mode="aspectFill" @tap="openMyProfileSheet" />
          <view class="hero-info" @tap="openMyProfileSheet">
            <view class="hero-name-row">
              <text class="hero-name">{{ myProfile.name }}</text>
              <text class="grade-badge">{{ myGrowth.grade }}</text>
            </view>
            <view class="title-tag-row">
              <text class="title-pill">🏅 {{ myGrowth.title }}</text>
              <text class="phone-tip">{{ myProfile.phone ? myProfile.phone.slice(0, 3) + '****' + myProfile.phone.slice(7) : '未绑定手机号' }}</text>
            </view>
            <text class="hero-bio">{{ myProfile.bio || '慢下来，在500米里写下真实的自己' }}</text>
          </view>
          <view class="edit-arrow" @tap="openMyProfileSheet">›</view>
        </view>

        <!-- 学级经验与成长进度条 -->
        <view class="growth-exp-section">
          <view class="exp-header">
            <text class="exp-title">学级成长值</text>
            <text class="exp-val">{{ myGrowth.experience }}/1000 EXP</text>
          </view>
          <view class="exp-progress-bar">
            <view class="exp-progress-fill" :style="{ width: (myGrowth.experience / 10) + '%' }" />
          </view>
          <view class="grades-step-row">
            <text
              v-for="g in gradesList"
              :key="g"
              class="grade-step-item"
              :class="{ 'step-active': myGrowth.grade === g }"
              @tap="switchGrade(g)"
            >
              {{ g }}
            </text>
          </view>
        </view>
      </view>

      <!-- 钱包与纸条道具资产区 -->
      <view class="assets-grid-box">
        <view class="asset-item" @tap="buyCoins">
          <text class="asset-num">{{ myGrowth.coins }}</text>
          <text class="asset-label">🪙 慢币余额</text>
        </view>
        <view class="asset-item" @tap="buySpeedTicket">
          <text class="asset-num">{{ myGrowth.speedTickets }}</text>
          <text class="asset-label">🚀 极速加速券</text>
        </view>
        <view class="asset-item" @tap="buyCharCard">
          <text class="asset-num">{{ myGrowth.charExpandCards }}</text>
          <text class="asset-label">📝 字数扩充包</text>
        </view>
      </view>

      <!-- 称号库选择区 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">🎖️ 佩戴专属趣味称号</text>
          <text class="section-sub">在小纸条与便签详情展示</text>
        </view>
        <view class="titles-flow">
          <view
            v-for="t in titlesList"
            :key="t"
            class="title-chip"
            :class="{ 'title-chip-active': myGrowth.title === t }"
            @tap="selectTitle(t)"
          >
            <text>{{ t }}</text>
          </view>
        </view>
      </view>

      <!-- 商业化与增值特权商城 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">💎 慢纸条会员中心 & 增值特权</text>
        </view>
        <view class="privilege-list">
          <view class="privilege-item" @tap="buySpeedTicket">
            <view class="privilege-icon">🚀</view>
            <view class="privilege-desc">
              <text class="p-title">1 元纸条极速加速包</text>
              <text class="p-sub">远距离纸条免等待，立即闪速滑入对方桌洞</text>
            </view>
            <button class="buy-btn">¥1 / 3张</button>
          </view>

          <view class="privilege-item" @tap="buyCharCard">
            <view class="privilege-icon">📝</view>
            <view class="privilege-desc">
              <text class="p-title">便签字数扩充卡</text>
              <text class="p-sub">解除 70 字限制，单张便签支持书写 300 字长文</text>
            </view>
            <button class="buy-btn">¥3 / 张</button>
          </view>

          <view class="privilege-item" @tap="openMerchantPublishModal">
            <view class="privilege-icon">🏪</view>
            <view class="privilege-desc">
              <text class="p-title">本地商户 500m 定向便签投放</text>
              <text class="p-sub">面向周边500米生活圈定向发布优惠打卡便签</text>
            </view>
            <button class="buy-btn merchant-btn">商户入驻</button>
          </view>
        </view>
      </view>

      <!-- 个人设置功能列表 -->
      <view class="section-card">
        <view class="cell-action-row" @tap="openMyProfileSheet">
          <view class="cell-left">
            <text class="cell-icon">👤</text>
            <text class="cell-title">个人信息修改 (头像/昵称/职业/MBTI)</text>
          </view>
          <text class="cell-arrow">›</text>
        </view>
        <view class="cell-action-row" @tap="toggleShowPhone">
          <view class="cell-left">
            <text class="cell-icon">📱</text>
            <text class="cell-title">向 500 米内邻友公开联系电话</text>
          </view>
          <switch :checked="myProfile.showPhone" color="#07c160" @change="toggleShowPhone" />
        </view>
        <view class="cell-action-row" @tap="showAboutApp">
          <view class="cell-left">
            <text class="cell-icon">📜</text>
            <text class="cell-title">关于《小纸条》与慢生活理念</text>
          </view>
          <text class="cell-arrow">›</text>
        </view>
      </view>

      <view class="settings-footer">
        <text>《小纸条》v2.0 · 让生活重回慢节奏与真诚</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { GradeLevel } from "../../types";
import { useAppState } from "../../composables/useAppState";
import { saveUserProfile } from "../../services/storage";

const {
  statusBarHeight,
  myProfile,
  openMyProfileSheet
} = useAppState();

const gradesList: GradeLevel[] = ["幼儿园", "小学生", "初中生", "高中生", "大学生", "老教授"];

const titlesList = [
  "传纸条课代表",
  "课堂捣蛋鬼",
  "窗台守望者",
  "后排折纸大师",
  "500米街区巡视员",
  "慢生活诗人"
];

const myGrowth = computed(() => {
  return myProfile.value.growth || {
    grade: "大学生" as GradeLevel,
    title: "传纸条课代表",
    experience: 860,
    coins: 66,
    speedTickets: 3,
    charExpandCards: 2,
    activeTheme: "wood",
    ownedThemes: ["wood", "cherry", "retro"]
  };
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

function buySpeedTicket() {
  if (!myProfile.value.growth) return;
  myProfile.value.growth.speedTickets += 3;
  saveUserProfile(myProfile.value);
  uni.showToast({ title: "已成功获得 3 张极速加速券 🚀", icon: "success" });
}

function buyCharCard() {
  if (!myProfile.value.growth) return;
  myProfile.value.growth.charExpandCards += 1;
  saveUserProfile(myProfile.value);
  uni.showToast({ title: "已领取便签字数扩充卡 📝", icon: "success" });
}

function openMerchantPublishModal() {
  uni.showModal({
    title: "本地商户 500m 投放",
    content: "支持周边生活小店、餐饮手作人投放定向便签，附带打卡优惠券，随叫随到！",
    confirmText: "立即申请",
    showCancel: true
  });
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
  uni.showModal({
    title: "关于《小纸条》",
    content: "灵感来自学生时代前后座传递的小纸条与家门口的小告示。没有冰冷算法推荐，根据真实物理距离换算传递时间，打造属于现代人的慢社交与生活回忆录。",
    showCancel: false,
    confirmText: "温暖同行"
  });
}
</script>

<style lang="scss" scoped>
.growth-settings-tab {
  width: 100%;
  height: 100%;
  background: #f7f5f0;
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
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
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
  border: 2px solid #ebd9c5;
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

/* 成长进度条 */
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
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
}

.exp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff9800, #4caf50);
  border-radius: 3px;
}

.grades-step-row {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

.grade-step-item {
  font-size: 10px;
  color: #999;
  padding: 2px 4px;
  border-radius: 4px;
}

.step-active {
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: bold;
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
}

.asset-num {
  font-size: 18px;
  font-weight: bold;
  color: #d84315;
}

.asset-label {
  font-size: 11px;
  color: #8d6e63;
  margin-top: 2px;
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
</style>
