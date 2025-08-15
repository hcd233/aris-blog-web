import { z } from 'zod';

// 文章状态枚举
export const ArticleStatusSchema = z.enum(['draft', 'publish']);

// 创建文章表单模式
export const CreateArticleSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  slug: z.string().min(1, 'Slug不能为空').max(100, 'Slug不能超过100个字符')
    .regex(/^[a-z0-9-]+$/, 'Slug只能包含小写字母、数字和连字符'),
  categoryID: z.number().min(1, '请选择分类'),
  tags: z.array(z.string()).optional(),
  content: z.string().min(1, '内容不能为空'),
});

// 更新文章表单模式
export const UpdateArticleSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符').optional(),
  slug: z.string().min(1, 'Slug不能为空').max(100, 'Slug不能超过100个字符')
    .regex(/^[a-z0-9-]+$/, 'Slug只能包含小写字母、数字和连字符').optional(),
  categoryID: z.number().min(1, '请选择分类').optional(),
  tags: z.array(z.string()).optional(),
  content: z.string().min(1, '内容不能为空').optional(),
});

// 更新文章状态表单模式
export const UpdateArticleStatusSchema = z.object({
  status: ArticleStatusSchema,
});

// 文章列表查询参数模式
export const ArticleListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  categoryID: z.number().optional(),
  tagID: z.number().optional(),
  status: ArticleStatusSchema.optional(),
  userID: z.number().optional(),
  keyword: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'publishedAt', 'views', 'likes']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 类型导出
export type CreateArticleFormData = z.infer<typeof CreateArticleSchema>;
export type UpdateArticleFormData = z.infer<typeof UpdateArticleSchema>;
export type UpdateArticleStatusFormData = z.infer<typeof UpdateArticleStatusSchema>;
export type ArticleListQueryParams = z.infer<typeof ArticleListQuerySchema>;
export type ArticleStatus = z.infer<typeof ArticleStatusSchema>;