'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { listArticles, createArticle, deleteArticle, type Article } from '@/api';
import { Search, Eye, Heart, Calendar, Plus, Trash2, Edit } from 'lucide-react';

interface ArticleListEnhancedProps {
  className?: string;
}

export function ArticleListEnhanced({ className }: ArticleListEnhancedProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // 创建文章相关状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleSlug, setNewArticleSlug] = useState('');
  const [creating, setCreating] = useState(false);
  
  // 删除文章相关状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 使用 ref 跟踪加载状态，避免闭包问题
  const loadingRef = useRef(false);
  // 使用 ref 跟踪当前页码，避免竞态条件
  const pageRef = useRef(1);

  // 搜索防抖
  useEffect(() => {
    // 如果是初始值，不执行清空操作
    if (searchQuery === '' && debouncedSearch === '') {
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
      pageRef.current = 1;
      setArticles([]);
      setHasMore(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // 加载文章
  const loadArticles = useCallback(async () => {
    // 防止重复调用
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      
      // 更新 pageRef
      pageRef.current = page;
      
      const response = await listArticles({
        page,
        pageSize: 10,
        query: debouncedSearch || undefined,
      });

      const newArticles = response.articles || [];
      
      // 使用 pageRef 来确保使用的是请求时的页码
      if (pageRef.current === 1) {
        setArticles(newArticles);
      } else {
        setArticles((prev) => {
          // 防止重复添加：检查最后一个元素
          if (prev.length > 0 && newArticles.length > 0 && 
              prev[prev.length - 1]?.articleID === newArticles[0]?.articleID) {
            return prev;
          }
          return [...prev, ...newArticles];
        });
      }

      if (newArticles.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, debouncedSearch]);

  // 只在 page 或 debouncedSearch 变化时加载
  useEffect(() => {
    loadArticles();
  }, [page, debouncedSearch, loadArticles]);

  // 无限滚动监听
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingRef.current) {
          setPage((prev) => {
            const nextPage = prev + 1;
            pageRef.current = nextPage;
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading]);

  const handleArticleClick = (slug: string) => {
    router.push(`/article/${slug}`);
  };

  // 创建文章
  const handleCreateArticle = async () => {
    if (!newArticleTitle.trim()) {
      alert('请输入文章标题');
      return;
    }
    
    if (!newArticleSlug.trim()) {
      alert('请输入文章 Slug');
      return;
    }

    try {
      setCreating(true);
      await createArticle({
        title: newArticleTitle,
        slug: newArticleSlug,
        categoryID: 1, // 默认分类
        tags: [], // 空标签数组
      });
      
      setCreateDialogOpen(false);
      setNewArticleTitle('');
      setNewArticleSlug('');
      
      // 重新加载文章列表
      setPage(1);
      setArticles([]);
      setHasMore(true);
      loadArticles();
    } catch (error) {
      console.error('创建文章失败:', error);
      alert('创建文章失败，请重试');
    } finally {
      setCreating(false);
    }
  };

  // 删除文章
  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;

    try {
      setDeleting(true);
      await deleteArticle(articleToDelete.articleID);
      
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
      
      // 从列表中移除
      setArticles((prev) => prev.filter((a) => a.articleID !== articleToDelete.articleID));
    } catch (error) {
      console.error('删除文章失败:', error);
      alert('删除文章失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={className}>
      {/* 搜索框和创建按钮 */}
      <div className="sticky top-16 z-40 bg-gradient-to-b from-zinc-50 via-zinc-50/95 to-zinc-50/80 dark:from-black dark:via-black/95 dark:to-black/80 backdrop-blur-sm pb-4 transition-all">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              type="text"
              placeholder="搜索文章..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50"
            />
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                创建文章
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>创建新文章</DialogTitle>
                <DialogDescription>
                  填写文章标题和内容开始创作
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    标题
                  </label>
                  <Input
                    id="title"
                    placeholder="输入文章标题..."
                    value={newArticleTitle}
                    onChange={(e) => setNewArticleTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="slug" className="text-sm font-medium">
                    Slug（URL标识）
                  </label>
                  <Input
                    id="slug"
                    placeholder="例如: my-first-article"
                    value={newArticleSlug}
                    onChange={(e) => setNewArticleSlug(e.target.value)}
                  />
                  <p className="text-xs text-zinc-500">
                    用于生成文章的 URL，建议使用小写字母和连字符
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateArticle} disabled={creating}>
                  {creating ? '创建中...' : '创建'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 文章列表 */}
      <div
        ref={scrollContainerRef}
        className="space-y-4 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 180px)' }}
      >
        {articles.map((article, index) => (
          <div
            key={`${article.articleID}-${index}`}
            className="group relative rounded-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden"
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/50 to-transparent dark:from-zinc-800/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-6">
              <div className="flex items-start justify-between gap-4">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => handleArticleClick(article.slug)}
                >
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3 line-clamp-2 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                    {article.title}
                  </h3>
                  
                  {/* 文章元信息 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {article.user && (
                      <div className="flex items-center gap-1.5 font-medium">
                        <span>{article.user.name}</span>
                      </div>
                    )}
                    {article.publishedAt && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(article.publishedAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{article.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{article.likes || 0}</span>
                    </div>
                  </div>

                  {/* 标签 */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 5).map((tag, tagIndex) => (
                        <Badge 
                          key={tagIndex} 
                          variant="secondary"
                          className="bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {article.tags.length > 5 && (
                        <Badge variant="outline" className="backdrop-blur-sm">
                          +{article.tags.length - 5}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      // 编辑功能暂未实现
                      alert('编辑功能即将上线');
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={(e) => {
                      e.stopPropagation();
                      setArticleToDelete(article);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 加载状态 */}
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={`skeleton-${i}`} className="rounded-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 p-6">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </>
        )}

        {/* 无限滚动触发器 */}
        <div ref={observerTarget} className="h-4" />

        {/* 无更多数据提示 */}
        {!loading && !hasMore && articles.length > 0 && (
          <div className="py-8 text-center text-sm text-zinc-500">
            已加载全部文章
          </div>
        )}

        {/* 空状态 */}
        {!loading && articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm p-6 mb-4">
              <Search className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              暂无文章
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {searchQuery ? '尝试更改搜索条件' : '点击上方按钮创建第一篇文章'}
            </p>
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除文章「{articleToDelete?.title}」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArticle}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

