'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { ArticleService } from '@/services/article.service';
import { categoryService } from '@/services/category.service';
import { Article, Category } from '@/types/api/article';
import { ArrowLeft, Save, Eye, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';

const updateArticleSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  slug: z.string().min(1, '别名不能为空').max(100, '别名不能超过100个字符').regex(/^[a-z0-9-]+$/, '别名只能包含小写字母、数字和连字符'),
  categoryID: z.number().min(1, '请选择分类'),
  tags: z.array(z.string()).min(1, '至少需要一个标签'),
});

type UpdateArticleForm = z.infer<typeof updateArticleSchema>;

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleID = parseInt(params.id as string);

  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateArticleForm>({
    resolver: zodResolver(updateArticleSchema),
  });

  const watchedTags = watch('tags');

  useEffect(() => {
    if (articleID) {
      loadArticle();
      loadCategories();
    }
  }, [articleID]);

  const loadArticle = async () => {
    try {
      const articleResponse = await ArticleService.getArticle(articleID);
      const articleData = articleResponse.article;
      setArticle(articleData);

      // 设置表单数据
      reset({
        title: articleData.title,
        slug: articleData.slug,
        categoryID: articleData.categoryID,
        tags: articleData.tags,
      });

      // 加载最新版本的内容
      const versionResponse = await ArticleService.getLatestArticleVersion(articleID);
      setContent(versionResponse.articleVersion.content);
    } catch (error) {
      console.error('Failed to load article:', error);
      toast.error('加载文章失败');
      router.push('/articles');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategoryList();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('加载分类失败');
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !watchedTags.includes(tag)) {
      setValue('tags', [...watchedTags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setValue('slug', slug);
  };

  const onSubmit = async (data: UpdateArticleForm) => {
    if (!content.trim()) {
      toast.error('文章内容不能为空');
      return;
    }

    setSaving(true);
    try {
      // 更新文章基本信息
      await ArticleService.updateArticle(articleID, {
        title: data.title,
        slug: data.slug,
        categoryID: data.categoryID,
        tags: data.tags,
      });

      // 创建新的文章版本
      await ArticleService.createArticleVersion(articleID, {
        content: content,
      });

      toast.success('文章更新成功');
      router.push('/articles');
    } catch (error) {
      console.error('Failed to update article:', error);
      toast.error('更新文章失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">文章不存在</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div>
          <h1 className="text-3xl font-bold">编辑文章</h1>
          <p className="text-muted-foreground">编辑文章内容和信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧表单 */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>修改文章的基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="输入文章标题"
                    onChange={(e) => {
                      const title = e.target.value;
                      if (!watch('slug')) {
                        generateSlug(title);
                      }
                    }}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">别名</Label>
                  <Input
                    id="slug"
                    {...register('slug')}
                    placeholder="输入文章别名"
                  />
                  {errors.slug && (
                    <p className="text-sm text-red-600 mt-1">{errors.slug.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">分类</Label>
                  <Select onValueChange={(value) => setValue('categoryID', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.categoryID} value={category.categoryID.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryID && (
                    <p className="text-sm text-red-600 mt-1">{errors.categoryID.message}</p>
                  )}
                </div>

                <div>
                  <Label>标签</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="输入标签后按回车添加"
                      />
                      <Button type="button" onClick={handleAddTag} variant="outline">
                        添加
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {watchedTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {errors.tags && (
                      <p className="text-sm text-red-600">{errors.tags.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>文章状态</Label>
                  <div className="mt-2">
                    <Badge variant={article.status === 'publish' ? 'default' : 'secondary'}>
                      {article.status === 'publish' ? '已发布' : '草稿'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button type="submit" className="w-full" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : '保存更改'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? '编辑模式' : '预览模式'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/articles/${articleID}`)}
                >
                  查看文章
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧编辑器 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>文章内容</CardTitle>
                <CardDescription>编辑文章内容</CardDescription>
              </CardHeader>
              <CardContent>
                <TipTapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="开始编写你的文章..."
                  editable={!previewMode}
                  className="min-h-[600px]"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}