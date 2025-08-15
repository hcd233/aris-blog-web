'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  EyeOff,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { Article, ArticleStatus } from '@/types/dto';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { cn } from '@/lib/utils';

interface ArticleListProps {
  articles: Article[];
  isLoading?: boolean;
  onEdit?: (article: Article) => void;
  onDelete?: (articleId: number) => void;
  onStatusChange?: (articleId: number, status: ArticleStatus) => void;
  onView?: (article: Article) => void;
  showActions?: boolean;
  className?: string;
}

const ArticleStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig = {
    draft: { label: '草稿', variant: 'secondary' as const, icon: EyeOff },
    publish: { label: '已发布', variant: 'default' as const, icon: Eye },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

const ArticleCard: React.FC<{
  article: Article;
  onEdit?: (article: Article) => void;
  onDelete?: (articleId: number) => void;
  onStatusChange?: (articleId: number, status: ArticleStatus) => void;
  onView?: (article: Article) => void;
  showActions?: boolean;
}> = ({ article, onEdit, onDelete, onStatusChange, onView, showActions = true }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleStatusToggle = () => {
    const newStatus = article.status === 'publish' ? 'draft' : 'publish';
    onStatusChange?.(article.articleID, newStatus as ArticleStatus);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle 
                className="text-lg font-semibold line-clamp-2 hover:text-primary transition-colors"
                onClick={() => onView?.(article)}
              >
                {article.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(article.createdAt), 'yyyy-MM-dd', { locale: zhCN })}
                </div>
                {article.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {format(new Date(article.publishedAt), 'yyyy-MM-dd', { locale: zhCN })}
                  </div>
                )}
              </div>
            </div>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(article)}>
                    <Eye className="w-4 h-4 mr-2" />
                    查看
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(article)}>
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleStatusToggle}>
                    {article.status === 'publish' ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        设为草稿
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        发布
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.views}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {article.likes}
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {article.comments}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ArticleStatusBadge status={article.status} />
            </div>
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-3">
              <Tag className="w-3 h-3 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {article.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{article.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => {
          onDelete?.(article.articleID);
          setIsDeleteDialogOpen(false);
        }}
        title="删除文章"
        description={`确定要删除文章 "${article.title}" 吗？此操作不可撤销。`}
      />
    </>
  );
};

const ArticleListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex gap-1 mt-3">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  isLoading = false,
  onEdit,
  onDelete,
  onStatusChange,
  onView,
  showActions = true,
  className,
}) => {
  if (isLoading) {
    return <ArticleListSkeleton />;
  }

  if (articles.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">暂无文章</h3>
        <p className="text-muted-foreground">还没有创建任何文章</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {articles.map((article) => (
        <ArticleCard
          key={article.articleID}
          article={article}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onView={onView}
          showActions={showActions}
        />
      ))}
    </div>
  );
};