<template>
  <view class="app-layout">
    <view class="container">
      <!-- 顶部导航 -->
      <TopNav />

      <!-- 地图模式 -->
      <MapView v-if="activeTab === 'map'" />

      <!-- 朋友圈模式 -->
      <MomentsView v-if="activeTab === 'moments'" />

      <!-- 弹窗层 (z-index 分层管理) -->
      <DetailSheet />
      <PublishSheet />
      <MyProfileSheet />
      <FriendsSheet />
      <ClusterSheet />
      <ChatSheet />
      <UserCardModal />
      <HelpSheet />
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAppState } from "../../composables/useAppState";
import TopNav from "../../components/TopNav.vue";
import MapView from "../../components/MapView.vue";
import MomentsView from "../../components/MomentsView.vue";
import DetailSheet from "../../components/DetailSheet.vue";
import PublishSheet from "../../components/PublishSheet.vue";
import HelpSheet from "../../components/HelpSheet.vue";
import MyProfileSheet from "../../components/MyProfileSheet.vue";
import FriendsSheet from "../../components/FriendsSheet.vue";
import ChatSheet from "../../components/ChatSheet.vue";
import ClusterSheet from "../../components/ClusterSheet.vue";
import UserCardModal from "../../components/UserCardModal.vue";

const { activeTab, initApp } = useAppState();

onMounted(() => {
  initApp();
});
</script>

<style lang="scss" scoped>
.app-layout {
  width: 100%;
  width: 100vw;
  height: 100%;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  overflow: hidden;
}

.container {
  width: 100%;
  max-width: 480px;
  height: 100%;
  height: 100dvh;
  position: relative;
  overflow: hidden;
  background-color: #f8fafc;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.4);

  @media (max-width: 768px) {
    max-width: 100%;
    box-shadow: none;
  }
}
</style>
