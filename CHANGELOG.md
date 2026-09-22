# Changelog

本项目的所有重要变更都记录在此文件。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2026-09-22

### ✨ 新增功能

#### 地图模式
- 全屏原生地图渲染
- GPS 精准定位 + 呼吸光标
- 500m 可视围栏（Haversine 球面距离算法）
- 状态地图打点（Marker + Callout）
- 同地点聚合（35m 内多条状态聚合展示）
- 地图控制按钮（复位、刷新、模拟走动）

#### 朋友圈模式
- 按发布时间倒序展示动态
- 点赞互动功能
- 评论系统（支持文字 + 图片）
- 图片点击放大查看

#### 个人资料
- 我的资料编辑（头像、昵称、性别、年龄、签名）
- 手机号绑定 + 隐私展示开关
- 他人资料卡查看

#### 社交功能
- 好友系统（申请、通过、列表）
- 1v1 私聊消息
- 一键拨打公开手机号

#### 数据存储
- 本地 JSON 文件持久化
- 跨平台 Storage 兼容
- 预置测试数据

### 🏗️ 架构优化

- 从 3880 行单文件重构为组件化架构
- 引入 Composable 单例状态管理
- 建立 z-index 分层规范（防止弹窗遮挡）
- TypeScript 严格类型定义
- 全局样式统一管理

### 📱 跨端支持

- 微信小程序
- 抖音小程序
- Android App
- iOS App
- H5 网页

### 📚 文档

- README.md 项目说明
- CONTRIBUTING.md 贡献指南
- CHANGELOG.md 变更日志
- .gitignore 规范

[1.0.0]: https://github.com/your-username/map-social-500m/releases/tag/v1.0.0
