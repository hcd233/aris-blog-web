'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { listArticles, type Article } from '@/api';
import { Search, Eye, Heart, Calendar } from 'lucide-react';

interface ArticleListProps {
  className?: string;
}

export function ArticleList({ className }: ArticleListProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
      setArticles([]);
      setHasMore(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 加载文章
  const loadArticles = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const response = await listArticles({
        page,
        pageSize: 10,
        query: debouncedSearch || undefined,
      });

      const newArticles = response.articles || [];
      
      if (page === 1) {
        setArticles(newArticles);
      } else {
        setArticles((prev) => [...prev, ...newArticles]);
      }

      // 检查是否还有更多数据
      if (newArticles.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载文章失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, loading, hasMore]);

  // 初始加载和页码变化时加载
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // 无限滚动监听
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
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

  return (
    <div className={className}>
      {/* 搜索框 */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-sm dark:bg-black/80 pb-4 transition-all">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            placeholder="搜索文章..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 文章列表 */}
      <div
        ref={scrollContainerRef}
        className="space-y-4 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 180px)' }}
      >
        {articles.map((article, index) => (
          <Card
            key={`${article.articleID}-${index}`}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => handleArticleClick(article.slug)}
          >
            <CardHeader>
              <CardTitle className="text-xl line-clamp-2">
                {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 文章元信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                {article.user && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{article.user.name}</span>
                  </div>
                )}
                {article.publishedAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(article.publishedAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{article.views || 0}</span>
                </div>
                <div className="flex items-center gap-1">
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
                      className="transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {article.tags.length > 5 && (
                    <Badge variant="outline">+{article.tags.length - 5}</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* 加载状态 */}
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={`skeleton-${i}`}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
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
            <div className="rounded-full bg-zinc-100 dark:bg-zinc-900 p-6 mb-4">
              <Search className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              暂无文章
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {searchQuery ? '尝试更改搜索条件' : '还没有发布任何文章'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

