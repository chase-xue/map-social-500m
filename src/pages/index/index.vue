<template>
  <view class="app-layout">
    <view class="container">
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
