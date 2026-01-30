# AGENTS.md - 代码规范指南

Next.js 16.1.6 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui 博客应用。

**后续更新必须使用中文**

## 技术栈

- **框架**: Next.js 16.1.6 (App Router, Turbopack)
- **语言**: TypeScript 5 (严格模式)
- **样式**: Tailwind CSS 4 + CSS 变量
- **UI组件**: shadcn/ui (New York 风格), Lucide 图标
- **API客户端**: @hey-api/client-fetch (OpenAPI生成)
- **认证**: OAuth2 + JWT (localStorage存储)

## 构建命令

```bash
npm run dev          # 开发模式（Turbopack）
npm run build        # 生产构建
npm run start        # 生产服务器
npm install          # 安装依赖
npx shadcn add <组件名>  # 添加shadcn组件
```

## 代码风格规范

### TypeScript规范
- 启用严格模式 (tsconfig.json中已配置)
- 优先使用 `type` 而非 `interface`
- 使用路径别名 `@/*` 导入 src/ 目录下的模块
- 使用 `React.ComponentProps<"元素">` 定义 HTML 属性类型

### 导入顺序
```typescript
// 1. React/Next.js 导入
import { useState } from "react";

// 2. 第三方库
import { cva } from "class-variance-authority";

// 3. 本地组件
import { Button } from "@/components/ui/button";

// 4. 本地工具函数
import { cn } from "@/lib/utils";
```

### 命名规范
- **组件**: PascalCase (如 `ArticleCard`, `Button`)
- **函数**: camelCase (如 `getUser`, `handleClick`)
- **文件**: kebab-case (如 `article-card.tsx`)
- **类型**: PascalCase，使用 `type` 关键字 (如 `type ButtonProps`)
- **常量**: UPPER_SNAKE_CASE (如 `API_BASE_URL`)
- **Hook**: camelCase，以 "use" 开头 (如 `useAuth`)

### React组件规范
```typescript
"use client";

import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: "default" | "outline";
};

function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button 
      className={cn("base", variant === "outline" && "border", className)} 
      {...props} 
    />
  );
}
```

### Tailwind CSS规范
- 使用 `cn()` 工具函数合并类名
- 使用 CSS 变量定义主题色
- 长类名字符串使用 `cn()` 换行提高可读性

### 错误处理规范
```typescript
try {
  const { data, error } = await listArticles(params);
  if (error) {
    console.error("API错误:", error);
    return;
  }
  if (data?.articles) setArticles(data.articles);
} catch (error) {
  console.error("请求失败:", error);
} finally {
  setLoading(false);
}
```

### API客户端使用
```typescript
import { listArticles } from "@/lib/api/config";

const { data, error } = await listArticles({ query: { page: 1 } });
if (error) return;
console.log(data.articles);
```

### Toast通知使用
基于sonner的消息通知系统，替代浏览器默认alert。

```typescript
import { toast } from "sonner";

// 成功提示
toast.success("发布成功！", {
  description: "您的文章已成功发布",
});

// 错误提示
toast.error("请先登录", {
  description: "登录后即可点赞",
});

// 警告提示
toast.warning("标签数量限制", {
  description: "最多只能添加 10 个标签",
});

// 信息提示
toast.info("敬请期待", {
  description: "该功能正在开发中",
});
```

## 关键文件

| 文件 | 用途 |
|------|------|
| `src/lib/utils.ts` | `cn()` 工具函数（Tailwind类名合并） |
| `src/lib/api/config.ts` | API客户端配置 |
| `src/lib/auth.tsx` | 认证上下文/Provider |
| `src/lib/theme.tsx` | 暗黑/亮色模式Provider |
| `src/app/globals.css` | Tailwind CSS v4 配置 |
| `src/app/profile/page.tsx` | 个人资料页面（小红书风格） |
| `src/components/ui/sonner.tsx` | Toast通知组件（基于sonner） |
| `src/components/article-detail-modal.tsx` | 文章详情弹窗，支持多图片轮播（小红书风格） |

## 页面说明

### 个人资料页面 (/profile)
小红书风格的个人主页，包含：
- 顶部用户信息展示（头像、用户名、ID、IP属地）
- Tab切换：笔记/收藏/点赞（收藏和点赞已加锁，点击显示"敬请期待"）
- 笔记瀑布流展示（使用 ArticleCard 组件）
- 未登录自动重定向到登录页

## 项目结构

```
src/
├── app/              # Next.js 页面
├── components/       # React组件
│   └── ui/          # shadcn/ui组件
├── lib/             # 工具函数
│   ├── api/         # 自动生成的API客户端
│   ├── utils.ts     # cn()工具函数
│   ├── auth.tsx     # 认证上下文
│   └── theme.tsx    # 主题Provider
└── types/           # 类型定义
```

## 认证流程

1. OAuth登录 → 重定向到认证提供商
2. 回调地址 `/auth/callback/[provider]/`
3. 将token存储在 localStorage
4. `setAuthToken()` 设置API请求头
5. AuthContext 提供 `user` 和 `isAuthenticated`

## 组件模式

**客户端组件**: 使用 `"use client"` 指令，适用于：
- React hooks (useState, useEffect等)
- 浏览器API (localStorage, window, document)
- 事件处理器

**服务端组件**: 默认模式，适用于：
- 数据获取
- 访问 request/response 对象
- 减小客户端包体积

## 维护规则

**重要**: 每次完成新任务后，必须更新此 AGENTS.md 文件，添加：
1. 新组件的说明
2. 新工具函数/文件
3. 新API端点的使用模式
4. 新依赖项
5. 新代码模式或约定

**最后更新**: 2026-01-31

### 图片上传组件升级（多图片、拖拽排序、进度条）
- **功能需求**: 
  1. 支持上传多个图片
  2. 支持删除图片
  3. 拖拽替换图片顺序
  4. 发布时先调用uploadImage接口上传图片
  5. 发布显示进度条，进度 = 图片数 + 1（创建文章）
- **实现方案**:
  1. 使用 `npx shadcn@latest add progress` 添加进度条组件
  2. 重写 `cover-upload.tsx`：
     - props改为 `images: File[]` 和 `onChange: (images: File[]) => void`
     - 支持多文件选择和拖拽上传
     - 3x3网格展示图片，显示序号（第一张为封面）
     - 每张图片可拖拽排序，悬停显示删除按钮
     - 网格最后显示"添加图片"按钮
  3. 更新 `publish/page.tsx`：
     - formData.images 改为 `File[]` 类型
     - 发布流程：
       a. 遍历所有图片调用 uploadImage 接口
       b. 收集返回的 imageName
       c. 最后调用 createArticle，传入图片名数组
     - 使用 Progress 组件显示进度覆盖层
     - 进度消息实时更新（"上传第x张..." -> "正在发布..." -> "发布成功"）
- **文件位置**:
  - src/components/cover-upload.tsx
  - src/components/ui/progress.tsx
  - src/app/publish/page.tsx

**血泪教训**: 
- 重新生成API模型时，**必须**检查并保留手动添加的配置（如baseUrl）
- config.ts中函数定义必须在调用**之前**
- API字段变更时要全局搜索旧字段引用
- 每次修改后都要验证：1. 构建通过 2. 请求URL正确 3. Authorization header存在
- **localStorage token键名统一使用驼峰命名 `accessToken`**，不要写成下划线 `access_token`（项目已统一使用驼峰命名）
- **添加新功能前务必先检查是否已有现成组件**：在profile页面添加侧边栏时，没有先检查是否已有Sidebar组件，导致重复造轮子。应先用`glob`或`grep`搜索项目中是否已有类似组件，再决定是否新建

### 文章详情多图片轮播
- **现象**: 文章详情页只支持展示单张封面图片，不支持多图片展示
- **原因**: API旧版本使用coverImage字段存储单张图片，新版本改为images数组
- **解决方案**: 
  1. 使用openapi-ts从https://mem.lvlvko.top/openapi.yaml拉取最新API模型
  2. 更新article-detail-modal组件，实现小红书风格的多图片轮播：
     - 左右滑动切换图片（支持鼠标和触摸）
     - 左右箭头按钮切换（小红书风格，边缘渐变背景）
     - 顶部显示当前图片索引 (1/12)
     - 底部指示点显示当前位置，支持点击跳转
     - 图片懒加载（loading="lazy"）
     - 图片预览模式同样支持多图片切换
  3. 更新publish页面，使用images数组替代coverImage
- **文件位置**: 
  - src/lib/api/config.ts
  - src/lib/api/types.gen.ts
  - src/lib/api/sdk.gen.ts
  - src/components/article-detail-modal.tsx
  - src/app/publish/page.tsx

### Toast通知系统
- **现象**: 使用浏览器默认的 `alert()` 提示信息，用户体验不佳
- **原因**: 浏览器默认alert会阻塞用户操作，且样式不统一
- **解决方案**: 
  1. 使用 `npx shadcn@latest add sonner` 安装sonner组件
  2. 在 `src/app/layout.tsx` 中添加 `<Toaster position="top-center" />`
  3. 将所有 `alert()` 替换为 `toast.success()` / `toast.error()` / `toast.info()` / `toast.warning()`
  4. 配置 `toastOptions.classNames` 确保浅色模式下使用黑色(foreground)字体
- **文件位置**: 
  - src/app/layout.tsx
  - src/app/profile/page.tsx
  - src/components/article-card.tsx
  - src/components/article-detail-modal.tsx
  - src/components/tag-input.tsx
  - src/app/login/page.tsx
  - src/app/publish/page.tsx
  - src/components/cover-upload.tsx
  - src/components/ui/sonner.tsx

## Bug修复日志

每次解决bug后必须在此记录，格式如下：

### [日期] Bug标题
- **现象**: 描述bug的具体表现
- **原因**: 分析bug产生的根本原因
- **解决方案**: 具体的修复步骤
- **文件位置**: 修改的文件路径

### 2026-01-31 API客户端配置 - baseUrl缺失
- **现象**: API请求无法到达后端，请求404或失败
- **原因**: 使用`openapi-ts`重新生成API模型后，手动创建的`config.ts`漏掉了`baseUrl`配置，导致客户端使用默认空字符串作为baseUrl
- **解决方案**: 在`config.ts`中添加`baseUrl: "https://mem.lvlvko.top"`
- **文件位置**: src/lib/api/config.ts

### 2026-01-31 API客户端配置 - 初始化顺序错误
- **现象**: 认证token未正确设置，请求Authorization header缺失
- **原因**: `setAuthToken`函数定义在初始化调用代码之后，导致初始化时函数未定义
- **解决方案**: 调整代码顺序：1. 定义`setAuthToken`函数 2. 配置baseUrl 3. 从localStorage读取token并调用setAuthToken
- **文件位置**: src/lib/api/config.ts

### 2026-01-31 API模型字段变更导致编译错误
- **现象**: TypeScript编译报错，`Property 'coverImage' does not exist on type 'DetailedArticle'`
- **原因**: 后端API从`coverImage`单字段改为`images`数组字段，openapi.yaml更新后，旧代码引用了不存在的字段
- **解决方案**: 
  1. 使用`openapi-ts`重新生成API客户端（`types.gen.ts`, `sdk.gen.ts`）
  2. 更新`article-detail-modal.tsx`：使用`article.images`数组替代`article.coverImage`，实现多图片轮播
  3. 更新`publish/page.tsx`：使用`images`数组字段创建文章
- **文件位置**: 
  - src/lib/api/types.gen.ts
  - src/lib/api/sdk.gen.ts  
  - src/components/article-detail-modal.tsx
  - src/app/publish/page.tsx

### 2026-01-30 API请求未携带Authorization Header
- **现象**: 请求需要鉴权的接口时返回401，请求头中没有Authorization字段
- **原因**: `setAuthToken`函数使用`client.setConfig({ headers: {...} })`会覆盖整个client配置，导致baseUrl丢失；且客户端初始化时未自动从localStorage读取token
- **解决方案**: 
  1. 使用`client.getConfig()`获取当前配置并展开保留原有配置
  2. 添加客户端初始化逻辑，页面加载时自动从localStorage读取token并设置
- **文件位置**: src/lib/api/config.ts
