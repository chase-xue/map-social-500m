# Graph Report - /Users/trovant/map  (2026-11-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 732 nodes · 1227 edges · 41 communities (40 shown, 1 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2209d021`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useAppState.ts
- DeskHoleTab.vue
- storage.ts
- ChatSheet.vue
- types/index.ts
- scripts
- components/index.ts
- useAppState
- HandwritingPad.vue
- GrowthSettingsTab.vue
- UniverseTab.vue
- types.ts
- compilerOptions
- 500米地图生活圈 · 产品设计与交互逻辑全景规范文档 (Product & Interaction Specification)
- PublishSheet.vue
- mp-toutiao
- ✨ 新增功能
- 500米地图生活圈 · 用户交互手册与开发设计规范
- permissions
- MeTab.vue
- Contributing Guide
- app-plus
- closeUserCard
- submitHelpPost
- manifest.json
- 500米地图生活圈 (Map Social 500m)
- amap
- h5
- 🗺️ 500米地图生活圈 (Map Social 500m) - 完整项目知识图谱与架构指引
- 🔧 提交代码
- 3. 主视图交互逻辑规范
- 🚀 本地开发与对外发布流程
- WeChatTabBar.vue
- setting
- 4. 全屏二级页面与路由流转规范
- RecommendView.vue
- runAiMatchFilter
- 6. 二次元 (ACGN) 同好标注与展示规范
- formatTime

## God Nodes (most connected - your core abstractions)
1. `useAppState()` - 101 edges
2. `readLocalData()` - 20 edges
3. `compilerOptions` - 14 edges
4. `saveUserProfile()` - 14 edges
5. `getFriendsList()` - 14 edges
6. `500米地图生活圈 · 用户交互手册与开发设计规范` - 11 edges
7. `scripts` - 10 edges
8. `formatDistance()` - 10 edges
9. `saveFriendsList()` - 10 edges
10. `sendChatMessage()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `handleApply()` --calls--> `applyAndChatWithMatch()`  [EXTRACTED]
  src/components/modals/AiMatchSheet.vue → src/composables/useAppState.ts
- `useAppState()` --indirect_call--> `getFriendsList()`  [INFERRED]
  src/composables/useAppState.ts → src/services/storage.ts
- `sendFriendRequest()` --calls--> `request()`  [EXTRACTED]
  src/api/friends.ts → src/api/client.ts
- `getNearbyStatuses()` --calls--> `filterStatusesWithinRange()`  [EXTRACTED]
  src/api/status.ts → src/services/geo.ts
- `getRecommendedStatuses()` --calls--> `readLocalData()`  [EXTRACTED]
  src/api/status.ts → src/services/storage.ts

## Import Cycles
- None detected.

## Communities (41 total, 1 thin omitted)

### Community 0 - "useAppState.ts"
Cohesion: 0.02
Nodes (82): acgnStatuses, acgnTag, activeActionMenuStatusId, activeCluster, activeHelpStatuses, activeStatus, activeTab, aiMatchResults (+74 more)

### Community 1 - "DeskHoleTab.vue"
Cohesion: 0.06
Nodes (37): activeSecretNote, closeInspectModal(), currentDesk, cycleWeather(), diaryModalVisible, drawerDragY, drawerSecretModalVisible, exitVisiting() (+29 more)

### Community 2 - "storage.ts"
Cohesion: 0.09
Nodes (42): createStatus(), getAcgnStatuses(), getNearbyStatuses(), getRecommendedStatuses(), getUserAllStatuses(), postCommentApi(), toggleLikeStatusApi(), handleToggleLike() (+34 more)

### Community 3 - "ChatSheet.vue"
Cohesion: 0.06
Nodes (29): activePaperName, activeSealName, currentPaperColor, flyingMsg, flyingNoteInfo, isSealedMode, isSketchMode, onHwConfirmed() (+21 more)

### Community 4 - "types/index.ts"
Cohesion: 0.07
Nodes (32): {
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
}, filterParams, handleApply(), PRESET_PERSONALITY_TAGS, viewMode, {
  clusterVisible,
  activeCluster,
  statusBarHeight,
  closeClusterSheet,
  previewImage,
  jumpToMomentsFromCluster,
  formatTime,
  openDetailSheet,
} (+24 more)

### Community 5 - "scripts"
Cohesion: 0.05
Nodes (41): @dcloudio/types, @dcloudio/uni-app, @dcloudio/uni-app-plus, @dcloudio/uni-cli-shared, @dcloudio/uni-components, @dcloudio/uni-h5, @dcloudio/uni-mp-toutiao, @dcloudio/uni-mp-weixin (+33 more)

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

### Community 7 - "useAppState"
Cohesion: 0.07
Nodes (37): addPresetSamplePhoto(), chooseHelpImages(), chooseImages(), closeActionMenu(), closeAiMatchSheet(), closeClusterSheet(), closeFriendsSheet(), closeImagePreview() (+29 more)

### Community 8 - "HandwritingPad.vue"
Cohesion: 0.11
Nodes (27): activePen, applyPenStyle(), closePad(), confirmHandwriting(), drawStroke(), emit, getEraserBgColor(), getPos() (+19 more)

### Community 9 - "GrowthSettingsTab.vue"
Cohesion: 0.09
Nodes (16): buyCoins(), gradesList, handleSelectPaper(), handleSelectSeal(), handleSelectTheme(), mallDrawerType, myGrowth, papersData (+8 more)

### Community 10 - "UniverseTab.vue"
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

### Community 11 - "types.ts"
Cohesion: 0.13
Nodes (14): getAuthToken(), request(), RequestOptions, sendFriendRequest(), ApiResponse, CreateCommentDTO, CreateStatusDTO, PaginationParams (+6 more)

### Community 12 - "compilerOptions"
Cohesion: 0.09
Nodes (22): @dcloudio/types, DOM, ESNext, src/**/*.d.ts, src/**/*.ts, src/**/*.tsx, src/**/*.vue, compilerOptions (+14 more)

### Community 13 - "500米地图生活圈 · 产品设计与交互逻辑全景规范文档 (Product & Interaction Specification)"
Cohesion: 0.09
Nodes (21): 1.1 产品愿景, 1.2 核心价值与业务场景, 2.1 容器宽度防溢出技术原理 (Anti-Overflow Paradigm), 3.1 动态与求助模型 (StatusItem), 3.2 个人资料模型 (UserProfile), 4.1 动态发布交互规范 (Publish Workflow), 4.2 邻里急事求助与救命呼救全流程 (Help & Emergency Workflow), 4.3.1 底部固定评论栏与“自己给自己评论”交互规范： (+13 more)

### Community 14 - "PublishSheet.vue"
Cohesion: 0.13
Nodes (12): filteredStatuses, selectedCategory, {
  statusBarHeight, myProfile, acgnStatuses,
  viewAuthorProfile, viewCommenterProfile, previewImage, openDetailSheet,
  formatTime, toggleActionMenu, activeActionMenuStatusId, handleLikeFromMenu,
  openInPlaceComment, openPublishSheet
}, canSubmit, handwritingImg, isBrushingGlue, paperColorList, placeholderText (+4 more)

### Community 15 - "mp-toutiao"
Cohesion: 0.15
Nodes (14): chooseLocation, getLocation, mp-toutiao, appid, permission, requiredPrivateInfos, usingComponents, mp-weixin (+6 more)

### Community 16 - "✨ 新增功能"
Cohesion: 0.17
Nodes (11): [1.0.0] - 2026-09-22, Changelog, 个人资料, 地图模式, 数据存储, 📚 文档, ✨ 新增功能, 朋友圈模式 (+3 more)

### Community 17 - "500米地图生活圈 · 用户交互手册与开发设计规范"
Cohesion: 0.17
Nodes (12): 1.1 核心价值：超近距离 500m LBS 真实生活圈, 1.2 视觉与交互规范：微信 8.0 原生标准, 1. 产品定位与核心设计哲学, 2. 底层架构与四大主页签体系, 500米地图生活圈 · 用户交互手册与开发设计规范, 5. 救命呼救与邻里急事求助协议, 7. 多媒体与全屏大图预览规范, 8. 工程约束与高压红线 (+4 more)

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

### Community 20 - "Contributing Guide"
Cohesion: 0.22
Nodes (6): Contributing Guide, 💡 功能建议, 📝 开发环境搭建, 🐛 报告 Bug, 🏗️ 架构说明, ❓ 需要帮助？

### Community 21 - "app-plus"
Cohesion: 0.22
Nodes (9): app-plus, compilerVersion, nvueStyleCompiler, splashscreen, usingComponents, alwaysShowBeforeRender, autoclose, delay (+1 more)

### Community 22 - "closeUserCard"
Cohesion: 0.25
Nodes (8): goToFriendDesk(), goToAuthorDesk(), visitDeskFromCard(), closeChatSheet(), closeDetailSheet(), closeUserCard(), startChatFromCard(), visitDesk()

### Community 23 - "submitHelpPost"
Cohesion: 0.32
Nodes (8): handlePublish(), chooseCommentImage(), chooseNewAvatar(), closeHelpSheet(), closePublishSheet(), submitHelpPost(), submitNewPost(), saveLocalImageFile()

### Community 24 - "manifest.json"
Cohesion: 0.25
Nodes (7): appid, description, name, quickapp, transformPx, versionCode, versionName

### Community 25 - "500米地图生活圈 (Map Social 500m)"
Cohesion: 0.29
Nodes (7): 500米地图生活圈 (Map Social 500m), 🌿 Git 分支管理与对外发布规范 (Branch & Release Protocol), 🌸 二次元 (ACGN) 概念与同好标注体系, 🚨 救命呼救与邻里急事求助机制, 📱 核心架构与四大底层页签, 🎨 页面交互设计准则 (WeChat Native Standard), 🏗️ 领域模块化目录结构 (Domain-Driven Architecture)

### Community 26 - "amap"
Cohesion: 0.29
Nodes (7): appkey_android, appkey_ios, key, securityJsCode, modules, amap, Maps

### Community 27 - "h5"
Cohesion: 0.29
Nodes (7): h5, router, sdkConfigs, title, base, mode, maps

### Community 28 - "🗺️ 500米地图生活圈 (Map Social 500m) - 完整项目知识图谱与架构指引"
Cohesion: 0.33
Nodes (5): 🗺️ 500米地图生活圈 (Map Social 500m) - 完整项目知识图谱与架构指引, 🎯 一、功能模块与代码修改快速检索表, 🔬 三、Graphify 核心指标与知识网络分析, 🏛️ 二、系统全景架构依赖拓扑图 (Mermaid Architecture), 🛠️ 四、后续图谱更新指引

### Community 29 - "🔧 提交代码"
Cohesion: 0.40
Nodes (5): Commit 规范, PR 检查清单, 代码风格, 开发流程, 🔧 提交代码

### Community 30 - "3. 主视图交互逻辑规范"
Cohesion: 0.40
Nodes (5): 3.1 【首页】页签 (Home / Map Tab), 3.2 【通讯录】页签 (Contacts Tab), 3.3 【消息】页签 (Chats Tab), 3.4 【更多】页签 (Me / More Tab), 3. 主视图交互逻辑规范

### Community 31 - "🚀 本地开发与对外发布流程"
Cohesion: 0.40
Nodes (5): 1. 本地启动开发, 2. 编译生产构建, 3. 一键对外发布上线 (部署至 gh-pages), 4. 线上对外访问地址, 🚀 本地开发与对外发布流程

### Community 32 - "WeChatTabBar.vue"
Cohesion: 0.40
Nodes (4): {
  mainTab,
  switchMainTab,
  unreadChatsCount,
  visibleStatuses,
  openPublishSheet
}, triggerBrushPublish(), openHelpSheet(), openPublishSheet()

### Community 33 - "setting"
Cohesion: 0.50
Nodes (5): setting, setting, es6, minified, urlCheck

### Community 34 - "4. 全屏二级页面与路由流转规范"
Cohesion: 0.50
Nodes (4): 4.1 动态与求助详情页 (`DetailSheet.vue`), 4.2 他人详细资料页 (`UserCardModal.vue`), 4.3 个人信息设置页 (`MyProfileSheet.vue`), 4. 全屏二级页面与路由流转规范

### Community 35 - "RecommendView.vue"
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

### Community 36 - "runAiMatchFilter"
Cohesion: 0.50
Nodes (4): handleStartMatch(), openAiMatchSheet(), runAiMatchFilter(), executeAiMatch()

### Community 37 - "6. 二次元 (ACGN) 同好标注与展示规范"
Cohesion: 0.67
Nodes (3): 6.1 概念定位, 6.2 交互逻辑与视觉呈现, 6. 二次元 (ACGN) 同好标注与展示规范

## Knowledge Gaps
- **338 isolated node(s):** `name`, `appid`, `description`, `versionName`, `versionCode` (+333 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppState()` connect `useAppState` to `WeChatTabBar.vue`, `DeskHoleTab.vue`, `useAppState.ts`, `RecommendView.vue`, `types/index.ts`, `ChatSheet.vue`, `components/index.ts`, `storage.ts`, `formatTime`, `GrowthSettingsTab.vue`, `UniverseTab.vue`, `runAiMatchFilter`, `PublishSheet.vue`, `MeTab.vue`, `closeUserCard`, `submitHelpPost`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `saveUserProfile()` connect `GrowthSettingsTab.vue` to `useAppState.ts`, `storage.ts`, `ChatSheet.vue`, `useAppState`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `readLocalData()` connect `storage.ts` to `useAppState.ts`, `submitHelpPost`, `useAppState`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Are the 73 inferred relationships involving `useAppState()` (e.g. with `acceptFriendFromCard()` and `addPresetSamplePhoto()`) actually correct?**
  _`useAppState()` has 73 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `appid`, `description` to the rest of the system?**
  _338 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAppState.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.024096385542168676 - nodes in this community are weakly interconnected._
- **Should `DeskHoleTab.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.06196078431372549 - nodes in this community are weakly interconnected._