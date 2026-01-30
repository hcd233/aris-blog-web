# Aris Blog 开发文档

## 项目概述

**项目名称**: Aris Blog
**项目类型**: 现代化博客平台前端应用
**技术栈**: Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4

Aris Blog 是一个基于 Next.js 16 构建的现代化博客平台，支持文章浏览、发布、标签分类、OAuth2 登录等功能。

---

## 技术栈详情

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16.1.6 | React 全栈框架，使用 App Router |
| **React** | 19.2.3 | UI 库 |
| **TypeScript** | ^5 | 类型系统 |
| **Tailwind CSS** | ^4 | 原子化 CSS 框架 |

### UI 组件库

| 技术 | 版本 | 用途 |
|------|------|------|
| **shadcn/ui** | - | UI 组件库（new-york 风格） |
| **Radix UI** | 多个包 | 无头 UI 组件原语 |
| **class-variance-authority** | ^0.7.1 | 组件变体管理 |
| **tailwind-merge** | ^3.4.0 | Tailwind 类名合并 |
| **lucide-react** | ^0.563.0 | 图标库 |

### 富文本编辑器

| 技术 | 版本 | 用途 |
|------|------|------|
| **@tiptap/react** | ^3.18.0 | 富文本编辑器框架 |
| **@tiptap/starter-kit** | ^3.18.0 | 基础扩展包 |
| **@tiptap/extension-placeholder** | ^3.18.0 | 占位符扩展 |
| **@tiptap/extension-mention** | ^3.18.0 | 提及功能扩展 |

### API 客户端

| 技术 | 版本 | 用途 |
|------|------|------|
| **@hey-api/client-fetch** | ^0.13.1 | OpenAPI 生成的 API 客户端 |
| **@hey-api/openapi-ts** | ^0.90.10 | OpenAPI 代码生成器 |
| **openapi-typescript** | ^7.10.1 | OpenAPI TypeScript 类型生成 |

---

## 目录结构

```
web/
├── public/                    # 静态资源
│   └── *.svg, favicon.ico
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── auth/callback/[provider]/page.tsx  # OAuth2 回调
│   │   ├── login/page.tsx                     # 登录页面
│   │   ├── publish/page.tsx                   # 文章发布
│   │   ├── globals.css                        # 全局样式
│   │   ├── layout.tsx                         # 根布局
│   │   └── page.tsx                           # 首页
│   ├── components/
│   │   ├── ui/                # shadcn/ui 组件
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   └── textarea.tsx
│   │   ├── article-card.tsx          # 文章卡片组件
│   │   ├── article-detail-modal.tsx  # 文章详情弹窗
│   │   ├── cover-upload.tsx          # 封面上传组件
│   │   ├── footer.tsx                # 页脚组件
│   │   ├── navigation.tsx            # 顶部导航组件
│   │   ├── rich-text-content.tsx     # 富文本内容渲染
│   │   ├── rich-text-editor.tsx      # 富文本编辑器
│   │   ├── sidebar.tsx               # 侧边栏组件
│   │   └── tag-input.tsx             # 标签输入组件
│   ├── lib/
│   │   ├── api/               # 自动生成的 API 客户端
│   │   │   ├── client.gen.ts
│   │   │   ├── client/
│   │   │   ├── core/
│   │   │   ├── sdk.gen.ts
│   │   │   ├── types.gen.ts
│   │   │   └── index.ts
│   │   ├── auth.tsx           # 认证上下文
│   │   ├── theme.tsx          # 主题上下文
│   │   └── utils.ts           # 工具函数
│   ├── types/
│   │   └── api.d.ts           # OpenAPI 类型定义
│   └── hooks/                 # React Hooks
├── components.json            # shadcn/ui 配置
├── next.config.ts             # Next.js 配置
├── package.json
├── postcss.config.mjs         # PostCSS 配置
├── README.md
└── tsconfig.json              # TypeScript 配置
```

---

## 核心功能模块

### 1. 认证系统 (`src/lib/auth.tsx`)

使用 React Context 提供全局认证状态管理：

- **JWT Token 管理**: Token 存储在 localStorage，支持自动刷新
- **OAuth2 集成**: 支持 GitHub、Google 等第三方登录
- **登录状态**: 提供 `isLoggedIn`、`user` 等状态

**关键 API**:
```typescript
// 登录
login(token: string): void

// 登出
logout(): void

// 检查登录状态
isLoggedIn: boolean

// 当前用户信息
user: User | null
```

### 2. 主题系统 (`src/lib/theme.tsx`)

支持三种主题模式：
- **light**: 浅色主题
- **dark**: 深色主题
- **system**: 跟随系统偏好

主题偏好持久化到 localStorage，使用 CSS 变量实现无缝切换。

### 3. 页面路由

| 路由 | 功能 | 文件路径 |
|------|------|----------|
| `/` | 首页，瀑布流文章列表 | `src/app/page.tsx` |
| `/login` | 登录页面（OAuth2 + 邮箱） | `src/app/login/page.tsx` |
| `/publish` | 文章发布页面 | `src/app/publish/page.tsx` |
| `/auth/callback/[provider]` | OAuth2 回调处理 | `src/app/auth/callback/[provider]/page.tsx` |

### 4. 核心组件

#### 文章卡片 (ArticleCard)
- 瀑布流布局展示
- 支持渐变封面
- 显示文章标题、摘要、标签、作者信息

#### 文章详情弹窗 (ArticleDetailModal)
- 使用 Dialog 组件实现
- 展示完整文章内容
- 支持富文本渲染

#### 富文本编辑器 (RichTextEditor)
- 基于 TipTap 框架
- 支持格式工具栏（粗体、斜体、标题等）
- 支持标签提及功能（@标签）
- 占位符提示

#### 侧边栏 (Sidebar)
- 左侧固定导航
- 包含：发现、发布、通知、个人中心入口

#### 封面上传 (CoverUpload)
- 支持拖拽上传
- 图片预览
- 文件类型和大小校验

---

## API 架构

### 自动生成流程

1. **OpenAPI 规范**: 后端提供 OpenAPI 3.0 规范文档
2. **代码生成**: 使用 `@hey-api/openapi-ts` 自动生成 TypeScript 客户端
3. **类型同步**: 类型定义自动更新，保证前后端一致性

### API 客户端结构

```
src/lib/api/
├── client.gen.ts     # 客户端配置
├── sdk.gen.ts        # SDK 方法（自动生成的 API 调用）
├── types.gen.ts      # TypeScript 类型定义
├── client/           # HTTP 客户端核心
├── core/             # 核心工具函数
└── index.ts          # 导出入口
```

### API 功能模块

- **文章管理**: CRUD 操作、列表查询
- **标签系统**: 标签创建、关联、搜索
- **用户认证**: OAuth2 登录、Token 刷新
- **待办事项**: Todo 管理
- **AI 聊天**: 智能对话功能

---

## 架构设计

### 设计模式

1. **组件化架构**: 高度复用的 UI 组件，遵循单一职责原则
2. **上下文模式**: 使用 React Context 管理全局状态（认证、主题）
3. **API-First 设计**: 基于 OpenAPI 规范驱动开发
4. **声明式路由**: Next.js App Router 的基于文件的路由系统

### 状态管理

- **全局状态**: React Context (认证、主题)
- **本地状态**: React useState/useReducer
- **服务器状态**: 通过 API 客户端直接管理

### 样式架构

- **Tailwind CSS 4**: 原子化 CSS，支持 JIT 编译
- **CSS 变量**: 主题切换的核心机制
- **shadcn/ui**: 基础组件库，支持深度定制

---

## 开发环境配置

### 环境要求

- Node.js 18+
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 开发脚本

```json
{
  "dev": "next dev",      // 开发模式（启用 Turbopack）
  "build": "next build",  // 生产构建
  "start": "next start"   // 生产模式启动
}
```

### 开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 构建与部署

### 生产构建

```bash
npm run build
```

构建输出位于 `.next/` 目录

### 部署方式

1. **Vercel**: 原生支持 Next.js，一键部署
2. **自托管**: 使用 `next start` 启动生产服务器
3. **静态导出**: 可配置为静态站点（需修改 next.config.ts）

---

## 代码规范

### TypeScript 配置

- 严格模式启用
- 完整类型定义
- API 类型自动生成

### 组件开发规范

1. 使用函数组件 + Hooks
2. Props 定义完整的 TypeScript 接口
3. 组件文件名使用 PascalCase
4. 工具函数使用 camelCase

### CSS 规范

1. 优先使用 Tailwind CSS 工具类
2. 自定义样式使用 CSS Modules 或 globals.css
3. 主题变量统一在 globals.css 中定义

---

## 依赖版本

### 生产依赖

```json
{
  "@hey-api/client-fetch": "^0.13.1",
  "@radix-ui/react-avatar": "^1.1.11",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "@radix-ui/react-navigation-menu": "^1.2.14",
  "@radix-ui/react-separator": "^1.1.8",
  "@radix-ui/react-slot": "^1.2.4",
  "@tailwindcss/typography": "^0.5.19",
  "@tiptap/extension-mention": "^3.18.0",
  "@tiptap/extension-placeholder": "^3.18.0",
  "@tiptap/react": "^3.18.0",
  "@tiptap/starter-kit": "^3.18.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.563.0",
  "next": "16.1.6",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "tailwind-merge": "^3.4.0",
  "tailwindcss": "^4",
  "tw-animate-css": "^1.4.0"
}
```

### 开发依赖

```json
{
  "@hey-api/openapi-ts": "^0.90.10",
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "openapi-typescript": "^7.10.1",
  "typescript": "^5"
}
```

---

## 技术亮点

1. **Next.js 16 + Turbopack**: 极速的开发编译体验
2. **React 19**: 最新的 React 特性和性能优化
3. **TypeScript 5**: 完整的类型安全和智能提示
4. **Tailwind CSS 4**: 新一代原子化 CSS，性能更优
5. **shadcn/ui**: 现代化的无头组件库
6. **TipTap**: 强大的富文本编辑器，高度可定制
7. **API 自动生成**: OpenAPI 驱动的类型安全 API 客户端
8. **瀑布流布局**: CSS columns 实现的文章瀑布流展示

---

## 未来规划

### 功能增强

- [ ] 文章评论系统
- [ ] 用户关注/粉丝功能
- [ ] 文章收藏功能
- [ ] 全文搜索
- [ ] 文章草稿自动保存

### 性能优化

- [ ] 图片懒加载和优化
- [ ] 虚拟滚动（长列表）
- [ ] 路由预加载
- [ ] Service Worker 缓存

### 测试覆盖

- [ ] 单元测试 (Vitest)
- [ ] 组件测试 (React Testing Library)
- [ ] E2E 测试 (Playwright)

### 其他

- [ ] PWA 支持
- [ ] 国际化 (i18n)
- [ ] SEO 优化
- [ ] 性能监控

---

## 开发注意事项

1. **API 变更**: 修改后端 API 后需重新生成客户端代码
2. **类型安全**: 所有 API 调用必须使用生成的类型
3. **认证流程**: OAuth2 回调处理需保持与后端一致
4. **图片域名**: 新增图片域名需在 next.config.ts 中配置
5. **环境变量**: 敏感信息不要提交到版本控制

---

## 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [TipTap 文档](https://tiptap.dev)
- [Radix UI 文档](https://www.radix-ui.com)
