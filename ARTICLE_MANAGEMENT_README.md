# 文章管理系统

基于 swagger.yaml API 文档完成的文章管理功能，使用 TipTap 作为富文本编辑器。

## 📦 已实现的功能

### 1. 核心功能模块
- ✅ **文章 CRUD 操作**：创建、读取、更新、删除文章
- ✅ **文章版本管理**：支持版本历史、版本对比、版本恢复
- ✅ **文章状态管理**：草稿/发布状态切换
- ✅ **富文本编辑器**：基于 TipTap 的现代化编辑体验
- ✅ **图片上传功能**：编辑器内图片上传与管理
- ✅ **标签系统**：文章标签的创建和管理
- ✅ **分类系统**：与现有分类系统的集成

### 2. API 服务层
- ✅ **Article Service** (`/services/article.service.ts`)
  - 文章 CRUD 操作
  - 版本管理接口
  - 点赞、浏览记录
  - 工具方法（slug 生成、数据验证等）

- ✅ **Image Service** (`/services/image.service.ts`)
  - 图片上传与验证
  - 图片压缩与优化
  - 预览功能

### 3. 类型定义
- ✅ **完整的 TypeScript 类型定义** (`/types/api/article.types.ts`)
  - 基于 swagger.yaml 的精确类型映射
  - 表单数据类型
  - 状态管理类型
  - 编辑器专用类型

### 4. 组件系统

#### 核心组件
- ✅ **TipTapEditor** (`/components/editor/TipTapEditor.tsx`)
  - 现代化富文本编辑器
  - 完整工具栏：格式化、标题、列表、对齐、媒体等
  - 图片拖拽上传
  - 表格、代码块、任务列表支持
  - 深色模式适配

- ✅ **ArticleForm** (`/components/article/ArticleForm.tsx`)
  - 文章创建/编辑表单
  - 实时 slug 生成
  - 标签选择与创建
  - 分类选择
  - 表单验证（基于 Zod）
  - 自动保存草稿/发布

- ✅ **ArticleList** (`/components/article/ArticleList.tsx`)
  - 文章列表展示
  - 搜索与筛选
  - 状态管理（发布/草稿切换）
  - 批量操作
  - 分页功能

- ✅ **ArticleVersionHistory** (`/components/article/ArticleVersionHistory.tsx`)
  - 版本历史查看
  - 版本对比功能
  - 版本恢复
  - 差异统计

### 5. 页面路由
- ✅ `/articles` - 文章列表页
- ✅ `/articles/new` - 创建新文章
- ✅ `/articles/[id]` - 文章详情页
- ✅ `/articles/[id]/edit` - 编辑文章
- ✅ `/articles/[id]/history` - 版本历史

### 6. UI 集成
- ✅ **导航集成**：主页面添加文章管理入口
- ✅ **主题适配**：支持深色/浅色模式
- ✅ **响应式设计**：移动端友好
- ✅ **无障碍访问**：键盘导航支持

## 🛠️ 技术栈

### 前端技术
- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **TipTap** - 富文本编辑器
- **Tailwind CSS** - 样式框架
- **Radix UI** - 无障碍组件库
- **React Hook Form** - 表单管理
- **Zod** - 数据验证
- **date-fns** - 日期处理
- **Sonner** - 消息提示

### 状态管理
- **React Hooks** - 本地状态管理
- **LocalStorage** - 用户认证令牌
- **API Client** - 统一请求处理

## 📝 API 接口

### 文章管理接口
```typescript
// 文章 CRUD
POST   /v1/article                    // 创建文章
GET    /v1/article/{id}               // 获取文章
PATCH  /v1/article/{id}               // 更新文章
DELETE /v1/article/{id}               // 删除文章
PUT    /v1/article/{id}/status        // 更新状态
GET    /v1/article/list               // 文章列表

// 版本管理
POST   /v1/article/{id}/version       // 创建版本
GET    /v1/article/{id}/version/latest // 最新版本
GET    /v1/article/{id}/version/list  // 版本列表
GET    /v1/article/{id}/version/v{version} // 特定版本

// 交互功能
POST   /v1/operation/like/article     // 点赞文章
POST   /v1/operation/view/article     // 记录浏览

// 图片管理
POST   /v1/asset/object/image         // 上传图片
GET    /v1/asset/object/image/{name}  // 获取图片
DELETE /v1/asset/object/image/{name}  // 删除图片
```

## 🚀 使用指南

### 创建文章
1. 从主页面点击"文章管理"
2. 点击"创建文章"按钮
3. 填写标题、选择分类、添加标签
4. 使用富文本编辑器编写内容
5. 保存草稿或直接发布

### 编辑文章
1. 在文章列表中点击"编辑"
2. 修改文章内容
3. 系统自动创建新版本
4. 保存更改

### 版本管理
1. 在文章详情页点击"版本历史"
2. 查看所有版本变更
3. 对比不同版本
4. 恢复到历史版本

### 图片上传
1. 在编辑器中点击图片按钮
2. 选择本地图片文件
3. 系统自动上传并插入
4. 支持拖拽上传

## 🔧 配置说明

### 环境变量
```env
# API 配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:8170
NEXT_PUBLIC_API_TIMEOUT=30000
```

### 编辑器配置
- 支持的图片格式：JPEG, PNG, GIF, WebP
- 图片大小限制：10MB
- 内容长度限制：100-20000 字符
- 自动保存间隔：30秒

## 📱 界面预览

### 文章列表
- 搜索筛选功能
- 状态标识（草稿/已发布）
- 统计信息（浏览量、点赞数、评论数）
- 快速操作按钮

### 编辑器界面
- 现代化工具栏
- 实时预览
- 图片拖拽上传
- 自动保存提示

### 版本历史
- 版本时间线
- 并排对比视图
- 差异统计
- 一键恢复

## 🎯 特色功能

1. **智能 Slug 生成**：自动从标题生成 URL 友好的别名
2. **实时保存**：编辑过程中自动保存草稿
3. **版本控制**：Git 风格的版本管理
4. **图片优化**：客户端图片压缩
5. **响应式设计**：完美适配各种设备
6. **无障碍访问**：符合 WCAG 标准
7. **深色模式**：护眼的暗色主题

## 🔮 后续规划

- [ ] **评论系统**：文章评论功能
- [ ] **标签云**：标签可视化展示
- [ ] **搜索优化**：全文搜索功能
- [ ] **导出功能**：Markdown/PDF 导出
- [ ] **协作编辑**：多人实时协作
- [ ] **草稿分享**：草稿预览链接
- [ ] **SEO 优化**：meta 标签管理
- [ ] **统计分析**：阅读统计面板

## 🐛 已知问题

1. 图片上传响应格式待确认（后端返回空响应）
2. 评论功能界面已准备，待后端接口
3. 搜索功能需要后端支持模糊匹配

---

> 这个文章管理系统已经完全实现了 swagger.yaml 中定义的所有文章相关 API，提供了现代化的编辑体验和完整的管理功能。