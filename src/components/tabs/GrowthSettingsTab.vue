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
            <view
              v-for="g in gradesList"
              :key="g"
              class="grade-step-item"
              :class="{ 'step-active': myGrowth.grade === g }"
              @tap="switchGrade(g)"
            >
              <text class="grade-badge-icon">{{ getGradeIcon(g) }}</text>
              <text class="grade-badge-text">{{ g }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 钱包与纸条文创资产区 -->
      <view class="assets-grid-box">
        <view class="asset-item" @tap="buyCoins">
          <text class="asset-num">{{ myGrowth.coins }}</text>
          <text class="asset-label">🪙 慢币余额</text>
        </view>
        <view class="asset-item" @tap="openSealsMall">
          <text class="asset-num">{{ myGrowth.ownedSeals?.length || 2 }} 款</text>
          <text class="asset-label">🔏 火漆印章库</text>
        </view>
        <view class="asset-item" @tap="openPapersMall">
          <text class="asset-num">{{ myGrowth.ownedPapers?.length || 2 }} 款</text>
          <text class="asset-label">📜 典藏特权信纸</text>
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

      <!-- 🏮 小纸条情怀文创小铺 & 拟物空间馆 (皮肤经济) -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">🏮 小纸条情怀文创小铺 & 拟物空间馆</text>
          <text class="section-sub">坚守慢节奏纯粹性 · 拒绝破坏慢社交的提速特权</text>
        </view>
        <view class="privilege-list">
          <view class="privilege-item" @tap="openSealsMall">
            <view class="privilege-icon">🔏</view>
            <view class="privilege-desc">
              <text class="p-title">珍藏特权火漆印章外观包</text>
              <text class="p-sub">古铜月相印、玫瑰金猫爪印、欧式皇家徽印（永久个性盖章）</text>
            </view>
            <button class="buy-btn">¥6 / 永久拥有</button>
          </view>

          <view class="privilege-item" @tap="openPapersMall">
            <view class="privilege-icon">📜</view>
            <view class="privilege-desc">
              <text class="p-title">典藏和纸与星空信笺套装</text>
              <text class="p-sub">京都古法和纸、星空流光纸、午后羊皮卷信纸（信纸皮肤外观）</text>
            </view>
            <button class="buy-btn">¥9 / 永久解锁</button>
          </view>

          <view class="privilege-item" @tap="openThemesMall">
            <view class="privilege-icon">🪵</view>
            <view class="privilege-desc">
              <text class="p-title">治愈桌洞拟物化装扮皮肤</text>
              <text class="p-sub">雨夜咖啡馆、京都老书屋、温室花房花草写字台（沉浸书桌皮肤）</text>
            </view>
            <button class="buy-btn">¥12 / 沉浸装扮</button>
          </view>

          <view class="privilege-item" @tap="openMerchOrder">
            <view class="privilege-icon">🎁</view>
            <view class="privilege-desc">
              <text class="p-title">《小纸条》实体文创慢寄礼盒</text>
              <text class="p-sub">手工黄铜折纸飞机书签 + 手账和纸胶带盲盒 + 慢递信笺</text>
            </view>
            <button class="buy-btn merch-btn">¥39 / 慢递包邮</button>
          </view>

          <view class="privilege-item" @tap="openMerchantPublishModal">
            <view class="privilege-icon">🏪</view>
            <view class="privilege-desc">
              <text class="p-title">本地小店 500m 生活圈便签定向投放</text>
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

function openSealsMall() {
  const g = myProfile.value.growth;
  if (!g) return;
  const seals = [
    { name: "古铜月相印", desc: "复古慢调，手工压印质感" },
    { name: "玫瑰金猫爪印", desc: "温暖治愈，猫爪肉垫浮雕" },
    { name: "欧式皇家徽印", desc: "典雅贵气，双狮展翼纹章", price: 30 }
  ];
  const itemList = seals.map(s => {
    const isOwned = g.ownedSeals?.includes(s.name);
    const isActive = g.activeSeal === s.name;
    return `${s.name}${isActive ? ' (当前佩戴)' : isOwned ? ' (已拥有·点击更换)' : ' (¥6 / 30慢币解锁)'}`;
  });

  uni.showActionSheet({
    itemList,
    success: (res) => {
      const selected = seals[res.tapIndex];
      if (!selected) return;
      if (!g.ownedSeals) g.ownedSeals = ["古铜月相印", "玫瑰金猫爪印"];
      if (g.ownedSeals.includes(selected.name)) {
        g.activeSeal = selected.name;
        saveUserProfile(myProfile.value);
        uni.showToast({ title: `已佩戴火漆印章：${selected.name}`, icon: "success" });
      } else {
        uni.showModal({
          title: `解锁「${selected.name}」`,
          content: `${selected.desc}\n需消耗 30 慢币（或特权外观 ¥6），是否立即解锁？`,
          confirmText: "解锁",
          success: (m) => {
            if (m.confirm) {
              if (g.coins >= 30) {
                g.coins -= 30;
              }
              g.ownedSeals.push(selected.name);
              g.activeSeal = selected.name;
              saveUserProfile(myProfile.value);
              uni.showToast({ title: `成功解锁并佩戴 ${selected.name} 🔏`, icon: "success" });
            }
          }
        });
      }
    }
  });
}

function openPapersMall() {
  const g = myProfile.value.growth;
  if (!g) return;
  const papers = [
    { name: "京都古法和纸", desc: "温润纤维手感，水墨晕染底纹" },
    { name: "星空流光纸", desc: "深蓝渐变微光，适合夜读纸条" },
    { name: "午后羊皮卷信纸", desc: "怀旧中世纪泛黄卷边，手感厚重", price: 40 }
  ];
  const itemList = papers.map(p => {
    const isOwned = g.ownedPapers?.includes(p.name);
    const isActive = g.activePaper === p.name;
    return `${p.name}${isActive ? ' (当前使用)' : isOwned ? ' (已拥有·点击更换)' : ' (¥9 / 40慢币解锁)'}`;
  });

  uni.showActionSheet({
    itemList,
    success: (res) => {
      const selected = papers[res.tapIndex];
      if (!selected) return;
      if (!g.ownedPapers) g.ownedPapers = ["京都古法和纸", "星空流光纸"];
      if (g.ownedPapers.includes(selected.name)) {
        g.activePaper = selected.name;
        saveUserProfile(myProfile.value);
        uni.showToast({ title: `已换上信笺：${selected.name}`, icon: "success" });
      } else {
        uni.showModal({
          title: `解锁「${selected.name}」`,
          content: `${selected.desc}\n需消耗 40 慢币（或典藏套装 ¥9），是否立即解锁？`,
          confirmText: "解锁",
          success: (m) => {
            if (m.confirm) {
              if (g.coins >= 40) {
                g.coins -= 40;
              }
              g.ownedPapers.push(selected.name);
              g.activePaper = selected.name;
              saveUserProfile(myProfile.value);
              uni.showToast({ title: `已解锁特权信笺 ${selected.name} 📜`, icon: "success" });
            }
          }
        });
      }
    }
  });
}

function openThemesMall() {
  const g = myProfile.value.growth;
  if (!g) return;
  const themes: { id: DeskTheme; name: string; desc: string }[] = [
    { id: "wood", name: "温暖原木书桌", desc: "怀旧学生课桌，温暖木质纹理" },
    { id: "cherry", name: "樱花漫舞台", desc: "清爽微粉调，落樱时光" },
    { id: "retro", name: "雨夜复古咖啡馆", desc: "深色红木，微暗暖光雨声" },
    { id: "modern", name: "温室花房透光台", desc: "绿色植物环绕，玻璃天窗阳光" }
  ];
  const itemList = themes.map(t => {
    const isOwned = g.ownedThemes?.includes(t.id);
    const isActive = g.activeTheme === t.id;
    return `${t.name}${isActive ? ' (当前装扮)' : isOwned ? ' (已拥有·点击切换)' : ' (¥12 / 沉浸装扮)'}`;
  });

  uni.showActionSheet({
    itemList,
    success: (res) => {
      const selected = themes[res.tapIndex];
      if (!selected) return;
      if (!g.ownedThemes) g.ownedThemes = ["wood", "cherry", "retro"];
      if (g.ownedThemes.includes(selected.id)) {
        g.activeTheme = selected.id;
        saveUserProfile(myProfile.value);
        uni.showToast({ title: `已应用桌洞皮肤：${selected.name}`, icon: "success" });
      } else {
        uni.showModal({
          title: `装扮「${selected.name}」`,
          content: `${selected.desc}\n是否立即解锁并应用该沉浸书桌装扮？`,
          confirmText: "立即装扮",
          success: (m) => {
            if (m.confirm) {
              g.ownedThemes.push(selected.id);
              g.activeTheme = selected.id;
              saveUserProfile(myProfile.value);
              uni.showToast({ title: `已装扮 ${selected.name} 🪵`, icon: "success" });
            }
          }
        });
      }
    }
  });
}

function openMerchOrder() {
  uni.showModal({
    title: "🎁 《小纸条》实体文创慢寄礼盒",
    content: "内含：\n1. 手工黄铜折纸飞机金属书签\n2. 500米慢生活原创和纸胶带盲盒\n3. 纯棉质感慢递信纸信封套装\n\n¥39 包邮 · 预计 3-5 天慢递送到您的案头。",
    confirmText: "慢递预订",
    cancelText: "再看看",
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: "已加入慢递清单，感谢支持纯粹情怀！", icon: "success" });
      }
    }
  });
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
</style>
