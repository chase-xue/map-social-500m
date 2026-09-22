# 🗺️ 500米邻里社交圈 - 完整项目知识图谱与速查指引
> **生成时间**：2026-09-22  
> **核心枢纽节点**：301 个 Nodes · 501 条 Edges · 18 个功能社区 (Community)  
> **交互式可视化入口**：
> - 🌐 **力导向拓扑全景图**：[graphify-out/graph.html](file:///Users/trovant/map/graphify-out/graph.html)
> - 🌳 **D3 树状层级图谱**：[graphify-out/GRAPH_TREE.html](file:///Users/trovant/map/graphify-out/GRAPH_TREE.html)
> - 📊 **社区与中心度审计报告**：[graphify-out/GRAPH_REPORT.md](file:///Users/trovant/map/graphify-out/GRAPH_REPORT.md)

---

## 🎯 一、功能修改快速定位索引表 (修改需求直达指南)

当未来需要新增、修复或调整功能时，按以下映射直接跳转到对应文件与代码行：

| 需求场景 / 功能模块 | 核心处理文件 (点击直达) | 关键函数 / 响应式状态 | 调整关注点 |
| :--- | :--- | :--- | :--- |
| **500米范围与距离计算** | [`src/services/geo.ts`](file:///Users/trovant/map/src/services/geo.ts) | `calculateDistance`, `isWithin500Meters`, `filterStatusesWithinRange` | Haversine 地球球面坐标计算、按距离倒序过滤 |
| **同地点多动态聚合算法** | [`src/services/geo.ts`](file:///Users/trovant/map/src/services/geo.ts) | `clusterStatusesByLocation` | 35米内聚类阈值、首发人提取与聚合数量 |
| **坐标模拟与偏移打点** | [`src/services/geo.ts`](file:///Users/trovant/map/src/services/geo.ts) | `createOffsetCoordinates` | 发布状态时的经纬度随机方位角与半径位移 (15m) |
| **本地存储 / 持久化** | [`src/services/storage.ts`](file:///Users/trovant/map/src/services/storage.ts) | `readLocalData`, `writeLocalData`, `getUserProfile`, `saveUserProfile` | H5 localStorage / 小程序文件系统双模存储 |
| **好友关系与私聊存储** | [`src/services/storage.ts`](file:///Users/trovant/map/src/services/storage.ts) | `getFriendsList`, `sendFriendRequest`, `acceptFriendRequest`, `sendChatMessage` | 手机号双向互验加好友、聊天记录持久化与自动模拟回复 |
| **全局核心状态机 (God Node)** | [`src/composables/useAppState.ts`](file:///Users/trovant/map/src/composables/useAppState.ts) | `useAppState()` (63 条依赖连线) | 统领所有数据、抽屉显示隐藏、点击防穿透、地图打点 |
| **地图点/气泡点击与防穿透** | [`src/composables/useAppState.ts`](file:///Users/trovant/map/src/composables/useAppState.ts) | `onMarkerTap`, `onCalloutTap`, `lastModalOpenTime` | 拦截 450ms 移动端合成点击穿透闪退、优先匹配本人状态 |
| **地图渲染与中心定位** | [`src/components/MapView.vue`](file:///Users/trovant/map/src/components/MapView.vue) | `<map>`, `myActiveHelp`, `topEmergencyHelp`, `right-controls` | 500m半透明紫圈、救命红圈、浮动控制栏、求助广播横幅 |
| **朋友圈模式与时间倒序** | [`src/components/MomentsView.vue`](file:///Users/trovant/map/src/components/MomentsView.vue) | `sortedMomentsStatuses`, `toggleLikeStatus`, `openDetailSheet` | 倒序动态流、大图排版(单图/四宫格/九宫格)、点赞留言预览 |
| **动态详情、评论与配图** | [`src/components/DetailSheet.vue`](file:///Users/trovant/map/src/components/DetailSheet.vue) | `activeStatus`, `handleSendComment`, `chooseCommentImage` | 底部/居中弹窗卡片、多级留言列表、作者卡片查看入口 |
| **发布状态与拍照上传** | [`src/components/PublishSheet.vue`](file:///Users/trovant/map/src/components/PublishSheet.vue) | `newPostContent`, `pickedImages`, `submitNewPost` | 最多3张配图、相册拍照选取、自动挂载当前坐标打点 |
| **急事 / 救命 HELP 求助** | [`src/components/HelpSheet.vue`](file:///Users/trovant/map/src/components/HelpSheet.vue) | `isEmergencyHelp`, `submitHelpPost`, `handleCloseHelp` | 双档求助切换、紧急电话直拨、2小时自动隐去、发起人关闭 |
| **个人资料与隐私开关** | [`src/components/MyProfileSheet.vue`](file:///Users/trovant/map/src/components/MyProfileSheet.vue) | `editingProfile`, `onPhonePrivacyChange`, `myHelpHistory` | 昵称/年龄/性别/签名/手机号公开或隐藏保密、求助历史记录 |
| **他人资料卡与加好友** | [`src/components/UserCardModal.vue`](file:///Users/trovant/map/src/components/UserCardModal.vue) | `viewingProfile`, `handleAddFriend`, `startChatFromCard` | 点击任意头像查看个人卡、展示距离、电话直拨、发起私聊 |
| **好友列表与聊天抽屉** | [`src/components/FriendsSheet.vue`](file:///Users/trovant/map/src/components/FriendsSheet.vue)<br>[`src/components/ChatSheet.vue`](file:///Users/trovant/map/src/components/ChatSheet.vue) | `friendsList`, `currentChatFriend`, `sendCurrentChatMessage` | 申请通知红点、私聊气泡、即时消息滚动、模拟邻友回复 |
| **响应式视口与全端自适应** | [`src/styles/global.scss`](file:///Users/trovant/map/src/styles/global.scss) | `.modal-mask`, `.app-layout`, `@media (min-width: 768px)` | `100dvh` 防浏览器工具栏遮挡、PC居中卡片、手机底部抽屉 |

---

## 🏛️ 二、系统架构依赖拓扑图 (Architecture Topology)

```mermaid
graph TD
  subgraph 入口与页面布局 [View Layer / Layout]
    App["App.vue (100dvh 视口基座)"]
    IndexPage["pages/index/index.vue (主容器)"]
    TopNav["TopNav.vue (顶栏模式切换 & 个人头像)"]
    MapView["MapView.vue (地图模式 / 500m 圈 / 控件组)"]
    MomentsView["MomentsView.vue (朋友圈模式 / 时间倒序流)"]
  end

  subgraph 弹窗与交互卡片 [Sheets & Modals]
    DetailSheet["DetailSheet.vue (状态详情 / 留言互动)"]
    PublishSheet["PublishSheet.vue (发布状态 / 拍照打点)"]
    HelpSheet["HelpSheet.vue (急事/救命 HELP 呼救中心)"]
    MyProfileSheet["MyProfileSheet.vue (资料编辑 / 隐私 / 求助历史)"]
    UserCardModal["UserCardModal.vue (他人资料卡 / 拨号 / 好友入口)"]
    FriendsSheet["FriendsSheet.vue (好友申请与列表)"]
    ChatSheet["ChatSheet.vue (私聊对话抽屉)"]
    ClusterSheet["ClusterSheet.vue (同地点聚合状态抽屉)"]
  end

  subgraph 全局状态控制器 [State & Controller - God Node]
    UseAppState["useAppState.ts<br>★ 状态枢纽中心 (63 edges) ★<br>• lastModalOpenTime (防点透时间戳)<br>• visibleStatuses (500m可见列表)<br>• locationClusters (地点聚合)<br>• activeHelpStatuses (活跃求助)<br>• onMarkerTap / onCalloutTap"]
  end

  subgraph 底层服务与数据源 [Services & Data Layer]
    GeoService["geo.ts (地理计算)<br>• calculateDistance (Haversine)<br>• filterStatusesWithinRange<br>• clusterStatusesByLocation<br>• createOffsetCoordinates"]
    StorageService["storage.ts (本地数据与存储)<br>• readLocalData / writeLocalData<br>• addNewStatus / addCommentToStatus<br>• getUserProfile / saveUserProfile<br>• getFriendsList / sendChatMessage"]
  end

  App --> IndexPage
  IndexPage --> TopNav
  IndexPage --> MapView
  IndexPage --> MomentsView
  IndexPage --> DetailSheet
  IndexPage --> PublishSheet
  IndexPage --> HelpSheet
  IndexPage --> MyProfileSheet
  IndexPage --> UserCardModal
  IndexPage --> FriendsSheet
  IndexPage --> ChatSheet
  IndexPage --> ClusterSheet

  TopNav -.-> UseAppState
  MapView -.-> UseAppState
  MomentsView -.-> UseAppState
  DetailSheet -.-> UseAppState
  PublishSheet -.-> UseAppState
  HelpSheet -.-> UseAppState
  MyProfileSheet -.-> UseAppState
  UserCardModal -.-> UseAppState
  FriendsSheet -.-> UseAppState
  ChatSheet -.-> UseAppState
  ClusterSheet -.-> UseAppState

  UseAppState --> GeoService
  UseAppState --> StorageService
```

---

## 🔄 三、核心数据流转图 (Data Flow)

```mermaid
sequenceDiagram
  autonumber
  actor User as 用户 / 邻友
  participant View as 视图组件 (MapView / MomentsView)
  participant State as useAppState (状态管理)
  participant Geo as geo.ts (地理算法)
  participant Storage as storage.ts (本地持久化)

  User->>View: 1. 发布状态 / 发起 HELP 求助
  View->>State: submitNewPost() / submitHelpPost()
  State->>Geo: createOffsetCoordinates(userPos, 15m)
  Geo-->>State: 返回偏移经纬度 (lat, lng)
  State->>Storage: addNewStatus(newStatus)
  Storage-->>Storage: 写入 localStorage / statuses.json
  State->>Storage: readLocalData() 重新读取最新全量
  State->>Geo: filterStatusesWithinRange(userPos, 500)
  Geo-->>State: 得到周边 500m 内可见状态
  State->>Geo: clusterStatusesByLocation(35m 阈值)
  Geo-->>State: 得到地点聚合簇 locationClusters
  State-->>View: 响应式触发地图 Marker 打点 & 朋友圈重绘
  State->>State: lastModalOpenTime = Date.now() (设置防点透守护)
  State-->>View: 自动展开 DetailSheet 查看新发表动态
```

---

## 🛠️ 四、本地图谱维护与查询命令 (CLI Cheatsheet)

项目中已完整配置 `graphify` 引擎，支持在终端通过以下命令随时进行增量更新或关系查询：

### 1. 代码修改后增量更新图谱
```bash
graphify extract . --code-only
graphify cluster-only .
```

### 2. 探查最核心枢纽函数 (God Nodes)
```bash
graphify god-nodes --top 10
```

### 3. 自然语言查询架构与调用路径
```bash
# 查询两个函数之间的调用关系
graphify path "onMarkerTap" "openDetailSheet"

# 查询特定函数的技术解释
graphify explain "useAppState"

# 查询广度上下文
graphify query "如何修改求助帖的自动消失时间？"
```

### 4. 生成与查看全景 HTML 图谱
- 双击或在浏览器中打开：[`graphify-out/graph.html`](file:///Users/trovant/map/graphify-out/graph.html)
  - 支持按节点度数大小缩放、鼠标拖拽物理力导向模拟、节点检索与连线高亮。
- 树形折叠结构：[`graphify-out/GRAPH_TREE.html`](file:///Users/trovant/map/graphify-out/GRAPH_TREE.html)
