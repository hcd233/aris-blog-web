# 文章管理功能

基于swagger.yaml中的API文档实现完整的文章管理系统，使用TipTap作为富文本编辑器。

## 功能特性

### 1. 文章列表管理
- 显示所有文章的列表
- 支持按分类、状态筛选
- 支持搜索文章标题和别名
- 分页显示
- 快速操作：查看、编辑、删除、状态切换

### 2. 新建文章
- 使用TipTap富文本编辑器
- 支持标题、别名、分类、标签设置
- 实时预览功能
- 表单验证

### 3. 编辑文章
- 加载现有文章内容
- 支持修改所有文章信息
- 版本管理（每次编辑创建新版本）
- 预览模式

### 4. 文章详情
- 完整显示文章内容
- 支持点赞、评论功能
- 显示文章统计信息（浏览量、点赞数、评论数）
- 分享功能

### 5. TipTap编辑器功能
- 富文本编辑
- 支持标题、列表、引用、代码块
- 链接和图片插入
- 文本高亮
- 撤销/重做功能

## 技术栈

- **前端框架**: Next.js 15 + React 19
- **UI组件**: Radix UI + Tailwind CSS
- **富文本编辑器**: TipTap
- **表单处理**: React Hook Form + Zod
- **状态管理**: React Hooks
- **HTTP客户端**: Axios
- **类型检查**: TypeScript

## 文件结构

```
src/
├── app/
│   └── articles/
│       ├── page.tsx                    # 文章列表页面
│       ├── new/
│       │   └── page.tsx                # 新建文章页面
│       └── [id]/
│           ├── page.tsx                # 文章详情页面
│           └── edit/
│               └── page.tsx            # 编辑文章页面
├── components/
│   ├── Navigation.tsx                  # 导航组件
│   └── editor/
│       └── TipTapEditor.tsx            # TipTap编辑器组件
├── services/
│   └── article.service.ts              # 文章API服务
└── types/
    └── api/
        └── article.ts                  # 文章相关类型定义
```

## API接口

基于swagger.yaml中的以下接口：

### 文章管理
- `POST /v1/article` - 创建文章
- `GET /v1/article/{articleID}` - 获取文章信息
- `PATCH /v1/article/{articleID}` - 更新文章
- `DELETE /v1/article/{articleID}` - 删除文章
- `PUT /v1/article/{articleID}/status` - 更新文章状态

### 文章版本管理
- `POST /v1/article/{articleID}/version` - 创建文章版本
- `GET /v1/article/{articleID}/version/latest` - 获取最新版本
- `GET /v1/article/{articleID}/versions` - 获取版本列表

### 文章列表
- `GET /v1/articles` - 获取文章列表
- `GET /v1/user/{userID}/articles` - 获取用户文章

### 评论功能
- `POST /v1/article/comment` - 创建评论
- `GET /v1/article/{articleID}/comments` - 获取评论列表

### 互动功能
- `POST /v1/article/like` - 点赞文章
- `POST /v1/article/view` - 记录浏览

## 使用方法

1. **访问文章管理**
   - 在导航栏点击"文章管理"
   - 或直接访问 `/articles`

2. **新建文章**
   - 点击"新建文章"按钮
   - 填写文章基本信息
   - 使用TipTap编辑器编写内容
   - 点击"保存草稿"

3. **编辑文章**
   - 在文章列表中点击"编辑"
   - 修改文章信息和内容
   - 保存更改

4. **管理文章状态**
   - 在文章列表中快速切换发布/草稿状态
   - 或通过编辑页面修改

5. **查看文章**
   - 点击"查看"按钮查看文章详情
   - 支持点赞和评论功能

## 注意事项

1. **认证要求**: 所有操作需要用户登录
2. **权限控制**: 只能管理自己的文章
3. **内容限制**: 文章内容最少100字符，最多20000字符
4. **版本管理**: 每次编辑都会创建新版本
5. **实时保存**: 建议定期保存，避免内容丢失

## 开发说明

### 添加新的编辑器功能
在 `TipTapEditor.tsx` 中添加新的TipTap扩展：

```typescript
import NewExtension from '@tiptap/extension-new-extension';

// 在extensions数组中添加
extensions: [
  StarterKit,
  NewExtension.configure({
    // 配置选项
  }),
  // ...其他扩展
]
```

### 自定义样式
TipTap编辑器的样式可以通过CSS类名自定义：

```css
.ProseMirror {
  /* 编辑器样式 */
}

.ProseMirror h1 {
  /* 标题样式 */
}
```

### 扩展API功能
在 `article.service.ts` 中添加新的API方法：

```typescript
static async newMethod(): Promise<ResponseType> {
  const response = await apiClient.get('/v1/new-endpoint');
  return response.data.data;
}
```