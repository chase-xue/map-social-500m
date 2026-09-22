<template>
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
.container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #eef2f6;
}
</style>
