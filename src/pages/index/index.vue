<template>
  <view class="app-layout">
    <view class="container">
      <!-- 全局小标签订阅轻推送横幅（需求 19） -->
      <view
        v-if="activePushBanner"
        class="global-push-paper-banner"
        :style="{ top: (statusBarHeight + 10) + 'px' }"
        @tap="handleOpenPushedNote"
      >
        <view class="push-banner-left">
          <text class="push-banner-title">{{ activePushBanner.title }}</text>
          <text class="push-banner-body">{{ activePushBanner.content }}</text>
        </view>
        <text class="push-banner-close" @tap.stop="dismissPushBanner">✕</text>
      </view>

      <!-- 微信四大底层页签内容 -->
      <!-- 1. 小便签 (高德地图 500米圈与便签流) -->
      <view v-show="mainTab === 'map' || mainTab === 'notes'" class="map-tab-container">
        <!-- 地图顶栏 (胶囊切换器) -->
        <TopNav />
        <MapView v-if="mapSubTab === 'map'" />
        <RecommendView v-if="mapSubTab === 'recommend'" />
        <MomentsView v-if="mapSubTab === 'moments'" />
        <AcgnView v-if="mapSubTab === 'acgn'" />
      </view>

      <!-- 2. 小纸条 (慢聊天系统) -->
      <SlowNotesTab v-show="mainTab === 'slowNotes' || mainTab === 'chats'" />

      <!-- 3. 通讯录 (兼容保留) -->
      <ContactsTab v-show="mainTab === 'contacts'" />

      <!-- 4. 桌洞 (面对窗户的写字台拟物空间) -->
      <DeskHoleTab v-show="mainTab === 'deskHole'" />

      <!-- 5. 设置 / 成长体系 -->
      <GrowthSettingsTab v-show="mainTab === 'settings' || mainTab === 'me'" />

      <!-- 6. 小宇宙 (漂流瓶保留) -->
      <UniverseTab v-show="mainTab === 'universe'" />

      <!-- 底部五大页签 TabBar -->
      <WeChatTabBar />

      <!-- 弹窗层 (z-index 分层管理) -->
      <DetailSheet />
      <PublishSheet />
      <MyProfileSheet />
      <FriendsSheet />
      <ClusterSheet />
      <ChatSheet />
      <UserCardModal />
      <HelpSheet />
      <AiMatchSheet />
      <!-- 微信全屏大图预览灯箱弹窗 -->
      <ImagePreviewModal />
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAppState } from "../../composables/useAppState";
import {
  TopNav, WeChatTabBar, ImagePreviewModal,
  ContactsTab, ChatsTab, UniverseTab, MeTab,
  DeskHoleTab, SlowNotesTab, GrowthSettingsTab,
  MapView, MomentsView, RecommendView, AcgnView,
  DetailSheet, PublishSheet, HelpSheet, MyProfileSheet,
  FriendsSheet, ChatSheet, ClusterSheet, UserCardModal, AiMatchSheet
} from "../../components";

const {
  mainTab,
  mapSubTab,
  statusBarHeight,
  activePushBanner,
  dismissPushBanner,
  openDetailSheet,
  initApp
} = useAppState();

function handleOpenPushedNote() {
  const st = activePushBanner.value?.status;
  dismissPushBanner();
  if (st) {
    openDetailSheet(st);
  }
}

onMounted(() => {
  initApp();
});
</script>

<style lang="scss" scoped>
.app-layout {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  background: radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 70%, #020617 100%);
}

.container {
  width: 100%;
  height: 100%;
  height: 100dvh;
  position: relative;
  overflow: hidden;
  background-color: #f8fafc;

  @media (min-width: 768px) {
    max-width: 430px;
    height: 100vh;
    height: 100dvh;
    margin: 0 auto;
    box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
    position: relative;
  }
}

.map-tab-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.global-push-paper-banner {
  position: absolute;
  left: 14px;
  right: 14px;
  z-index: 300;
  background: linear-gradient(180deg, #fffef4 0%, #fdf3cf 100%);
  border: 1px solid #e6d194;
  border-radius: 14px;
  padding: 10px 14px;
  box-shadow: 0 10px 26px rgba(62, 39, 35, 0.22);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;

  .push-banner-left {
    flex: 1;
    min-width: 0;
  }

  .push-banner-title {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: #c25b38;
  }

  .push-banner-body {
    display: block;
    font-size: 12px;
    color: #3e2723;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .push-banner-close {
    font-size: 13px;
    color: #8d6e63;
    padding: 4px;
  }
}
</style>
