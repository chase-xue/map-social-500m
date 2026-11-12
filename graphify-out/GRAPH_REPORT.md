# Graph Report - /Users/trovant/map  (2026-11-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 736 nodes · 1122 edges · 38 communities
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `07aa5008`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAppState.ts
- storage.ts
- geo.ts
- DeskHoleTab.vue
- scripts
- useAppState
- components/index.ts
- HandwritingPad.vue
- PublishSheet.vue
- GrowthSettingsTab.vue
- ChatSheet.vue
- 500米地图生活圈 (Map Social 500m)
- 500米地图生活圈 · 用户交互手册与开发设计规范
- compilerOptions
- 500米地图生活圈 · 产品设计与交互逻辑全景规范文档 (Product & Interaction Specification)
- UniverseTab.vue
- mp-toutiao
- ✨ 新增功能
- permissions
- MeTab.vue
- UserCardModal.vue
- app-plus
- acceptFriendFromCard
- manifest.json
- amap
- h5
- 🗺️ 500米地图生活圈 (Map Social 500m) - 完整项目知识图谱与架构指引
- WeChatTabBar.vue
- handlePublish
- setting
- RecommendView.vue
- runAiMatchFilter
- handleReplyBottle
- handleThrowBottle
- initApp
- openUserProfileCard

## God Nodes (most connected - your core abstractions)
1. `useAppState()` - 101 edges
2. `compilerOptions` - 14 edges
3. `saveUserProfile()` - 12 edges
4. `readLocalData()` - 12 edges
5. `500米地图生活圈 · 用户交互手册与开发设计规范` - 11 edges
6. `scripts` - 10 edges
7. `formatDistance()` - 9 edges
8. `500米地图生活圈 (Map Social 500m)` - 8 edges
9. `500米地图生活圈 · 产品设计与交互逻辑全景规范文档 (Product & Interaction Specification)` - 8 edges
10. `sendSlowPaperNote()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `sendFriendRequest()` --calls--> `request()`  [EXTRACTED]
  src/api/friends.ts → src/api/client.ts
- `getNearbyStatuses()` --calls--> `filterStatusesWithinRange()`  [EXTRACTED]
  src/api/status.ts → src/services/geo.ts
- `getRecommendedStatuses()` --calls--> `readLocalData()`  [EXTRACTED]
  src/api/status.ts → src/services/storage.ts
- `getAcgnStatuses()` --calls--> `readLocalData()`  [EXTRACTED]
  src/api/status.ts → src/services/storage.ts
- `getUserAllStatuses()` --calls--> `readLocalData()`  [EXTRACTED]
  src/api/status.ts → src/services/storage.ts

## Import Cycles
- None detected.

## Communities (38 total, 0 thin omitted)

### Community 0 - "useAppState.ts"
Cohesion: 0.02
Nodes (82): acgnStatuses, acgnTag, activeActionMenuStatusId, activeCluster, activeHelpStatuses, activeStatus, activeTab, aiMatchResults (+74 more)

### Community 1 - "storage.ts"
Cohesion: 0.06
Nodes (53): getAuthToken(), request(), RequestOptions, sendFriendRequest(), createStatus(), getAcgnStatuses(), getNearbyStatuses(), getRecommendedStatuses() (+45 more)

### Community 2 - "geo.ts"
Cohesion: 0.06
Nodes (30): {
  statusBarHeight, myProfile, sortedMomentsStatuses, activeHelpStatuses,
  openMyProfileSheet, openPublishSheet, viewAuthorProfile, viewCommenterProfile,
  previewImage, toggleLikeStatus, openDetailSheet, formatTime, isHelpResolvedPromptVisible,
  activeActionMenuStatusId, toggleActionMenu, closeActionMenu, handleLikeFromMenu,
  inPlaceCommentVisible, inPlaceCommentTarget, inPlaceReplyToUser, inPlaceCommentText,
  openInPlaceComment, closeInPlaceComment, handleSendInPlaceComment,
}, topEmergencyHelp, {
  aiMatchSheetVisible,
  aiMatchResults,
  isAiMatching,
  closeAiMatchSheet,
  runAiMatchFilter,
  applyAndChatWithMatch,
}, filterParams, PRESET_PERSONALITY_TAGS, viewMode, {
  clusterVisible,
  activeCluster,
  statusBarHeight,
  closeClusterSheet,
  previewImage,
  jumpToMomentsFromCluster,
  formatTime,
  openDetailSheet,
}, canSendComment (+22 more)

### Community 3 - "DeskHoleTab.vue"
Cohesion: 0.05
Nodes (24): activeSecretNote, closeInspectModal(), currentDesk, diaryModalVisible, drawerDragY, drawerSecretModalVisible, handleViewNoteAuthorProfile(), handleViewOwnerProfile() (+16 more)

### Community 4 - "scripts"
Cohesion: 0.05
Nodes (41): @dcloudio/types, @dcloudio/uni-app, @dcloudio/uni-app-plus, @dcloudio/uni-cli-shared, @dcloudio/uni-components, @dcloudio/uni-h5, @dcloudio/uni-mp-toutiao, @dcloudio/uni-mp-weixin (+33 more)

### Community 5 - "useAppState"
Cohesion: 0.06
Nodes (42): handleToggleLike(), addPresetSamplePhoto(), chooseCommentImage(), chooseHelpImages(), chooseImages(), chooseNewAvatar(), closeActionMenu(), closeClusterSheet() (+34 more)

### Community 6 - "components/index.ts"
Cohesion: 0.06
Nodes (24): {
  imagePreviewVisible,
  imagePreviewUrls,
  imagePreviewIndex,
  closeImagePreview,
  setImagePreviewIndex,
}, nextImage(), onSwiperChange(), prevImage(), {
  statusBarHeight,
  mapSubTab,
  searchRadius,
  mapSearchKeyword,
  toggleSearchRadius,
  recenterToUser
}, landmarkSearchText, latestNote, {
  mapCenter, mapScale, mapMarkers, mapCircles,
  onMarkerTap, onCalloutTap, onRegionChange,
  recenterToUser, refreshNearbyStatuses, simulateUserMove,
  visibleStatuses, openPublishSheet, openDetailSheet, locationClusters,
  activeHelpStatuses, hasActiveEmergency, openHelpSheet, myActiveHelp,
  openAiMatchSheet,
  searchRadius,
  toggleSearchRadius
} (+16 more)

### Community 7 - "HandwritingPad.vue"
Cohesion: 0.11
Nodes (27): activePen, applyPenStyle(), closePad(), confirmHandwriting(), drawStroke(), emit, getEraserBgColor(), getPos() (+19 more)

### Community 8 - "PublishSheet.vue"
Cohesion: 0.09
Nodes (22): filteredStatuses, selectedCategory, {
  statusBarHeight, myProfile, acgnStatuses,
  viewAuthorProfile, viewCommenterProfile, previewImage, openDetailSheet,
  formatTime, toggleActionMenu, activeActionMenuStatusId, handleLikeFromMenu,
  openInPlaceComment, openPublishSheet
}, canSubmit, handwritingImg, isBrushingGlue, paperColorList, placeholderText (+14 more)

### Community 9 - "GrowthSettingsTab.vue"
Cohesion: 0.09
Nodes (16): buyCoins(), gradesList, handleSelectPaper(), handleSelectSeal(), handleSelectTheme(), mallDrawerType, myGrowth, papersData (+8 more)

### Community 10 - "ChatSheet.vue"
Cohesion: 0.08
Nodes (18): activePaperName, activeSealName, currentPaperColor, flyingMsg, flyingNoteInfo, isSealedMode, isSketchMode, onHwConfirmed() (+10 more)

### Community 11 - "500米地图生活圈 (Map Social 500m)"
Cohesion: 0.08
Nodes (23): Commit 规范, Contributing Guide, PR 检查清单, 代码风格, 💡 功能建议, 开发流程, 📝 开发环境搭建, 🐛 报告 Bug (+15 more)

### Community 12 - "500米地图生活圈 · 用户交互手册与开发设计规范"
Cohesion: 0.08
Nodes (24): 1.1 核心价值：超近距离 500m LBS 真实生活圈, 1.2 视觉与交互规范：微信 8.0 原生标准, 1. 产品定位与核心设计哲学, 2. 底层架构与四大主页签体系, 3.1 【首页】页签 (Home / Map Tab), 3.2 【通讯录】页签 (Contacts Tab), 3.3 【消息】页签 (Chats Tab), 3.4 【更多】页签 (Me / More Tab) (+16 more)

### Community 13 - "compilerOptions"
Cohesion: 0.09
Nodes (22): @dcloudio/types, DOM, ESNext, src/**/*.d.ts, src/**/*.ts, src/**/*.tsx, src/**/*.vue, compilerOptions (+14 more)

### Community 14 - "500米地图生活圈 · 产品设计与交互逻辑全景规范文档 (Product & Interaction Specification)"
Cohesion: 0.09
Nodes (21): 1.1 产品愿景, 1.2 核心价值与业务场景, 2.1 容器宽度防溢出技术原理 (Anti-Overflow Paradigm), 3.1 动态与求助模型 (StatusItem), 3.2 个人资料模型 (UserProfile), 4.1 动态发布交互规范 (Publish Workflow), 4.2 邻里急事求助与救命呼救全流程 (Help & Emergency Workflow), 4.3.1 底部固定评论栏与“自己给自己评论”交互规范： (+13 more)

### Community 15 - "UniverseTab.vue"
Cohesion: 0.13
Nodes (14): BOTTLE_TAGS, inputContent, isReplying, replyText, selectedTag, {
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
}, fishBottleFromOcean(), getStoredBottles() (+6 more)

### Community 16 - "mp-toutiao"
Cohesion: 0.15
Nodes (14): chooseLocation, getLocation, mp-toutiao, appid, permission, requiredPrivateInfos, usingComponents, mp-weixin (+6 more)

### Community 17 - "✨ 新增功能"
Cohesion: 0.17
Nodes (11): [1.0.0] - 2026-09-22, Changelog, 个人资料, 地图模式, 数据存储, 📚 文档, ✨ 新增功能, 朋友圈模式 (+3 more)

### Community 18 - "permissions"
Cohesion: 0.17
Nodes (12): <uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\"/>, <uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\"/>, <uses-permission android:name=\"android.permission.CAMERA\"/>, <uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>, permissions, distribute, android, ios (+4 more)

### Community 19 - "MeTab.vue"
Cohesion: 0.22
Nodes (9): handleRecenterMap(), handleSimulateWalk(), jumpToMoments(), {
  statusBarHeight, myProfile, editingProfile, openMyProfileSheet,
  switchMainTab, openHelpSheet, myActiveHelp, myHelpHistory,
  recenterToUser, simulateUserMove
}, openGrowthMall(), handleNavTab(), recenterToUser(), simulateUserMove() (+1 more)

### Community 20 - "UserCardModal.vue"
Cohesion: 0.22
Nodes (8): goToFriendDesk(), goToAuthorDesk(), {
  statusBarHeight, userCardVisible, viewingProfile, viewingDistance, myProfile, allStatuses,
  closeUserCard, makePhoneCall, isFriend, isFriendPending,
  startChatFromCard, acceptFriendFromCard, handleAddFriend, openMyProfileSheet,
  openDetailSheet, previewImage, formatTime,
  switchMainTab, visitDesk,
}, userAllStatuses, visitDeskFromCard(), closeChatSheet(), closeDetailSheet(), visitDesk()

### Community 21 - "app-plus"
Cohesion: 0.22
Nodes (9): app-plus, compilerVersion, nvueStyleCompiler, splashscreen, usingComponents, alwaysShowBeforeRender, autoclose, delay (+1 more)

### Community 22 - "acceptFriendFromCard"
Cohesion: 0.29
Nodes (8): handleApply(), acceptFriendFromCard(), applyAndChatWithMatch(), closeAiMatchSheet(), closeUserCard(), handleAcceptFriend(), openChatSheet(), startChatFromCard()

### Community 23 - "manifest.json"
Cohesion: 0.25
Nodes (7): appid, description, name, quickapp, transformPx, versionCode, versionName

### Community 24 - "amap"
Cohesion: 0.29
Nodes (7): appkey_android, appkey_ios, key, securityJsCode, modules, amap, Maps

### Community 25 - "h5"
Cohesion: 0.29
Nodes (7): h5, router, sdkConfigs, title, base, mode, maps

### Community 26 - "🗺️ 500米地图生活圈 (Map Social 500m) - 完整项目知识图谱与架构指引"
Cohesion: 0.33
Nodes (5): 🗺️ 500米地图生活圈 (Map Social 500m) - 完整项目知识图谱与架构指引, 🎯 一、功能模块与代码修改快速检索表, 🔬 三、Graphify 核心指标与知识网络分析, 🏛️ 二、系统全景架构依赖拓扑图 (Mermaid Architecture), 🛠️ 四、后续图谱更新指引

### Community 27 - "WeChatTabBar.vue"
Cohesion: 0.40
Nodes (4): {
  mainTab,
  switchMainTab,
  unreadChatsCount,
  visibleStatuses,
  openPublishSheet
}, triggerBrushPublish(), openHelpSheet(), openPublishSheet()

### Community 28 - "handlePublish"
Cohesion: 0.50
Nodes (5): handlePublish(), closeHelpSheet(), closePublishSheet(), submitHelpPost(), submitNewPost()

### Community 29 - "setting"
Cohesion: 0.50
Nodes (5): setting, setting, es6, minified, urlCheck

### Community 30 - "RecommendView.vue"
Cohesion: 0.50
Nodes (3): handleAdClick(), {
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
}, makePhoneCall()

### Community 32 - "runAiMatchFilter"
Cohesion: 0.67
Nodes (3): handleStartMatch(), openAiMatchSheet(), runAiMatchFilter()

### Community 33 - "handleReplyBottle"
Cohesion: 0.67
Nodes (3): confirmReply(), closeReadBottleModal(), handleReplyBottle()

### Community 34 - "handleThrowBottle"
Cohesion: 0.67
Nodes (3): confirmThrow(), closeThrowBottleModal(), handleThrowBottle()

### Community 35 - "initApp"
Cohesion: 0.67
Nodes (3): getSystemInfo(), initApp(), initGeolocation()

### Community 36 - "openUserProfileCard"
Cohesion: 0.67
Nodes (3): openUserProfileCard(), viewAuthorProfile(), viewCommenterProfile()

## Knowledge Gaps
- **342 isolated node(s):** `name`, `appid`, `description`, `versionName`, `versionCode` (+337 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppState()` connect `useAppState` to `useAppState.ts`, `geo.ts`, `DeskHoleTab.vue`, `components/index.ts`, `PublishSheet.vue`, `GrowthSettingsTab.vue`, `ChatSheet.vue`, `UniverseTab.vue`, `MeTab.vue`, `UserCardModal.vue`, `acceptFriendFromCard`, `WeChatTabBar.vue`, `handlePublish`, `RecommendView.vue`, `runAiMatchFilter`, `handleReplyBottle`, `handleThrowBottle`, `initApp`, `openUserProfileCard`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `saveUserProfile()` connect `GrowthSettingsTab.vue` to `storage.ts`, `ChatSheet.vue`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Are the 73 inferred relationships involving `useAppState()` (e.g. with `acceptFriendFromCard()` and `addPresetSamplePhoto()`) actually correct?**
  _`useAppState()` has 73 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `appid`, `description` to the rest of the system?**
  _342 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAppState.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.024096385542168676 - nodes in this community are weakly interconnected._
- **Should `storage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06330988522769344 - nodes in this community are weakly interconnected._
- **Should `geo.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05757575757575758 - nodes in this community are weakly interconnected._