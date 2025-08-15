'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Article } from '@/types/dto';
import { 
  CreateArticleSchema, 
  UpdateArticleSchema, 
  CreateArticleFormData, 
  UpdateArticleFormData 
} from '@/types/schemas/article.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: CreateArticleFormData | UpdateArticleFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

const TagInput: React.FC<{
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}> = ({ tags, onTagsChange }) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-2">
      <Label>标签</Label>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <div className="flex items-center gap-1">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入标签..."
            className="border-none p-0 h-6 w-24 focus-visible:ring-0"
          />
          {inputValue && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAddTag}
              className="h-6 w-6 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ArticleForm: React.FC<ArticleFormProps> = ({
  article,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create'
}) => {
  const isEdit = mode === 'edit';
  const schema = isEdit ? UpdateArticleSchema : CreateArticleSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<CreateArticleFormData | UpdateArticleFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      slug: '',
      categoryID: undefined,
      tags: [],
      content: '',
    }
  });

  const watchedTags = watch('tags') || [];

  // 初始化表单数据
  useEffect(() => {
    if (article && isEdit) {
      reset({
        title: article.title,
        slug: article.slug,
        categoryID: undefined, // 需要从API获取分类信息
        tags: article.tags || [],
        content: '', // 需要从版本API获取内容
      });
    }
  }, [article, isEdit, reset]);

  // 自动生成slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!isEdit) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
    }
  };

  const handleTagsChange = (tags: string[]) => {
    setValue('tags', tags);
  };

  const handleFormSubmit = (data: CreateArticleFormData | UpdateArticleFormData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? '编辑文章' : '创建文章'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              {...register('title')}
              onChange={handleTitleChange}
              placeholder="输入文章标题..."
              className={cn(errors.title && "border-destructive")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="文章URL标识..."
              className={cn(errors.slug && "border-destructive")}
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              URL友好的标识符，只能包含小写字母、数字和连字符
            </p>
          </div>

          {/* 分类 */}
          <div className="space-y-2">
            <Label htmlFor="categoryID">分类 *</Label>
            <select
              id="categoryID"
              {...register('categoryID', { valueAsNumber: true })}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                errors.categoryID && "border-destructive"
              )}
            >
              <option value="">选择分类</option>
              {/* 这里需要从API获取分类列表 */}
              <option value={1}>技术</option>
              <option value={2}>生活</option>
              <option value={3}>随笔</option>
            </select>
            {errors.categoryID && (
              <p className="text-sm text-destructive">{errors.categoryID.message}</p>
            )}
          </div>

          {/* 标签 */}
          <TagInput
            tags={watchedTags}
            onTagsChange={handleTagsChange}
          />

          {/* 内容 */}
          <div className="space-y-2">
            <Label htmlFor="content">内容 *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="输入文章内容..."
              className={cn("min-h-[400px]", errors.content && "border-destructive")}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-end gap-4 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                取消
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? '保存中...' : (isEdit ? '更新' : '创建')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};