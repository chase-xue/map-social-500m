# Graph Report - .  (2026-09-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 301 nodes · 501 edges · 18 communities (17 shown, 1 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a9e4c94d`
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

## God Nodes (most connected - your core abstractions)
1. `useAppState()` - 63 edges
2. `readLocalData()` - 14 edges
3. `compilerOptions` - 14 edges
4. `getFriendsList()` - 11 edges
5. `scripts` - 9 edges
6. `sendChatMessage()` - 9 edges
7. `submitNewPost()` - 8 edges
8. `submitHelpPost()` - 8 edges
9. `writeRawFile()` - 8 edges
10. `writeLocalData()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `openChatSheet()` --calls--> `getChatMessages()`  [EXTRACTED]
  src/composables/useAppState.ts → src/services/storage.ts
- `submitNewPost()` --calls--> `createOffsetCoordinates()`  [EXTRACTED]
  src/composables/useAppState.ts → src/services/geo.ts
- `submitNewPost()` --calls--> `addNewStatus()`  [EXTRACTED]
  src/composables/useAppState.ts → src/services/storage.ts
- `submitNewPost()` --calls--> `readLocalData()`  [EXTRACTED]
  src/composables/useAppState.ts → src/services/storage.ts
- `submitHelpPost()` --calls--> `createOffsetCoordinates()`  [EXTRACTED]
  src/composables/useAppState.ts → src/services/geo.ts

## Import Cycles
- None detected.

## Communities (18 total, 1 thin omitted)

### Community 0 - "useAppState.ts"
Cohesion: 0.04
Nodes (46): activeCluster, activeHelpStatuses, activeStatus, activeTab, allStatuses, chatScrollTop, chatSheetVisible, clusterVisible (+38 more)

### Community 1 - "storage.ts"
Cohesion: 0.12
Nodes (28): handleCloseHelp(), handleSendComment(), initGeolocation(), refreshNearbyStatuses(), toggleLikeStatus(), calculateDistance(), clusterStatusesByLocation(), createOffsetCoordinates() (+20 more)

### Community 2 - "scripts"
Cohesion: 0.07
Nodes (27): @dcloudio/uni-app, @dcloudio/uni-app-plus, @dcloudio/uni-components, @dcloudio/uni-h5, @dcloudio/uni-mp-toutiao, @dcloudio/uni-mp-weixin, dependencies, @dcloudio/uni-app (+19 more)

### Community 3 - "manifest.json"
Cohesion: 0.09
Nodes (26): chooseLocation, getLocation, appid, description, mp-toutiao, appid, permission, requiredPrivateInfos (+18 more)

### Community 4 - "index.vue"
Cohesion: 0.07
Nodes (15): {
  chatSheetVisible, currentChatFriend, currentChatMessages, newChatMessageText,
  chatScrollTop, myProfile,
  closeChatSheet, sendCurrentChatMessage, formatTime, openUserProfileCard,
}, {
  clusterVisible, activeCluster,
  closeClusterSheet, previewImage, jumpToMomentsFromCluster,
  formatTime, openDetailSheet,
}, {
  detailVisible, activeStatus, myProfile,
  pickedCommentImage,
  closeDetailSheet, viewAuthorProfile, viewCommenterProfile, previewImage,
  formatTime, removeCommentImage,
  chooseCommentImage, handleSendComment, handleCloseHelp, makePhoneCall, isHelpResolvedPromptVisible,
}, {
  friendsSheetVisible, friendsList,
  closeFriendsSheet, formatTime, handleAcceptFriend, openChatSheet,
}, {
  helpSheetVisible, isEmergencyHelp, newHelpContent, helpContactPhone, pickedHelpImages, isHelpSubmitting,
  closeHelpSheet, chooseHelpImages, removePickedHelpImage, submitHelpPost, previewImage,
  myActiveHelp, openDetailSheet,
}, {
  mapCenter, mapScale, mapMarkers, mapCircles,
  onMarkerTap, onCalloutTap, onRegionChange,
  recenterToUser, refreshNearbyStatuses, simulateUserMove,
  visibleStatuses, openPublishSheet, openDetailSheet, locationClusters,
  activeHelpStatuses, hasActiveEmergency, openHelpSheet, myActiveHelp,
}, topEmergencyHelp, {
  statusBarHeight, myProfile, sortedMomentsStatuses, activeHelpStatuses,
  openMyProfileSheet, openPublishSheet, viewAuthorProfile, viewCommenterProfile,
  previewImage, toggleLikeStatus, openDetailSheet, formatTime, isHelpResolvedPromptVisible,
} (+7 more)

### Community 5 - "compilerOptions"
Cohesion: 0.09
Nodes (22): @dcloudio/types, DOM, ESNext, src/**/*.d.ts, src/**/*.ts, src/**/*.tsx, src/**/*.vue, compilerOptions (+14 more)

### Community 6 - "app-plus"
Cohesion: 0.09
Nodes (23): <uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\"/>, <uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\"/>, <uses-permission android:name=\"android.permission.CAMERA\"/>, <uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"/>, permissions, app-plus, compilerVersion, distribute (+15 more)

### Community 7 - "useAppState"
Cohesion: 0.10
Nodes (22): chooseHelpImages(), chooseImages(), closeChatSheet(), closeClusterSheet(), closeDetailSheet(), closeFriendsSheet(), isFriend(), isFriendPending() (+14 more)

### Community 8 - "getFriendsList"
Cohesion: 0.17
Nodes (16): getSystemInfo(), handleAcceptFriend(), handleAddFriend(), initApp(), openFriendsSheet(), sendCurrentChatMessage(), acceptFriendRequest(), FileSystemManagerLike (+8 more)

### Community 9 - "devDependencies"
Cohesion: 0.15
Nodes (13): @dcloudio/types, @dcloudio/uni-cli-shared, @dcloudio/vite-plugin-uni, devDependencies, @dcloudio/types, @dcloudio/uni-cli-shared, @dcloudio/vite-plugin-uni, sass (+5 more)

### Community 10 - "amap"
Cohesion: 0.17
Nodes (12): appkey_android, appkey_ios, key, securityJsCode, h5, router, sdkConfigs, title (+4 more)

### Community 11 - "submitHelpPost"
Cohesion: 0.29
Nodes (8): chooseCommentImage(), chooseNewAvatar(), closeHelpSheet(), closePublishSheet(), openDetailSheet(), submitHelpPost(), submitNewPost(), saveLocalImageFile()

### Community 12 - "onMarkerTap"
Cohesion: 0.33
Nodes (6): onCalloutTap(), onMarkerTap(), openClusterSheet(), openUserProfileCard(), viewAuthorProfile(), viewCommenterProfile()

### Community 13 - "acceptFriendFromCard"
Cohesion: 0.67
Nodes (4): acceptFriendFromCard(), closeUserCard(), openChatSheet(), startChatFromCard()

### Community 15 - "saveMyProfile"
Cohesion: 0.67
Nodes (3): closeMyProfileSheet(), saveMyProfile(), saveUserProfile()

## Knowledge Gaps
- **139 isolated node(s):** `name`, `version`, `description`, `dev:h5`, `build:h5` (+134 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAppState()` connect `useAppState` to `useAppState.ts`, `storage.ts`, `index.vue`, `getFriendsList`, `submitHelpPost`, `onMarkerTap`, `acceptFriendFromCard`, `saveMyProfile`, `formatTime`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `app-plus` connect `app-plus` to `manifest.json`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Are the 50 inferred relationships involving `useAppState()` (e.g. with `acceptFriendFromCard()` and `chooseCommentImage()`) actually correct?**
  _`useAppState()` has 50 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _139 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAppState.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `storage.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12298387096774194 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._