'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArticleList } from '@/components/articles/ArticleList';
import { ArticleForm } from '@/components/articles/ArticleForm';
import { ArticleDetail } from '@/components/articles/ArticleDetail';
import { ArticleStats } from '@/components/articles/ArticleStats';
import { useArticles, useArticle } from '@/hooks/useArticles';
import { Article, ArticleStatus } from '@/types/dto';
import { ArticleListQueryParams } from '@/types/schemas/article.schema';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ArticlesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 状态管理
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  
  // 查询参数
  const [queryParams, setQueryParams] = useState<ArticleListQueryParams>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // 获取文章列表
  const {
    articles,
    pageInfo,
    isLoadingArticles,
    createArticle,
    updateArticle,
    updateArticleStatus,
    deleteArticle,
    isCreating,
    isUpdating,
    isUpdatingStatus,
    isDeleting,
  } = useArticles(queryParams);

  // 获取单个文章详情
  const {
    article: detailArticle,
    latestVersion,
    isLoadingArticle,
  } = useArticle(selectedArticleId || 0);

  // 处理搜索
  const handleSearch = (value: string) => {
    setQueryParams(prev => ({
      ...prev,
      keyword: value || undefined,
      page: 1, // 重置页码
    }));
  };

  // 处理状态筛选
  const handleStatusFilter = (status: string) => {
    setQueryParams(prev => ({
      ...prev,
      status: status as ArticleStatus || undefined,
      page: 1,
    }));
  };

  // 处理排序
  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setQueryParams(prev => ({
      ...prev,
      sortBy: sortBy as ArticleListQueryParams['sortBy'],
      sortOrder,
    }));
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({
      ...prev,
      page,
    }));
  };

  // 创建文章
  const handleCreateArticle = (data: any) => {
    createArticle(data, {
      onSuccess: () => {
        setShowCreateForm(false);
        toast.success('文章创建成功');
      },
    });
  };

  // 编辑文章
  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setShowEditForm(true);
  };

  // 更新文章
  const handleUpdateArticle = (data: any) => {
    if (!selectedArticle) return;
    
    updateArticle(
      { articleId: selectedArticle.articleID, data },
      {
        onSuccess: () => {
          setShowEditForm(false);
          setSelectedArticle(null);
          toast.success('文章更新成功');
        },
      }
    );
  };

  // 删除文章
  const handleDeleteArticle = (articleId: number) => {
    deleteArticle(articleId, {
      onSuccess: () => {
        toast.success('文章删除成功');
      },
    });
  };

  // 更新文章状态
  const handleStatusChange = (articleId: number, status: ArticleStatus) => {
    updateArticleStatus(
      { articleId, status },
      {
        onSuccess: () => {
          toast.success('状态更新成功');
        },
      }
    );
  };

  // 查看文章详情
  const handleViewArticle = (article: Article) => {
    setSelectedArticleId(article.articleID);
    setShowDetail(true);
  };

  // 点赞文章
  const handleLikeArticle = (articleId: number, undo?: boolean) => {
    // 这里需要调用点赞API
    toast.success(undo ? '取消点赞' : '点赞成功');
  };

  // 分享文章
  const handleShareArticle = (article: Article) => {
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

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">文章管理</h1>
          <p className="text-muted-foreground mt-1">
            管理您的文章，创建、编辑和发布内容
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          创建文章
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="搜索文章标题..."
                  className="pl-10"
                  onChange={(e) => handleSearch(e.target.value)}
                  defaultValue={queryParams.keyword}
                />
              </div>
            </div>

            {/* 状态筛选 */}
            <Select
              value={queryParams.status || ''}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="publish">已发布</SelectItem>
              </SelectContent>
            </Select>

            {/* 排序 */}
            <Select
              value={`${queryParams.sortBy}-${queryParams.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc'];
                handleSort(sortBy, sortOrder);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">创建时间 (最新)</SelectItem>
                <SelectItem value="createdAt-asc">创建时间 (最早)</SelectItem>
                <SelectItem value="updatedAt-desc">更新时间 (最新)</SelectItem>
                <SelectItem value="updatedAt-asc">更新时间 (最早)</SelectItem>
                <SelectItem value="views-desc">阅读量 (最高)</SelectItem>
                <SelectItem value="views-asc">阅读量 (最低)</SelectItem>
                <SelectItem value="likes-desc">点赞数 (最高)</SelectItem>
                <SelectItem value="likes-asc">点赞数 (最低)</SelectItem>
              </SelectContent>
            </Select>

            {/* 视图模式 */}
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <ArticleStats articles={articles} />

      {/* 文章列表 */}
      <ArticleList
        articles={articles}
        isLoading={isLoadingArticles}
        onEdit={handleEditArticle}
        onDelete={handleDeleteArticle}
        onStatusChange={handleStatusChange}
        onView={handleViewArticle}
        className={viewMode === 'list' ? 'grid-cols-1' : undefined}
      />

      {/* 分页 */}
      {pageInfo && pageInfo.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageInfo.currentPage - 1)}
            disabled={pageInfo.currentPage <= 1}
          >
            上一页
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === pageInfo.currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageInfo.currentPage + 1)}
            disabled={pageInfo.currentPage >= pageInfo.totalPages}
          >
            下一页
          </Button>
        </div>
      )}

      {/* 创建文章对话框 */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ArticleForm
            onSubmit={handleCreateArticle}
            onCancel={() => setShowCreateForm(false)}
            isLoading={isCreating}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* 编辑文章对话框 */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ArticleForm
            article={selectedArticle || undefined}
            onSubmit={handleUpdateArticle}
            onCancel={() => {
              setShowEditForm(false);
              setSelectedArticle(null);
            }}
            isLoading={isUpdating}
            mode="edit"
          />
        </DialogContent>
      </Dialog>

      {/* 文章详情对话框 */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ArticleDetail
            article={detailArticle}
            latestVersion={latestVersion}
            isLoading={isLoadingArticle}
            onEdit={handleEditArticle}
            onLike={handleLikeArticle}
            onShare={handleShareArticle}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}