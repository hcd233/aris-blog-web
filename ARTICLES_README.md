# 文章管理系统

基于Swagger API实现的完整文章管理功能，包含创建、编辑、删除、版本管理、统计分析等功能。

## 功能特性

### 🚀 核心功能
- **文章管理**: 创建、编辑、删除文章
- **状态管理**: 草稿/发布状态切换
- **版本控制**: 文章版本历史管理
- **内容编辑**: 富文本编辑器支持
- **标签系统**: 灵活的标签管理

### 📊 数据分析
- **统计面板**: 文章数据可视化
- **性能指标**: 阅读量、点赞数、评论数统计
- **趋势分析**: 数据变化趋势
- **热门文章**: 最受欢迎文章排行

### 🎨 用户体验
- **响应式设计**: 支持桌面和移动端
- **实时预览**: 编辑时实时预览效果
- **搜索筛选**: 多维度搜索和筛选
- **批量操作**: 支持批量管理操作

## 技术架构

### 前端技术栈
- **Next.js 15**: React框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Radix UI**: 组件库
- **React Hook Form**: 表单管理
- **Zod**: 数据验证
- **React Query**: 数据获取和缓存

### 核心组件

#### 1. 数据层 (Data Layer)
```
src/
├── types/
│   ├── dto/           # 数据传输对象
│   └── schemas/       # Zod验证模式
├── services/          # API服务层
└── hooks/            # 自定义Hooks
```

#### 2. 组件层 (Component Layer)
```
src/components/articles/
├── ArticleList.tsx      # 文章列表组件
├── ArticleForm.tsx      # 文章表单组件
├── ArticleDetail.tsx    # 文章详情组件
├── ArticleVersions.tsx  # 版本管理组件
└── ArticleStats.tsx     # 统计分析组件
```

#### 3. 页面层 (Page Layer)
```
src/app/articles/
├── page.tsx              # 文章管理主页
├── [id]/page.tsx         # 文章详情页
└── edit/[id]/page.tsx    # 文章编辑页
```

## API接口

基于Swagger规范，主要包含以下接口：

### 文章管理
- `POST /v1/article` - 创建文章
- `GET /v1/article/{id}` - 获取文章详情
- `PATCH /v1/article/{id}` - 更新文章
- `DELETE /v1/article/{id}` - 删除文章
- `PUT /v1/article/{id}/status` - 更新文章状态

### 文章列表
- `GET /v1/article/list` - 获取文章列表
- `GET /v1/category/{id}/articles` - 获取分类文章

### 版本管理
- `POST /v1/article/{id}/version` - 创建版本
- `GET /v1/article/{id}/version/latest` - 获取最新版本
- `GET /v1/article/{id}/version/list` - 获取版本列表

### 用户交互
- `POST /v1/user/like/article` - 点赞文章
- `POST /v1/user/view/article` - 记录阅读

## 使用指南

### 1. 创建文章
1. 点击"创建文章"按钮
2. 填写文章标题、Slug、分类、标签
3. 编写文章内容
4. 点击"创建"保存

### 2. 编辑文章
1. 在文章列表中找到要编辑的文章
2. 点击"编辑"按钮
3. 修改文章内容
4. 可以切换到"预览模式"查看效果
5. 点击"更新"保存修改

### 3. 管理文章状态
- **草稿**: 文章未发布，仅作者可见
- **已发布**: 文章已发布，所有用户可见

### 4. 版本管理
1. 在文章详情页查看版本历史
2. 可以查看、比较、恢复历史版本
3. 每次编辑都会创建新版本

### 5. 数据统计
- 查看文章总数、阅读量、点赞数等统计
- 分析文章表现趋势
- 识别最受欢迎的文章

## 开发指南

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循TypeScript严格模式

## 自定义配置

### 1. API配置
在 `src/config/` 目录下配置API基础URL和认证信息。

### 2. 主题配置
在 `tailwind.config.ts` 中自定义主题颜色和样式。

### 3. 组件配置
在 `components.json` 中配置Radix UI组件。

## 部署说明

### 1. 环境变量
```env
NEXT_PUBLIC_API_BASE_URL=your_api_base_url
NEXT_PUBLIC_API_KEY=your_api_key
```

### 2. 构建部署
```bash
npm run build
npm start
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。