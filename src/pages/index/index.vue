<template>
  <view class="app-layout">
    <view class="container">
      <!-- 微信四大底层页签内容 -->
      <!-- 1. 地图 (500米 Zenly 地图与朋友圈) - 居首位 -->
      <view v-show="mainTab === 'map'" class="map-tab-container">
        <!-- 地图顶栏 (胶囊切换器) -->
        <TopNav />
        <MapView v-if="mapSubTab === 'map'" />
        <RecommendView v-if="mapSubTab === 'recommend'" />
        <MomentsView v-if="mapSubTab === 'moments'" />
        <AcgnView v-if="mapSubTab === 'acgn'" />
      </view>

      <!-- 2. 通讯录 -->
      <ContactsTab v-show="mainTab === 'contacts'" />

      <!-- 3. 聊天 (微信) -->
      <ChatsTab v-show="mainTab === 'chats'" />

      <!-- 4. 小宇宙 (漂流瓶海洋) -->
      <UniverseTab v-show="mainTab === 'universe'" />

      <!-- 5. 我 -->
      <MeTab v-show="mainTab === 'me'" />

      <!-- 微信原生四大底层页签 TabBar -->
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
  MapView, MomentsView, RecommendView, AcgnView,
  DetailSheet, PublishSheet, HelpSheet, MyProfileSheet,
  FriendsSheet, ChatSheet, ClusterSheet, UserCardModal, AiMatchSheet
} from "../../components";

const { mainTab, mapSubTab, initApp } = useAppState();

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
</style>
