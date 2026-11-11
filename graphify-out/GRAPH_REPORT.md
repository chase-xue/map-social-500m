# Graph Report - map  (2026-11-11)

## Corpus Check
- 48 files · ~37,967 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 560 nodes · 925 edges · 24 communities (23 shown, 1 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 70 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6fc88de9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAppState.ts
- storage.ts
- scripts
- manifest.json
- index.vue
- compilerOptions
- app-plus
- useAppState
- getFriendsList
- devDependencies
- amap
- submitHelpPost
- onMarkerTap
- acceptFriendFromCard
- saveMyProfile
- formatTime
- ✨ 新增功能
- AcgnView.vue
- 🗺️ 500米邻里社交圈 - 完整项目知识图谱与速查指引
- MeTab.vue
- ImagePreviewModal.vue
- RecommendView.vue

## God Nodes (most connected - your core abstractions)
1. `useAppState()` - 95 edges
2. `readLocalData()` - 20 edges
3. `compilerOptions` - 14 edges
4. `getFriendsList()` - 11 edges
5. `500米地图生活圈 · 用户交互手册与开发设计规范` - 11 edges
6. `scripts` - 10 edges
7. `sendChatMessage()` - 10 edges
8. `writeLocalData()` - 9 edges
9. `submitNewPost()` - 8 edges
10. `submitHelpPost()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `handleToggleLike()` --calls--> `toggleLikeStatus()`  [EXTRACTED]
  src/components/modals/DetailSheet.vue → src/composables/useAppState.ts
- `sendFriendRequest()` --calls--> `request()`  [EXTRACTED]
  src/api/friends.ts → src/api/client.ts
- `getNearbyStatuses()` --calls--> `filterStatusesWithinRange()`  [EXTRACTED]
  src/api/status.ts → src/services/geo.ts
- `getRecommendedStatuses()` --calls--> `readLocalData()`  [EXTRACTED]
  src/api/status.ts → src/services/storage.ts
- `getAcgnStatuses()` --calls--> `readLocalData()`  [EXTRACTED]
  src/api/status.ts → src/services/storage.ts

## Import Cycles
- None detected.

## Communities (24 total, 1 thin omitted)

### Community 0 - "useAppState.ts"
Cohesion: 0.03
Nodes (78): acgnStatuses, acgnTag, activeActionMenuStatusId, activeCluster, activeHelpStatuses, activeStatus, activeTab, aiMatchResults (+70 more)

### Community 1 - "storage.ts"
Cohesion: 0.06
Nodes (37): getAuthToken(), request(), RequestOptions, sendFriendRequest(), ApiResponse, CreateCommentDTO, CreateStatusDTO, PaginationParams (+29 more)

### Community 2 - "scripts"
Cohesion: 0.05
Nodes (41): @dcloudio/types, @dcloudio/uni-app, @dcloudio/uni-app-plus, @dcloudio/uni-cli-shared, @dcloudio/uni-components, @dcloudio/uni-h5, @dcloudio/uni-mp-toutiao, @dcloudio/uni-mp-weixin (+33 more)

### Community 3 - "manifest.json"
Cohesion: 0.09
Nodes (26): chooseLocation, getLocation, appid, description, mp-toutiao, appid, permission, requiredPrivateInfos (+18 more)

### Community 4 - "index.vue"
Cohesion: 0.04
Nodes (29): {
  statusBarHeight, mapSubTab, visibleStatuses, acgnStatuses, myProfile, openPublishSheet
}, {
  mainTab, switchMainTab, unreadChatsCount, pendingFriendsCount,
  visibleStatuses, hasActiveEmergency
}, {
  mapCenter, mapScale, mapMarkers, mapCircles,
  onMarkerTap, onCalloutTap, onRegionChange,
  recenterToUser, refreshNearbyStatuses, simulateUserMove,
  visibleStatuses, openPublishSheet, openDetailSheet, locationClusters,
  activeHelpStatuses, hasActiveEmergency, openHelpSheet, myActiveHelp,
  openAiMatchSheet
}, topEmergencyHelp, {
  statusBarHeight, myProfile, sortedMomentsStatuses, activeHelpStatuses,
  openMyProfileSheet, openPublishSheet, viewAuthorProfile, viewCommenterProfile,
  previewImage, toggleLikeStatus, openDetailSheet, formatTime, isHelpResolvedPromptVisible,
  activeActionMenuStatusId, toggleActionMenu, closeActionMenu, handleLikeFromMenu,
  inPlaceCommentVisible, inPlaceCommentTarget, inPlaceReplyToUser, inPlaceCommentText,
  openInPlaceComment, closeInPlaceComment, handleSendInPlaceComment,
}, topEmergencyHelp, {
  statusBarHeight, chatSheetVisible, currentChatFriend, currentChatMessages, newChatMessageText,
  chatScrollTop, myProfile,
  closeChatSheet, sendCurrentChatMessage, formatTime, openUserProfileCard,
}, {
  clusterVisible,
  activeCluster,
  statusBarHeight,
  closeClusterSheet,
  previewImage,
  jumpToMomentsFromCluster,
  formatTime,
  openDetailSheet,
} (+21 more)

### Community 5 - "compilerOptions"
Cohesion: 0.09
Nodes (22): @dcloudio/types, DOM, ESNext, src/**/*.d.ts, src/**/*.ts, src/**/*.tsx, src/**/*.vue, compilerOptions (+14 more)

### Community 6 - "app-plus"
Cohesion: 0.06
Nodes (36): <uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\"/>, <uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\"/>, <uses-permission android:name=\"android.permission.CAMERA\"/>, <uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>, <uses-permission android:name=\"android.permission.WRITE_EXTERNAL_STORAGE\"/>, appkey_android, appkey_ios, key (+28 more)

### Community 7 - "useAppState"
Cohesion: 0.07
Nodes (38): addPresetSamplePhoto(), chooseHelpImages(), chooseImages(), closeActionMenu(), closeChatSheet(), closeClusterSheet(), closeDetailSheet(), closeFriendsSheet() (+30 more)

### Community 8 - "getFriendsList"
Cohesion: 0.09
Nodes (44): createStatus(), getAcgnStatuses(), getNearbyStatuses(), getRecommendedStatuses(), getUserAllStatuses(), postCommentApi(), toggleLikeStatusApi(), handleApply() (+36 more)

### Community 9 - "devDependencies"
Cohesion: 0.08
Nodes (23): Commit 规范, Contributing Guide, PR 检查清单, 代码风格, 💡 功能建议, 开发流程, 📝 开发环境搭建, 🐛 报告 Bug (+15 more)

### Community 10 - "amap"
Cohesion: 0.08
Nodes (24): 1.1 核心价值：超近距离 500m LBS 真实生活圈, 1.2 视觉与交互规范：微信 8.0 原生标准, 1. 产品定位与核心设计哲学, 2. 底层架构与四大主页签体系, 3.1 【首页】页签 (Home / Map Tab), 3.2 【通讯录】页签 (Contacts Tab), 3.3 【消息】页签 (Chats Tab), 3.4 【更多】页签 (Me / More Tab) (+16 more)

### Community 11 - "submitHelpPost"
Cohesion: 0.40
Nodes (6): handlePublish(), chooseCommentImage(), chooseNewAvatar(), closePublishSheet(), submitNewPost(), saveLocalImageFile()

### Community 12 - "onMarkerTap"
Cohesion: 0.11
Nodes (23): BOTTLE_TAGS, confirmReply(), confirmThrow(), inputContent, isReplying, replyText, selectedTag, {
  statusBarHeight,
  universeSubTab,
  shellCount,
  allDriftBottles,
  fishedBottle,
  throwBottleModalVisible,
  readBottleModalVisible,
  bottleMsgModalVisible,
  openThrowBottleModal,
  closeThrowBottleModal,
  handleThrowBottle,
  handleFishBottle,
  closeReadBottleModal,
  handleReplyBottle,
  mapSubTab,
  switchMainTab,
} (+15 more)

### Community 13 - "acceptFriendFromCard"
Cohesion: 0.50
Nodes (4): onCalloutTap(), onMarkerTap(), openClusterSheet(), openDetailSheet()

### Community 15 - "saveMyProfile"
Cohesion: 0.09
Nodes (21): 1.1 产品愿景, 1.2 核心价值与业务场景, 2.1 容器宽度防溢出技术原理 (Anti-Overflow Paradigm), 3.1 动态与求助模型 (StatusItem), 3.2 个人资料模型 (UserProfile), 4.1 动态发布交互规范 (Publish Workflow), 4.2 邻里急事求助与救命呼救全流程 (Help & Emergency Workflow), 4.3.1 底部固定评论栏与“自己给自己评论”交互规范： (+13 more)

### Community 18 - "✨ 新增功能"
Cohesion: 0.17
Nodes (11): [1.0.0] - 2026-09-22, Changelog, 个人资料, 地图模式, 数据存储, 📚 文档, ✨ 新增功能, 朋友圈模式 (+3 more)

### Community 19 - "AcgnView.vue"
Cohesion: 0.20
Nodes (8): filteredStatuses, selectedCategory, {
  statusBarHeight, myProfile, acgnStatuses,
  viewAuthorProfile, viewCommenterProfile, previewImage, openDetailSheet,
  formatTime, toggleActionMenu, activeActionMenuStatusId, handleLikeFromMenu,
  openInPlaceComment, openPublishSheet
}, canSubmit, placeholderText, {
  statusBarHeight, currentPublishMode, publishVisible, newPostContent, pickedImages,
  isPublishing, myProfile, helpContactPhone,
  isAcgnPost, acgnTag,
  closePublishSheet, chooseImages, removePickedImage, previewImage, addPresetSamplePhoto,
  submitNewPost, submitHelpPost, openMyProfileSheet, switchMainTab
}, ACGN_TAG_CATEGORIES, AcgnTagCategory

### Community 20 - "🗺️ 500米邻里社交圈 - 完整项目知识图谱与速查指引"
Cohesion: 0.33
Nodes (5): 🗺️ 500米地图生活圈 (Map Social 500m) - 完整项目知识图谱与架构指引, 🎯 一、功能模块与代码修改快速检索表, 🔬 三、Graphify 核心指标与知识网络分析, 🏛️ 二、系统全景架构依赖拓扑图 (Mermaid Architecture), 🛠️ 四、后续图谱更新指引

### Community 21 - "MeTab.vue"
Cohesion: 0.25
Nodes (8): handleRecenterMap(), handleSimulateWalk(), jumpToMoments(), {
  statusBarHeight, myProfile, editingProfile, openMyProfileSheet,
  switchMainTab, openHelpSheet, myActiveHelp, myHelpHistory,
  recenterToUser, simulateUserMove
}, handleNavTab(), recenterToUser(), simulateUserMove(), switchMainTab()

### Community 22 - "ImagePreviewModal.vue"
Cohesion: 0.47
Nodes (5): {
  imagePreviewVisible,
  imagePreviewUrls,
  imagePreviewIndex,
  closeImagePreview,
  setImagePreviewIndex,
}, nextImage(), onSwiperChange(), prevImage(), setImagePreviewIndex()

### Community 23 - "RecommendView.vue"
Cohesion: 0.40
Nodes (4): handleAdClick(), {
  statusBarHeight,
  myProfile,
  recommendedStatuses,
  dailySponsoredAd,
  previewImage,
  toggleLikeStatus,
  openDetailSheet,
  viewAuthorProfile,
  formatTime,
  makePhoneCall,
}, makePhoneCall(), previewImage()

## Knowledge Gaps
- **273 isolated node(s):** `name`, `version`, `description`, `dev:h5`, `build:h5` (+268 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppState()` connect `useAppState` to `useAppState.ts`, `storage.ts`, `index.vue`, `getFriendsList`, `submitHelpPost`, `onMarkerTap`, `acceptFriendFromCard`, `formatTime`, `AcgnView.vue`, `MeTab.vue`, `ImagePreviewModal.vue`, `RecommendView.vue`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `readLocalData()` connect `getFriendsList` to `useAppState.ts`, `submitHelpPost`, `useAppState`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `app-plus` connect `app-plus` to `manifest.json`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 70 inferred relationships involving `useAppState()` (e.g. with `acceptFriendFromCard()` and `addPresetSamplePhoto()`) actually correct?**
  _`useAppState()` has 70 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _273 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAppState.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.02531645569620253 - nodes in this community are weakly interconnected._
- **Should `storage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._