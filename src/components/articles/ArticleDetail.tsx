'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar, 
  User, 
  Tag, 
  Edit, 
  Share2,
  BookOpen,
  Clock,
  ThumbsUp
} from 'lucide-react';
import { Article, ArticleVersion } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ArticleDetailProps {
  article?: Article;
  latestVersion?: ArticleVersion;
  isLoading?: boolean;
  onEdit?: (article: Article) => void;
  onLike?: (articleId: number, undo?: boolean) => void;
  onShare?: (article: Article) => void;
  className?: string;
}

const ArticleStats: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <div className="flex items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4" />
        <span>{article.views} 次阅读</span>
      </div>
      <div className="flex items-center gap-1">
        <Heart className="w-4 h-4" />
        <span>{article.likes} 次点赞</span>
      </div>
      <div className="flex items-center gap-1">
        <MessageCircle className="w-4 h-4" />
        <span>{article.comments} 条评论</span>
      </div>
    </div>
  );
};

const ArticleMeta: React.FC<{ article: Article }> = ({ article }) => {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        <span>创建于 {format(new Date(article.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}</span>
      </div>
      {article.publishedAt && (
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>发布于 {format(new Date(article.publishedAt), 'yyyy年MM月dd日', { locale: zhCN })}</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        <span>更新于 {format(new Date(article.updatedAt), 'yyyy年MM月dd日', { locale: zhCN })}</span>
      </div>
    </div>
  );
};

const ArticleTags: React.FC<{ tags: string[] }> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Tag className="w-4 h-4 text-muted-foreground" />
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge key={index} variant="outline" className="text-sm">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const ArticleContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="prose prose-gray max-w-none">
      <div 
        className="whitespace-pre-wrap leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

const ArticleActions: React.FC<{
  article: Article;
  onEdit?: (article: Article) => void;
  onLike?: (articleId: number, undo?: boolean) => void;
  onShare?: (article: Article) => void;
}> = ({ article, onEdit, onLike, onShare }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onLike?.(article.articleID, !newLikedState);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.title,
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
    }
    onShare?.(article);
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isLiked ? "default" : "outline"}
        size="sm"
        onClick={handleLike}
        className="flex items-center gap-2"
      >
        <ThumbsUp className={cn("w-4 h-4", isLiked && "fill-current")} />
        {isLiked ? '已点赞' : '点赞'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        分享
      </Button>
      
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(article)}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          编辑
        </Button>
      )}
    </div>
  );
};

const ArticleDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  latestVersion,
  isLoading = false,
  onEdit,
  onLike,
  onShare,
  className,
}) => {
  if (isLoading || !article) {
    return <ArticleDetailSkeleton />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 文章头部信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold leading-tight">
            {article.title}
          </CardTitle>
          
          <ArticleMeta article={article} />
          
          <ArticleStats article={article} />
          
          <ArticleTags tags={article.tags} />
        </CardHeader>
        
        <CardContent>
          <ArticleActions
            article={article}
            onEdit={onEdit}
            onLike={onLike}
            onShare={onShare}
          />
        </CardContent>
      </Card>

      {/* 文章内容 */}
      {latestVersion && (
        <Card>
          <CardContent className="pt-6">
            <ArticleContent content={latestVersion.content} />
          </CardContent>
        </Card>
      )}

      {/* 版本信息 */}
      {latestVersion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">版本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>当前版本: v{latestVersion.version}</span>
              <span>更新时间: {format(new Date(latestVersion.updatedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};