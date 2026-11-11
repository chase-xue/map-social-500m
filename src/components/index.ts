/**
 * 组件模块统一入口导出 (Component Barrel Exports)
 */

// 1. 公共与全局布局组件 (Common)
export { default as TopNav } from "./common/TopNav.vue";
export { default as WeChatTabBar } from "./common/WeChatTabBar.vue";
export { default as ImagePreviewModal } from "./common/ImagePreviewModal.vue";

// 2. 底部四大主页签核心页面 (Tabs)
export { default as ContactsTab } from "./tabs/ContactsTab.vue";
export { default as ChatsTab } from "./tabs/ChatsTab.vue";
export { default as MeTab } from "./tabs/MeTab.vue";

// 3. 首页四大内容流视图 (Feeds)
export { default as MapView } from "./feeds/MapView.vue";
export { default as MomentsView } from "./feeds/MomentsView.vue";
export { default as RecommendView } from "./feeds/RecommendView.vue";
export { default as AcgnView } from "./feeds/AcgnView.vue";

// 4. 全屏二级业务抽屉与弹窗 (Modals)
export { default as DetailSheet } from "./modals/DetailSheet.vue";
export { default as PublishSheet } from "./modals/PublishSheet.vue";
export { default as HelpSheet } from "./modals/HelpSheet.vue";
export { default as MyProfileSheet } from "./modals/MyProfileSheet.vue";
export { default as UserCardModal } from "./modals/UserCardModal.vue";
export { default as ChatSheet } from "./modals/ChatSheet.vue";
export { default as FriendsSheet } from "./modals/FriendsSheet.vue";
export { default as ClusterSheet } from "./modals/ClusterSheet.vue";
