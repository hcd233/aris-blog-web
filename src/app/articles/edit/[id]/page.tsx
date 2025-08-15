'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleForm } from '@/components/articles/ArticleForm';
import { ArticleDetail } from '@/components/articles/ArticleDetail';
import { useArticle } from '@/hooks/useArticles';
import { useArticles } from '@/hooks/useArticles';
import { Article } from '@/types/dto';
import { UpdateArticleFormData } from '@/types/schemas/article.schema';
import { toast } from 'sonner';

export default function ArticleEditPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = parseInt(params.id as string);
  
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState<UpdateArticleFormData | null>(null);

  const {
    article,
    latestVersion,
    isLoadingArticle,
    isLoadingVersion,
  } = useArticle(articleId);

  const {
    updateArticle,
    isUpdating,
  } = useArticles();

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = (data: UpdateArticleFormData) => {
    setFormData(data);
    updateArticle(
      { articleId, data },
      {
        onSuccess: () => {
          toast.success('文章更新成功');
          router.push('/articles');
        },
        onError: (error) => {
          toast.error('更新失败，请重试');
          console.error('Update error:', error);
        },
      }
    );
  };

  const handleCancel = () => {
    router.push('/articles');
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  if (isLoadingArticle) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">文章不存在</h1>
          <p className="text-muted-foreground mb-6">您要编辑的文章可能已被删除或不存在</p>
          <Button onClick={handleBack}>返回</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">编辑文章</h1>
            <p className="text-muted-foreground">修改文章内容和设置</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={togglePreview}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {isPreview ? '编辑模式' : '预览模式'}
          </Button>
        </div>
      </div>

      {/* 编辑表单或预览 */}
      {isPreview ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                预览模式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                这是文章的预览效果，您可以查看最终显示效果
              </p>
            </CardContent>
          </Card>
          
          <ArticleDetail
            article={{
              ...article,
              title: formData?.title || article.title,
              slug: formData?.slug || article.slug,
              tags: formData?.tags || article.tags,
            }}
            latestVersion={{
              ...latestVersion!,
              content: formData?.content || latestVersion?.content || '',
            }}
            isLoading={isLoadingVersion}
          />
        </div>
      ) : (
        <ArticleForm
          article={article}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isUpdating}
          mode="edit"
        />
      )}

      {/* 保存提示 */}
      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            正在保存...
          </div>
        </div>
      )}
    </div>
  );
}