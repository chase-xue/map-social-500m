# 500米地图生活圈

基于 uni-app 的超近距离 LBS 地图社交系统，支持微信小程序、抖音小程序、手机 App（Android/iOS）和 H5 网页。

## ✨ 核心功能

### 🗺️ 地图模式
- **全屏地图渲染**：原生高性能地图组件
- **精准定位**：GPS 自动定位 + 呼吸光标
- **500m 可视围栏**：Haversine 球面距离算法，严格过滤 500m 范围外状态
- **地图打点**：状态以 Marker 气泡形式展示在对应坐标
- **同地点聚合**：35m 内多条状态聚合为一个标记，展示首发人照片和总条数

### 📰 朋友圈模式
- **时间倒序**：按发布时间倒序展示所有 500m 内动态
- **点赞互动**：朋友圈式 ❤️ 点赞列表
- **评论系统**：支持文字 + 图片评论，图片可点击放大查看

### 👤 个人资料
- **我的模块**：编辑头像、昵称、性别、年龄、个性签名
- **手机号绑定**：可选择公开展示或隐藏保密
- **资料卡查看**：点击他人头像查看基本信息（性别、年龄、签名、手机号）

### 💬 社交功能
- **好友系统**：双方绑定手机号后可申请加好友
- **私聊消息**：好友间 1v1 文字聊天
- **一键拨打**：对方公开手机号时可直接拨打

### 💾 数据存储
- **本地持久化**：JSON 文件 + Storage 双保险，无需远程服务器
- **跨平台兼容**：微信小程序、抖音小程序、App、H5 统一存储方案

## 📦 技术栈

- **框架**：uni-app (Vue 3 + Vite + TypeScript)
- **地图**：原生 map 组件
- **样式**：SCSS
- **架构**：Composable 单例状态管理 + 组件化拆分

## 🏗️ 项目结构

```
src/
├── components/          # 功能组件
│   ├── TopNav.vue       # 顶部导航（地图/朋友圈切换）
│   ├── MapView.vue      # 地图视图（500m 圈、Marker、控制按钮）
│   ├── MomentsView.vue  # 朋友圈信息流
│   ├── DetailSheet.vue  # 状态详情 + 评论抽屉
│   ├── PublishSheet.vue # 发布状态抽屉
│   ├── MyProfileSheet.vue # 我的资料编辑
│   ├── UserCardModal.vue  # 他人资料卡弹窗
│   ├── FriendsSheet.vue   # 好友列表
│   ├── ChatSheet.vue      # 私聊窗口
│   └── ClusterSheet.vue   # 同地点聚合抽屉
├── composables/
│   └── useAppState.ts   # 全局状态管理（单例）
├── services/
│   ├── geo.ts           # Haversine 距离算法 + 500m 过滤
│   └── storage.ts       # 本地文件存储 + 数据读写
├── types/
│   └── index.ts         # TypeScript 类型定义
├── styles/
│   └── global.scss      # 全局样式（z-index 分层）
├── static/
│   └── icons/           # 地图图标资源
└── pages/
    └── index/
        └── index.vue    # 页面入口（组合根）
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 运行平台

#### H5 网页（本地开发）
```bash
npm run dev:h5
```
访问 `http://localhost:5173`

#### 微信小程序
```bash
npm run dev:mp-weixin
```
用微信开发者工具导入 `dist/dev/mp-weixin` 目录

#### 抖音小程序
```bash
npm run dev:mp-toutiao
```
用抖音开发者工具导入 `dist/dev/mp-toutiao` 目录

#### 手机 App
```bash
# 构建 App 资源
npm run build:app

# 使用 HBuilderX 云打包生成 APK/IPA
```

## 📱 跨端打包指南

### 微信小程序
1. `npm run build:mp-weixin`
2. 微信开发者工具 → 导入项目 → 选择 `dist/build/mp-weixin`
3. 填入 AppID → 上传 → 提交审核

### 抖音小程序
1. `npm run build:mp-toutiao`
2. 抖音开发者工具 → 导入项目 → 选择 `dist/build/mp-toutiao`
3. 填入 AppID → 上传 → 提交审核

### Android/iOS App
1. `npm run build:app`
2. 下载 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
3. 文件 → 打开目录 → 选择项目根目录
4. 发行 → 原生 App-云打包
5. 勾选 Android (APK) 或 iOS (IPA) → 打包

## 🎨 Z-Index 分层规范

```
L10  - 内容层（地图/朋友圈）
L40  - 悬浮控制按钮
L50  - 顶部导航
L100 - 弹窗遮罩
L110 - 底部抽屉（详情/发布/资料/好友/聚合）
L150 - 聊天窗口
L200 - 用户资料卡（最顶层）
```

## 🔧 核心算法

### 500m 距离过滤（Haversine 公式）

```typescript
d = 2R × arcsin(√[sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)])
```

其中 R = 6378137m（地球赤道半径）

### 同地点聚合

- 阈值：35m 内视为同地点
- 展示：首发人照片 + 总条数
- 交互：点击后在聚合抽屉查看所有状态，或跳转朋友圈模式

## 📝 开发规范

- **组件化**：每个功能模块独立组件，单一职责
- **状态管理**：Composable 单例模式，全局共享状态
- **类型安全**：TypeScript 严格类型定义
- **样式隔离**：全局样式统一管理，z-index 分层防止遮挡

## 📄 License

MIT

---

**开发团队**：Kylin Insights  
**联系方式**：[your-email@example.com]
