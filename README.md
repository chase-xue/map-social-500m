# 500米地图生活圈 (Map Social 500m)

基于 **uni-app (Vue 3 + Vite + TypeScript)** 打造的高保真、超近距离 LBS 真实邻里生活圈社交系统。采用严格的 **微信 8.0 原生规范** 与 **Zenly 风格沉浸式地图**，支持微信小程序、手机 App（iOS/Android）及 H5 网页。

> 📖 **完整交互手册与开发设计规范**：详见 [docs/INTERACTION_MANUAL.md](docs/INTERACTION_MANUAL.md)。后续所有产品交互设计、前后端开发与页面迭代均须严格遵循此手册。

---

## 📱 核心架构与四大底层页签

应用底部导航栏固定采用微信标准原生高度，四大主页签顺序严格定义如下：

```
[📍 地图]  ───────  [👥 通讯录]  ───────  [💬 聊天]  ───────  [👤 我]
 (第1位)             (第2位)             (第3位)            (第4位)
```

| 序号 | 核心页签 | 图标规范 | 核心功能与交互 |
| :---: | :--- | :--- | :--- |
| **1** | **地图** | 未选：1.8px 优雅线性定位针<br>激活：`#07c160` 填充定位图钉 | Zenly 地图雷达、500m 地理围栏圈、35m 同地点动态聚合气泡、顶栏胶囊无缝切换朋友圈时间流 |
| **2** | **通讯录** | 未选：1.8px 经典线性双人像<br>激活：分层遮罩微信绿双人像 | 微信标准搜索栏、新的朋友（待处理申请红点）、500m 邻友雷达、邻友字母排序与直达私聊 |
| **3** | **聊天** | 未选：1.8px 线性双气泡<br>激活：绿色填充双气泡（带未读徽标） | 邻里 1v1 私聊会话流、最新消息预览与未读管理、点击直接推入全屏私聊窗口 |
| **4** | **我** | 未选：1.8px 线性单人人像<br>激活：绿色填充单人人像 | 极简纯净顶栏（严禁齿轮/多余按键）、个人名片 Hero 卡片、求助历史记录、手机号隐私加密保护 |

---

## 🎨 页面交互设计准则 (WeChat Native Standard)

1. **全屏二级流转（严禁桌面式浮动弹窗）**：
   - 彻底废除居中浮动小窗与黑色遮罩弹窗；
   - 状态详情（`DetailSheet`）、个人资料（`MyProfileSheet`）、详细资料卡（`UserCardModal`）、发状态（`PublishSheet`）、私聊窗口（`ChatSheet`）等次级页面**一律采用全屏铺满容器（`position: absolute; inset: 0; z-index: 100;`）**，配备微信原生 `‹ 返回` 顶栏；
2. **高德地图纯净视界**：
   - 三层底层 CSS 规则与动态拦截，100% 抹除高德地图 Logo、审图号与版权水印，打造沉浸式极简地图；
3. **点赞与评论流原生化**：
   - 朋友圈原汁原味 `#f7f7f7` 灰底点赞名单；
   - 底部固定评论栏：当前身份头像展示、白底圆角输入框、📷 相册选图与微信绿发送按钮；
4. **全屏大图预览灯箱**：
   - 采用纯黑底、`<swiper>` 横向滑动的沉浸式灯箱，替代易引发虚拟路由错误的 `uni.previewImage`。

---

## 🚨 救命呼救与邻里急事求助机制

- **双档位分级**：
  - **普通急事 (🆘 HELP)**：借工具、问路、寻物、寻宠等，在生活圈内广播；
  - **救命呼救 (🚨 EMERGENCY)**：特大人身安全紧急呼救，地图打上特大红色脉冲警报标记，并在全站顶部闪烁广播；
- **发起人闭环与归档**：
  - 仅发起人可见 `✅ 问题已解决，关闭求助` 按钮；
  - 关闭后状态标记为已解决，提示在 2 小时后平滑淡出归档。

---

## 🏗️ 目录结构

```
src/
├── components/          # 功能组件 (已全面微信原生化)
│   ├── WeChatTabBar.vue # 微信原生四大底部页签
│   ├── TopNav.vue       # 顶栏胶囊 (地图/朋友圈切换)
│   ├── MapView.vue      # 地图模式 (Zenly 围栏、无水印、35m聚合)
│   ├── MomentsView.vue  # 朋友圈模式 (无边框极细线社交流)
│   ├── ContactsTab.vue  # 通讯录主页面 (第2页签)
│   ├── ChatsTab.vue     # 聊天会话列表 (第3页签)
│   ├── MeTab.vue        # 我 (第4页签，纯净顶栏)
│   ├── DetailSheet.vue  # 动态/求助详情 (全屏原生页)
│   ├── ClusterSheet.vue # 地点聚合动态 (全屏原生页)
│   ├── PublishSheet.vue # 发布动态/呼救 (全屏原生页)
│   ├── MyProfileSheet.vue # 个人信息设置 (全屏原生页 + ActionSheet)
│   ├── UserCardModal.vue# 他人详细资料 (全屏原生页)
│   ├── ChatSheet.vue    # 1v1 私聊窗口 (全屏原生页)
│   └── ImagePreviewModal.vue # 全屏大图灯箱预览
├── composables/
│   └── useAppState.ts   # 全局单例状态流与数据契约
├── services/
│   ├── geo.ts           # Haversine 500m 精确球面距离过滤
│   └── storage.ts       # 本地双保险持久化存储
├── types/
│   └── index.ts         # TypeScript 数据模型定义
└── pages/
    └── index/index.vue  # 应用主容器
docs/
└── INTERACTION_MANUAL.md # 完整产品交互与开发设计手册
```

---

## 🚀 本地开发与线上部署

### 1. 本地启动
```bash
npm install
npm run dev:h5
```
访问本地：`http://localhost:5173`

### 2. 构建生产产物
```bash
npm run build:h5
```

### 3. 线上演示站点 (GitHub Pages)
- **线上地址**：[https://chase-xue.github.io/map-social-500m/](https://chase-xue.github.io/map-social-500m/)
