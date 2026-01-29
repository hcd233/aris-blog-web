# Aris Blog - 现代化博客网站

基于 Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui 构建的现代化博客平台。

## 技术栈

- **框架**: Next.js 16.1.6 (使用 Turbopack)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **UI组件**: shadcn/ui
- **API客户端**: @hey-api/client-fetch (基于 OpenAPI 自动生成)
- **图标**: Lucide React

## 项目结构

```
web/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # 全局样式
│   │   ├── layout.tsx       # 根布局
│   │   └── page.tsx         # 首页
│   ├── components/          # 组件
│   │   ├── article-card.tsx # 文章卡片
│   │   ├── footer.tsx       # 页脚
│   │   ├── navigation.tsx   # 导航栏
│   │   └── ui/              # shadcn/ui 组件
│   ├── lib/
│   │   ├── api/             # 自动生成的 API 客户端
│   │   │   ├── config.ts    # API 配置
│   │   │   ├── sdk.gen.ts   # API 方法
│   │   │   └── types.gen.ts # TypeScript 类型
│   │   └── utils.ts         # 工具函数
│   └── types/
│       └── api.d.ts         # OpenAPI 类型定义
├── openapi.yaml             # OpenAPI 规范文件
└── next.config.ts           # Next.js 配置
```

## API 客户端使用

API 客户端基于 OpenAPI 规范自动生成，位于 `src/lib/api/` 目录。

### 基础用法

```typescript
import { listArticles, getArticleInfo, createArticle } from '@/lib/api/config';

// 获取文章列表
const { data, error } = await listArticles({
  query: {
    page: 1,
    pageSize: 10,
  },
});

// 获取单篇文章
const { data } = await getArticleInfo({
  path: {
    articleID: 1,
  },
});

// 创建文章（需要认证）
const { data } = await createArticle({
  body: {
    title: '文章标题',
    slug: 'article-slug',
    categoryID: 1,
    tags: ['tag1', 'tag2'],
  },
});
```

### 认证

API 客户端自动处理 JWT Token：

1. 登录后保存 token：
```typescript
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

2. 客户端会自动在请求头中添加 Authorization
3. Token 过期时会自动刷新

### 类型定义

所有 API 类型都在 `src/lib/api/types.gen.ts` 中：

```typescript
import type { Article, User, Comment, Tag } from '@/lib/api/config';
```

## 开发

```bash
# 安装依赖
npm install

# 开发模式（启用 Turbopack）
npm run dev

# 构建
npm run build

# 生产模式
npm run start
```

## 添加 shadcn/ui 组件

```bash
npx shadcn add [组件名]
```

## 更新 API 客户端

当后端 API 变更时，重新生成客户端：

```bash
# 1. 更新 OpenAPI 规范
curl -o openapi.yaml https://s.lvlvko.top/openapi.yaml

# 2. 重新生成客户端
npx @hey-api/openapi-ts -i openapi.yaml -o src/lib/api -c @hey-api/client-fetch

# 3. 重新生成类型（可选）
npx openapi-typescript openapi.yaml -o src/types/api.d.ts
```

## 特性

- ✨ 基于 Turbopack 的快速开发体验
- 🎨 使用 Tailwind CSS 和 shadcn/ui 的现代化设计
- 🔒 自动 JWT Token 管理和刷新
- 📱 响应式设计，支持移动端
- 🚀 TypeScript 类型安全
- 🔄 基于 OpenAPI 的自动生成 API 客户端
