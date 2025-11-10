'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { listTags, type Tag } from '@/api';
import { Search, Hash, Heart } from 'lucide-react';

interface TagListProps {
  className?: string;
  onTagClick?: (tag: Tag) => void;
}

export function TagList({ className, onTagClick }: TagListProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
      setTags([]);
      setHasMore(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 加载标签
  const loadTags = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const response = await listTags({
        page,
        pageSize: 20,
        query: debouncedSearch || undefined,
      });

      const newTags = response.tags || [];
      
      if (page === 1) {
        setTags(newTags);
      } else {
        setTags((prev) => [...prev, ...newTags]);
      }

      // 检查是否还有更多数据
      if (newTags.length < 20) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载标签失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, loading, hasMore]);

  // 初始加载和页码变化时加载
  useEffect(() => {
    loadTags();
  }, [loadTags]);

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

  const handleTagClick = (tag: Tag) => {
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div className={className}>
      {/* 搜索框 */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-sm dark:bg-black/80 pb-4 transition-all">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            placeholder="搜索标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 标签列表 */}
      <div
        className="space-y-3 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 180px)' }}
      >
        {tags.map((tag, index) => (
          <Card
            key={`${tag.tagID}-${index}`}
            className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => handleTagClick(tag)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="h-4 w-4 text-zinc-500" />
                <span className="line-clamp-1">{tag.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {tag.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {tag.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
                {tag.likes !== undefined && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{tag.likes} 点赞</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* 加载状态 */}
        {loading && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={`skeleton-${i}`}>
                <CardHeader>
                  <Skeleton className="h-5 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {/* 无限滚动触发器 */}
        <div ref={observerTarget} className="h-4" />

        {/* 无更多数据提示 */}
        {!loading && !hasMore && tags.length > 0 && (
          <div className="py-4 text-center text-xs text-zinc-500">
            已加载全部标签
          </div>
        )}

        {/* 空状态 */}
        {!loading && tags.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-zinc-100 dark:bg-zinc-900 p-4 mb-3">
              <Search className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
              暂无标签
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {searchQuery ? '尝试更改搜索条件' : '还没有创建任何标签'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

