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
</style>
