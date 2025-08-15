'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Share2, Heart, MessageCircle, Eye, Tag, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArticleDetail } from '@/components/articles/ArticleDetail';
import { useArticle } from '@/hooks/useArticles';
import { Article } from '@/types/dto';
import { toast } from 'sonner';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = parseInt(params.id as string);

  const {
    article,
    latestVersion,
    isLoadingArticle,
    isLoadingVersion,
    toggleLike,
    logView,
    isTogglingLike,
  } = useArticle(articleId);

  // 记录阅读进度
  useEffect(() => {
    if (article) {
      // 模拟阅读进度，实际应用中应该根据用户滚动位置计算
      logView({ articleId, progress: 50 });
    }
  }, [article, articleId, logView]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = (article: Article) => {
    router.push(`/articles/edit/${article.articleID}`);
  };

  const handleLike = (articleId: number, undo?: boolean) => {
    toggleLike({ articleId, undo });
  };

  const handleShare = (article: Article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('链接已复制到剪贴板');
    }
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
          <p className="text-muted-foreground mb-6">您访问的文章可能已被删除或不存在</p>
          <Button onClick={handleBack}>返回</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回
        </Button>
      </div>

      {/* 文章详情 */}
      <ArticleDetail
        article={article}
        latestVersion={latestVersion}
        isLoading={isLoadingArticle || isLoadingVersion}
        onEdit={handleEdit}
        onLike={handleLike}
        onShare={handleShare}
      />

      {/* 相关文章推荐 */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>相关文章</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">这里可以显示相关文章推荐</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}