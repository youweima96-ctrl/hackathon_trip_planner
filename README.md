# 古董展示交易平台

一个专业的古董展示交易平台，为古董爱好者和收藏家提供在线展示、交流和交易服务。

## 🎯 功能特色

### ✅ 已完成功能
- **用户认证系统** - 注册、登录、退出
- **古董展示** - 浏览、搜索、筛选古董
- **图片上传** - 支持多图上传、自动压缩优化
- **实时聊天** - 基于Supabase Realtime的即时通讯
- **好友系统** - 添加好友、管理好友关系
- **响应式设计** - 完美适配移动端、平板、桌面端

### 🏗️ 技术架构
- **前端**: React 18 + TypeScript + Vite + Tailwind CSS
- **状态管理**: Zustand
- **后端**: Supabase (认证、数据库、存储、实时通信)
- **图片处理**: Browser Image Compression
- **UI组件**: Headless UI + Radix UI

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 pnpm

### 安装依赖
```bash
npm install
```

### 配置环境变量
复制 `.env.example` 为 `.env` 并填写您的 Supabase 配置：
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173 查看应用

## 📁 项目结构

```
src/
├── components/          # React组件
│   ├── AuthForm.tsx    # 登录注册表单
│   ├── AntiqueList.tsx # 古董列表组件
│   ├── ChatWindow.tsx  # 聊天窗口
│   └── AuthProvider.tsx # 认证提供者
├── pages/              # 页面组件
│   ├── HomePage.tsx    # 首页
│   ├── ChatPage.tsx    # 聊天页面
│   ├── PublishPage.tsx # 发布古董页面
│   └── FriendsPage.tsx # 好友管理页面
├── stores/             # 状态管理
│   ├── authStore.ts    # 认证状态
│   ├── antiqueStore.ts # 古董数据状态
│   └── messageStore.ts # 消息状态
├── lib/                # 工具库
│   ├── supabase.ts     # Supabase客户端
│   ├── storage.ts      # 文件存储
│   └── imageUtils.ts   # 图片处理工具
└── router.tsx          # 路由配置
```

## 🔧 主要功能详解

### 用户认证
- 邮箱注册登录
- JWT Token认证
- 用户信息管理

### 古董展示
- 网格布局展示
- 多条件筛选（类别、价格、年代）
- 关键词搜索
- 图片轮播展示

### 图片上传
- 多文件选择
- 自动压缩优化（最大1MB，1920px）
- 格式验证（JPG、PNG、WebP）
- Supabase Storage存储

### 实时聊天
- 基于Supabase Realtime
- 消息实时推送
- 好友在线状态
- 聊天记录持久化

### 好友系统
- 搜索添加好友
- 好友请求管理
- 好友列表展示
- 一键发起聊天

## 🎨 设计特色

- **古典风格**: 深棕色配金色，体现古董韵味
- **响应式**: 适配各种设备尺寸
- **用户体验**: 流畅的交互动画
- **现代化**: 简洁清晰的界面布局

## 🛡️ 安全特性

- Row Level Security (RLS) 策略
- 用户权限控制
- 数据访问隔离
- 图片访问权限管理

## 📱 移动端优化

- 触摸友好的界面设计
- 底部导航栏
- 手势滑动支持
- 图片懒加载

## 🔮 未来规划

- [ ] 古董详情页面
- [ ] 个人中心完善
- [ ] 我的古董管理
- [ ] 收藏功能
- [ ] 交易功能
- [ ] 评价系统
- [ ] 通知推送
- [ ] 多语言支持

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🆘 支持

如有问题，请在 GitHub 提交 Issue。

---

**古董交易平台** - 连接古今，传承文化
