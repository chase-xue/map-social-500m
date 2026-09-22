# Contributing Guide

感谢你对 500米地图生活圈 项目的关注！我们欢迎各种形式的贡献。

## 🐛 报告 Bug

如果发现 Bug，请创建 Issue 并包含以下信息：

1. **清晰的标题**：简明扼要描述问题
2. **复现步骤**：详细的操作步骤
3. **期望行为**：你认为应该发生什么
4. **实际行为**：实际发生了什么
5. **环境信息**：
   - 平台（微信小程序/App/H5）
   - 设备型号 + 系统版本
   - 应用版本

## 💡 功能建议

欢迎提出新功能建议！请创建 Issue 并说明：

1. **使用场景**：这个功能解决什么问题
2. **功能描述**：你期望的功能是什么样的
3. **替代方案**：是否考虑过其他解决方案

## 🔧 提交代码

### 开发流程

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feat/your-feature`
3. 提交代码：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feat/your-feature`
5. 提交 Pull Request

### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

示例：
```
feat: 添加朋友圈点赞功能
fix: 修复 500m 距离计算精度问题
docs: 更新 README 安装说明
```

### 代码风格

- **TypeScript**：严格模式，所有变量必须有类型
- **Vue 组件**：使用 `<script setup>` 语法
- **命名规范**：
  - 组件文件：PascalCase（如 `TopNav.vue`）
  - 函数/变量：camelCase（如 `getUserProfile`）
  - 常量：UPPER_SNAKE_CASE（如 `Z_INDEX`）
- **注释**：关键逻辑必须有中文注释

### PR 检查清单

提交 PR 前请确认：

- [ ] 代码在所有目标平台测试通过（微信小程序、App、H5）
- [ ] 遵循项目代码风格
- [ ] 添加了必要的注释
- [ ] 更新了相关文档（如需要）
- [ ] Commit 信息符合规范

## 📝 开发环境搭建

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/map-social-500m.git
cd map-social-500m

# 2. 安装依赖
npm install

# 3. 启动 H5 开发服务器
npm run dev:h5

# 4. 访问 http://localhost:5173
```

## 🏗️ 架构说明

- **状态管理**：`composables/useAppState.ts` 单例模式
- **组件拆分**：每个功能模块独立组件
- **样式管理**：`styles/global.scss` 统一管理，z-index 分层
- **服务层**：`services/` 目录封装业务逻辑（地理计算、数据存储）

## ❓ 需要帮助？

- 查看 [README.md](./README.md)
- 查看现有 Issue 和讨论
- 联系维护者：[your-email@example.com]

---

再次感谢你的贡献！🎉
