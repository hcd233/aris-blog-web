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
- **容器化**: Docker (多阶段构建 + Alpine Linux)

## 构建命令

```bash
npm run dev          # 开发模式（Turbopack）
npm run build        # 生产构建
npm run start        # 生产服务器
npm install          # 安装依赖
npx shadcn add <组件名>  # 添加shadcn组件
```

## Docker 部署

### 快速启动

```bash
# 使用 Docker Compose（推荐）
docker-compose up -d

# 或手动构建和运行
docker build -t nextjs-web .
docker run -p 3000:3000 nextjs-web
```

### Dockerfile 特性

- **多阶段构建**: 3阶段构建（deps → builder → runner），最终镜像仅~100MB
- **Alpine Linux**: 基于 `node:22-alpine`，轻量且安全
- **Standalone 模式**: 仅打包必要文件，无需完整 node_modules
- **BuildKit 优化**: 使用 `--mount=type=cache` 加速 npm 安装
- **非 root 用户**: 使用 uid 1001 的 nextjs 用户运行，增强安全性
- **dumb-init**: 正确处理 PID 1 信号，优雅退出

### 镜像对比

| 类型 | 大小 | 说明 |
|------|------|------|
| 开发环境 | ~2GB | 包含 node_modules 和源码 |
| 生产镜像 | ~100MB | Standalone + Alpine，仅运行时 |

### 环境变量

```bash
NODE_ENV=production        # 生产模式
NEXT_TELEMETRY_DISABLED=1  # 禁用 Next.js 遥测
PORT=3000                  # 服务端口
HOSTNAME=0.0.0.0           # 监听地址
NEXT_PUBLIC_API_BASE_URL=https://api-dev.blog.lvlvko.top  # API 基础地址（默认）
NEXT_PUBLIC_SITE_ICON_URL=https://api-dev.blog.lvlvko.top/static/web-icon.png  # 网站图标URL
```

### 自定义后端地址

开发环境：
```bash
# 编辑 .env.local 文件
NEXT_PUBLIC_API_BASE_URL=https://your-backend.com
```

生产环境：
```bash
# 运行容器时传入环境变量
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=https://your-backend.com nextjs-web
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
| `src/lib/notification-context.tsx` | 通知上下文，管理未读通知数 |
| `src/hooks/use-unread-notifications.ts` | 未读通知数hook |
| `src/app/globals.css` | Tailwind CSS v4 配置 |
| `src/app/profile/page.tsx` | 个人资料页面（小红书风格） |
| `src/app/notifications/page.tsx` | 通知页面（小红书风格，支持Tab切换） |
| `src/components/ui/sonner.tsx` | Toast通知组件（基于sonner） |
| `src/components/article-detail-modal.tsx` | 文章详情弹窗，支持多图片轮播（小红书风格） |
| `src/components/login-dialog.tsx` | 登录弹窗组件（小红书风格，响应式布局） |
| `src/components/mobile-nav.tsx` | 移动端底部导航栏（主页/商城/发布/通知/我） |
| `src/components/mobile-login-drawer.tsx` | 移动端底部登录抽屉（未登录时自动弹出） |
| `Dockerfile` | Docker 多阶段构建配置 |
| `docker-compose.yml` | Docker Compose 部署配置 |
| `.dockerignore` | Docker 构建忽略文件 |

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

**最后更新**: 2026-02-13

### 通知列表Bug修复 - 点赞评论时文章来源处理
- **问题**: 点赞评论时，API不返回 `article` 字段，而是返回 `comment.repliedArticle`，导致显示"该笔记已删除"
- **修复**: 
  1. 评论内容显示不再限制为 `type === "comment"`，只要有 `comment` 字段就显示
  2. 文章跳转slug获取优先级：`notification.article?.slug` → `notification.comment?.repliedArticle?.slug`
  3. 删除"该笔记已删除"的误判逻辑（只有文章和评论都为空时才提示已删除）

### 通知列表API结构更新 - 支持回复文章/评论及内容删除检测
- **API更新**: 从 api-dev.blog.lvlvko.top 拉取最新OpenAPI规范
  - `NotifiedComment` 新增 `repliedArticle` 和 `repliedComment` 字段
  - `repliedArticle`: 被回复的文章信息（回复文章评论时存在）
  - `repliedComment`: 被回复的评论信息（回复评论时存在）
  - **隐式逻辑**: 如果 `article` 或 `comment` 字段为空，表示对应内容已被删除
- **功能需求**:
  1. 支持显示"回复了你的评论"（有repliedComment）
  2. 支持显示"评论了你的笔记"（有repliedArticle但没有repliedComment）
  3. 被回复的内容以灰色引用样式显示
  4. 处理内容已删除的情况，显示"该评论已删除"或"该笔记已删除"
  5. 点击已删除内容时弹出提示而不是跳转
- **实现方案**:
  1. **重新生成API客户端**:
     - 使用 `npx openapi-ts` 从新的OpenAPI规范重新生成
     - 更新 `types.gen.ts` 中 `NotifiedComment` 类型定义
  2. **更新 `src/app/notifications/page.tsx`**:
     - 修改 `getNotificationTypeText` 函数，根据 `repliedComment`/`repliedArticle` 判断是"回复评论"还是"评论文章"
     - 修改通知项组件，显示被回复内容的灰色引用样式
     - 添加内容已删除的检测逻辑（`!notification.article` 或 `!notification.comment`）
     - 更新 `handleNotificationClick`，文章被删除时显示Toast提示
- **技术要点**:
  - 通知类型简化为4种：'like', 'save', 'comment', 'at'（移除了'reply'和'follow'）
  - 回复通知通过 `comment.repliedComment` 或 `comment.repliedArticle` 字段区分
  - 被回复内容显示为左侧带灰色边框的引用样式
- **文件位置**:
  - src/lib/api/types.gen.ts（重新生成）
  - src/app/notifications/page.tsx（更新通知列表渲染逻辑）

### 通知功能增强 - Tab分类筛选与未读数显示（API更新版）
- **API更新**: 从 api-dev.blog.lvlvko.top 拉取最新OpenAPI规范
  - 新增 `countNotifications` 端点 - 统计通知总数
  - `listNotifications` 新增 `category` 参数 - 支持服务端分类筛选
  - category可选值：`likeAndSave`（赞和收藏）、`commentAndAt`（评论和@）
- **功能需求**:
  1. 支持在Tab导航选取分类：全部、评论和@、赞和关注
  2. 在主页通知图标显示未读消息数
  3. 通过定期拉取countNotifications接口实现
- **实现方案**:
  1. **重新生成API客户端**:
     - 使用 `npx openapi-ts` 从新的OpenAPI规范重新生成
     - 导出新的 `countNotifications` 函数
  2. **更新 `src/lib/notification-context.tsx`**:
     - 使用 `countNotifications` 获取总通知数
     - 使用 `listNotifications` 获取未读通知数（status=unread, pageSize=1）
     - 优先使用countNotifications，失败时回退到listNotifications
  3. **更新 `src/app/notifications/page.tsx`**:
     - 使用 `category` 参数进行服务端分类筛选
     - Tab映射：commentAndAt（评论和@）、likeAndSave（赞和收藏）
     - "新增关注"仍使用前端过滤（API暂无此category）
  4. 其他文件保持不变（sidebar、mobile-nav、layout）
- **技术要点**:
  - 服务端分类筛选减少数据传输，提升性能
  - `countNotifications` 目前无查询参数，返回总通知数
  - 未读数仍通过 `listNotifications` + `status=unread` + `pageSize=1` 获取
- **使用的 API**:
  - `countNotifications`: 获取通知总数（新增）
  - `listNotifications`: 获取通知列表（支持category参数）
  - `ackNotification`: 标记单个通知为已读
- **文件位置**:
  - src/lib/api/（重新生成）
  - src/lib/api-config.ts（更新导出）
  - src/lib/notification-context.tsx（更新使用新API）
  - src/app/notifications/page.tsx（更新使用category参数）

### 小红书风格通知页面
- **功能需求**:
  1. 参照小红书样式实现通知功能
  2. 支持 Tab 切换：评论和@、赞和收藏、新增关注
  3. 显示通知列表，包括用户头像、操作类型、时间、相关内容
  4. 点击通知标记为已读并跳转到对应文章
  5. 未读通知显示红点标记
- **实现方案**:
  1. 创建 `src/app/notifications/page.tsx`:
     - 小红书风格的通知列表页面
     - 顶部 Tab 导航：全部、评论和@、赞和收藏、新增关注
     - 通知项包含：用户头像、用户名、操作类型（赞了/评论了/关注了）、时间
     - 评论/回复通知显示评论内容预览
     - 右侧显示文章封面图
     - 未读通知背景高亮显示，并有红点标记
     - 点击通知调用 `ackNotification` 标记为已读
     - 点击后跳转到首页并带上 `?article=slug` 参数打开文章详情
  2. 更新 `src/app/page.tsx`:
     - 添加 `ArticleSlugHandler` 组件监听 URL 参数
     - 从 `?article=slug` 参数获取文章 slug 并自动打开详情弹窗
     - 关闭弹窗时清除 URL 参数
  3. 更新 `src/components/mobile-nav.tsx`:
     - 启用通知按钮（移除 disabled）
     - 添加未登录检查，未登录时点击提示登录
  4. 更新 `src/components/ui/empty-state.tsx`:
     - 添加 "bell" 图标支持，用于通知页面空状态
- **使用的 API**:
  - `listNotifications`: 获取通知列表（支持分页和状态过滤）
  - `ackNotification`: 标记通知为已读
- **文件位置**:
  - src/app/notifications/page.tsx（新增）
  - src/app/page.tsx（更新）
  - src/components/mobile-nav.tsx（更新）
  - src/components/ui/empty-state.tsx（更新）

### 移动端适配
- **功能需求**:
  1. 主页移动端隐藏侧边栏，显示底部导航栏
  2. 底部导航栏：主页、商城(禁用)、发布(中间大按钮)、通知(禁用)、我
  3. 登录弹窗移动端适配，改为单列布局
  4. 未登录时自动从底部弹出登录抽屉（小红书风格）
- **实现方案**:
  1. 创建 `src/components/mobile-nav.tsx`:
     - 底部固定导航栏，只在移动端显示 (`md:hidden`)
     - 支持 iOS 安全区域 (`env(safe-area-inset-bottom)`)
     - 中间发布按钮使用红色背景和大尺寸
     - 禁用项点击显示 "敬请期待" Toast
     - 未登录时点击"我"和"发布"提示登录
  2. 更新 `src/app/page.tsx`:
     - 主内容区域添加 `pb-16 md:pb-0` 避免被底部导航遮挡
     - 导入并使用 `<MobileNav />` 组件
  3. 更新 `src/components/sidebar.tsx`:
     - 添加 `hidden md:flex` 类，移动端隐藏侧边栏
  4. 更新 `src/components/login-dialog.tsx`:
     - 使用响应式布局：`flex-col md:flex-row`
     - 移动端只显示 OAuth 登录部分，隐藏手机号登录区域
     - 桌面端保持左右分栏布局
  5. 创建 `src/components/mobile-login-drawer.tsx`:
     - 未登录时自动从底部弹出登录抽屉
     - 小红书风格的深色底部面板
     - 包含 Aris Logo、提示文字、GitHub/Google 登录按钮
     - 支持手动关闭（右上角 X 按钮）
     - 背景遮罩点击可关闭
     - **特殊处理**: OAuth2 回调时（URL 包含 code 和 state 参数）不弹出抽屉，避免干扰登录流程
- **文件位置**:
  - src/components/mobile-nav.tsx（新增）
  - src/components/mobile-login-drawer.tsx（新增）
  - src/app/page.tsx（更新）
  - src/components/sidebar.tsx（更新）
  - src/components/login-dialog.tsx（更新）

### 登录页面重设计（小红书风格弹窗）- 样式优化
- **功能需求**:
  1. 删除 `/login` 独立页面路由
  2. 使用小红书风格的登录卡片弹窗替代
  3. 侧边栏添加登录按钮（未登录时显示）
  4. 保持 GitHub 和 Google OAuth 登录功能
- **实现方案**:
  1. 使用 `npx shadcn@latest add dialog` 添加 Dialog 组件
  2. 创建 `src/components/login-dialog.tsx`：
     - **左右分栏布局**：左侧 OAuth 登录，右侧手机验证码（禁用）
     - 左侧：顶部蓝色标签"登录后推荐更懂你的笔记"、Aris Logo、两行 OAuth 按钮（GitHub/Google）
     - 右侧：手机号输入框（+86）、验证码输入框、获取验证码按钮、登录按钮（全部禁用）
     - 底部协议复选框和用户协议链接
  3. 更新 `src/components/sidebar.tsx`：
     - 宽度增加：lg 模式从 220px 增加到 260px
     - 按钮圆角改为 `rounded-full`（全圆角）
     - 未登录时显示登录卡片（带边框的白色卡片）
     - 登录卡片结构："我"标题 + 红色登录按钮 + "马上登录即可" + 好处列表
     - 修复：未登录时隐藏导航列表中的"我"按钮，只在登录卡片内显示
     - 修复：统一登录卡片与上方导航按钮的边距（mt-1 px-1）
     - 红色登录按钮改为 `rounded-full` 样式
  4. 删除 `src/app/login/page.tsx` 旧登录页面
  5. 更新其他引用 `/login` 的文件：
     - `src/app/publish/page.tsx`: 未登录时重定向到首页并提示
     - `src/app/profile/page.tsx`: 同上
     - `src/components/navigation.tsx`: 移除登录链接（侧边栏已包含）
     - `src/app/auth/callback/[provider]/page.tsx`: 错误时返回首页
- **文件位置**:
  - src/components/login-dialog.tsx（新增）
  - src/components/sidebar.tsx（更新）
  - src/app/login/page.tsx（删除）
  - src/app/publish/page.tsx（更新）
  - src/app/profile/page.tsx（更新）
  - src/components/navigation.tsx（更新）
  - src/app/auth/callback/[provider]/page.tsx（更新）

### Docker 容器化部署
- **功能需求**: 为 Next.js 应用创建轻量、高性能的 Docker 部署方案
- **实现方案**:
  1. 使用多阶段构建（3 阶段）：deps → builder → runner
  2. 基于 `node:22-alpine` 镜像，最终镜像仅约 100MB
  3. 启用 Next.js Standalone 模式（`output: 'standalone'`）
  4. 使用 BuildKit 缓存加速 npm 安装
  5. 使用非 root 用户（uid 1001）运行，增强安全性
  6. 使用 dumb-init 正确处理 PID 1 信号
  7. 创建 `docker-compose.yml` 便于快速部署
- **文件位置**: 
  - Dockerfile
  - docker-compose.yml
  - .dockerignore
  - next.config.ts（添加 standalone 配置）

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
  1. 使用openapi-ts从https://api-dev.blog.lvlvko.top/openapi.yaml拉取最新API模型
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
- **解决方案**: 在`config.ts`中添加`baseUrl: "https://api-dev.blog.lvlvko.top"`
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

### 2026-01-31 图片上传改为COS直传
- **功能需求**:
  1. 图片选择后不在组件内立即上传，而是发布时统一处理
  2. 图片统一处理成JPEG格式，压缩到2MB内
  3. 重命名为"atc-img-{md5前8位}.jpg"
  4. 获取临时密钥后直传到腾讯云COS
  5. 上传完成后调用createArticle创建文章
- **实现方案**:
  1. 安装官方 SDK: `npm install cos-js-sdk-v5`
  2. 创建 `src/lib/cos-upload.ts` 工具库，包含：
     - `compressImage()`: 将图片转为JPEG，逐步降低质量直到文件大小<2MB
     - `calculateMD5()`: 计算文件MD5（使用SHA-256取前8位）
     - `processAndUploadImage()`: 使用COS SDK上传图片
  3. 修改 `src/components/cover-upload.tsx`:
     - 移除原有的上传逻辑和状态管理
     - 改为只收集File对象，通过onChange传递给父组件
     - 保留拖拽排序、删除、预览功能
  4. 修改 `src/app/publish/page.tsx`:
     - formData.images改为`ImageItem[]`类型（包含file和preview）
     - 发布流程改为：
       a. 显示进度覆盖层，计算总进度 = 图片数 + 1（创建文章）
       b. 遍历所有图片，逐个调用processAndUploadImage上传
       c. 收集返回的文件名数组
       d. 调用createArticle创建文章
     - 使用Progress组件显示上传进度
  5. 修改 `src/components/rich-text-editor.tsx`:
     - 添加`disabled`属性支持，在发布时禁用编辑
- **Bug修复**:
  - **COS URL格式错误**: 缺少`-{appId}`后缀，已修正为`{bucket}-{appId}.cos.{region}.myqcloud.com`
  - **上传路径错误**: 从`articles/{filename}`改为`user-{userId}/image/{filename}`
  - **签名算法错误**: 从手动实现签名改为使用官方`cos-js-sdk-v5` SDK，避免签名验证失败
  - **Bucket名称格式错误**: SDK要求bucket名称格式为`{bucketName}-{appId}`，已修正
- **文件位置**:
  - src/lib/cos-upload.ts
  - src/components/cover-upload.tsx
  - src/app/publish/page.tsx
  - src/components/rich-text-editor.tsx
- **参考文档**: 
  - https://cloud.tencent.com/document/product/436/14048
  - https://github.com/tencentyun/cos-js-sdk-v5

### OAuth 回调页面改为主页弹窗
- **功能需求**: OAuth 回调时不跳转新页面，而是在主页右上角显示处理弹窗
- **实现方案**:
  1. 创建 `OAuthCallbackHandler` 组件 (`src/components/oauth-callback-handler.tsx`):
     - 固定定位右上角弹窗 (`fixed top-4 right-4`)
     - 三种状态视觉反馈：
       - **加载中**: 旋转图标 + "正在通过 XXX 登录"
       - **成功**: 绿色勾选 + "登录成功！"
       - **失败**: 红色错误 + "登录失败"
     - 支持自定义完成回调
  2. 更新回调路由 (`src/app/auth/callback/[provider]/page.tsx`):
     - 直接重定向到首页，保留 code 和 state 参数
  3. 更新主页 (`src/app/page.tsx`):
     - 检测 URL 中的 OAuth 回调参数 (pathname 或 query string)
     - 使用 `OAuthCallbackWrapper` 组件 + Suspense 包裹处理逻辑
     - 自动显示右上角弹窗处理登录
     - 处理完成后清除 URL 参数并关闭弹窗
- **技术要点**:
  - 使用 `useSearchParams()` 必须在 Suspense 边界内，避免构建错误
  - 使用 `window.history.replaceState()` 清除 URL 参数，避免刷新重复处理
  - 支持两种回调路径：
    - `/auth/callback/github?code=xxx&state=xxx` (直接)
    - `/?code=xxx&state=xxx` (重定向后)
- **文件位置**:
  - src/components/oauth-callback-handler.tsx
  - src/app/auth/callback/[provider]/page.tsx
  - src/app/page.tsx

### 2026-02-12 评论发送后页面不刷新
- **现象**: 发送评论成功后，评论列表没有自动刷新，需要手动刷新页面才能看到新评论
- **原因**: `refreshComments` 函数只更新了 `commentTotal` 状态，但评论列表数据是在 `CommentSection` 组件内部通过 `useComments` hook 管理的，没有触发重新获取
- **解决方案**: 
  1. 在 `article-detail-modal.tsx` 中添加 `refreshKey` state
  2. 修改 `refreshComments` 函数为递增 `refreshKey`
  3. 在 `CommentSection` 组件中添加 `refreshKey` prop
  4. 在 `CommentSection` 中使用 `useEffect` 监听 `refreshKey` 变化，触发重新获取评论
- **文件位置**: 
  - src/components/article-detail-modal.tsx
  - src/components/comment-section.tsx

### 2026-02-01 OAuth 回调弹窗未显示
- **现象**: OAuth 授权后跳转到首页，但没有显示回调处理弹窗
- **原因**: 
  1. 回调路由没有传递 `provider` 参数给首页
  2. 主页检测逻辑过于复杂，没有正确识别回调参数
- **解决方案**: 
  1. 更新回调路由，在重定向 URL 中包含 `provider` 参数
  2. 简化主页检测逻辑，直接使用 `window.location.search` 获取参数
  3. 添加 console.log 便于调试
- **文件位置**: 
  - src/app/auth/callback/[provider]/page.tsx
  - src/app/page.tsx

### 文章详情底部评论输入框（小红书风格）- 完整功能版
- **功能需求**: 参照小红书评论输入框交互效果
  1. 默认状态：底部显示窄输入框 + 点赞、收藏、评论、分享按钮（水平排列）
  2. 点击输入框：展开为宽输入框，显示用户头像，隐藏原有按钮
  3. 展开时显示工具栏（@、表情、图片按钮）和发送/取消按钮
  4. 点击发送调用后端API，成功后刷新评论列表，Toast只提示成功不显示内容
  5. 回复功能：点击评论回复按钮展开输入框，显示回复目标用户名和内容预览
- **实现方案**:
  1. 更新 `src/components/article-detail-modal.tsx`:
     - 添加状态管理：`isInputExpanded`、`commentText`、`replyTarget`（回复目标）、`submitting`
     - 添加 `refreshComments` 函数用于刷新评论列表
     - 添加 `handleSubmitComment` 函数调用 `createComment` API
     - 导入 `createComment` 和 `listComments` API
     - 底部操作栏添加回复目标显示区域（在输入框上方显示"回复 xxx"和内容预览）
     - 输入框 placeholder 根据回复目标动态变化
     - 发送按钮添加 loading 状态显示
     - 取消按钮同时清除 `replyTarget`
     - 使用 `cn()` 配合过渡动画类名实现平滑切换
  2. 更新 `src/components/comment-section.tsx`:
     - 删除底部输入框（与 article-detail-modal 的输入框重复）
     - 只保留评论列表展示功能
     - 添加 `onReply` prop 支持回复回调
- **文件位置**: 
  - src/components/article-detail-modal.tsx
  - src/components/comment-section.tsx
