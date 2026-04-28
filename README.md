
# Stardew Valley UI 🌾

一个 **星露谷风格、像素化的前端组件库**，基于 React + TypeScript + Vite 构建，使用 Bun 作为默认包管理器和运行时。  
目标是打造一个复古像素风格的 UI 组件库，适合网页和应用开发。

---

## ✨ 项目目标
- 打造 **星露谷风格** 的前端组件库，复古、像素化、自然田园风。  
- 提供常用的 UI 组件，目前已包含：
  - 按钮（Button）
  - 卡片（Card）
  - Loading 状态
  - 对话框（Dialog）
  - 提示框（Message/Toast）
  - 日历（Calendar）  
- 持续更新更多组件，逐步完善。

---

## ⚖️ 版权说明
由于版权问题，本项目 **不会直接使用星露谷的官方素材**。  
所有 UI 元素均由我自己编写或通过 AI 生成，力求还原星露谷风格，但不会涉及版权风险。  
可能不够完美，但这是一个安全且可持续的方向。  
如果你有更好的改进建议，欢迎留言或提交 Issue 😄。

---

## 📚 技术栈
- **React + TypeScript**：组件开发
- **Vite**：构建工具
- **Bun**：包管理与运行时
- **SCSS**：样式预处理器
- **Vitest**：单元测试框架

---

## 🛠️ 本地开发

安装依赖：
```bash
bun install
```

启动开发服务器：
```bash
bun run dev
```

生产构建：
```bash
bun run build
```

运行 lint 和测试：
```bash
bun run lint
bun run test:run
```

---

## 🚀 GitHub Pages 部署
本项目已配置 GitHub Actions 自动部署到 GitHub Pages。

- 推送到 `main` 分支会触发部署。  
- 工作流使用 `bun install --frozen-lockfile` 安装依赖。  
- 构建命令为 `bun run build`。  
- Vite 的 `base` 已配置为 `stardewUi` 仓库。  
- `scripts/prepare-github-pages.mjs` 会在 `dist` 中生成 `404.html` 和 `.nojekyll`，保证 SPA 路由正常。

### 仓库设置
在 GitHub 仓库的 **Pages 设置**中：
- Source 选择：`GitHub Actions`  
- 每次成功运行 `.github/workflows/deploy-pages.yml` 都会发布最新的 `dist` 输出。

---

## 🤝 参与共建
- 如果你在使用过程中遇到问题、疑问或有改进建议，欢迎提交 **Issues** 或联系我。  
- 如果你有兴趣帮忙维护，这里是你需要了解的技术栈：  
  - React + TypeScript  
  - Bun  
  - Vite  
  - SCSS  
  - Vitest  
- 欢迎提出开发想法，一起完善这个星露谷风格的组件库！  

---

## 📌 致谢
感谢所有关注和支持这个项目的人。  
希望它能为你的前端开发带来一丝 **像素田园的温暖氛围** 🌿。