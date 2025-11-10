'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { listTags, createTag, deleteTag, type Tag } from '@/api';
import { Search, Hash, Heart, Plus, Trash2, Edit } from 'lucide-react';

interface TagListEnhancedProps {
  className?: string;
  onTagClick?: (tag: Tag) => void;
}

export function TagListEnhanced({ className, onTagClick }: TagListEnhancedProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // 创建标签相关状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagSlug, setNewTagSlug] = useState('');
  const [newTagDescription, setNewTagDescription] = useState('');
  const [creating, setCreating] = useState(false);
  
  // 删除标签相关状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

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
      setTags([]);
      setHasMore(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch]);

  // 加载标签
  const loadTags = useCallback(async () => {
    // 防止重复调用
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      
      // 更新 pageRef
      pageRef.current = page;
      
      const response = await listTags({
        page,
        pageSize: 20,
        query: debouncedSearch || undefined,
      });

      const newTags = response.tags || [];
      
      // 使用 pageRef 来确保使用的是请求时的页码
      if (pageRef.current === 1) {
        setTags(newTags);
      } else {
        setTags((prev) => {
          // 防止重复添加：检查最后一个元素
          if (prev.length > 0 && newTags.length > 0 && 
              prev[prev.length - 1]?.tagID === newTags[0]?.tagID) {
            return prev;
          }
          return [...prev, ...newTags];
        });
      }

      if (newTags.length < 20) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载标签失败:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [page, debouncedSearch]);

  // 只在 page 或 debouncedSearch 变化时加载
  useEffect(() => {
    loadTags();
  }, [page, debouncedSearch, loadTags]);

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

  const handleTagClick = (tag: Tag) => {
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  // 创建标签
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      alert('请输入标签名称');
      return;
    }
    
    if (!newTagSlug.trim()) {
      alert('请输入标签 Slug');
      return;
    }

    try {
      setCreating(true);
      await createTag({
        name: newTagName,
        slug: newTagSlug,
        description: newTagDescription || '',
      });
      
      setCreateDialogOpen(false);
      setNewTagName('');
      setNewTagSlug('');
      setNewTagDescription('');
      
      // 重新加载标签列表
      setPage(1);
      setTags([]);
      setHasMore(true);
      loadTags();
    } catch (error) {
      console.error('创建标签失败:', error);
      alert('创建标签失败，请重试');
    } finally {
      setCreating(false);
    }
  };

  // 删除标签
  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    try {
      setDeleting(true);
      await deleteTag(tagToDelete.tagID);
      
      setDeleteDialogOpen(false);
      setTagToDelete(null);
      
      // 从列表中移除
      setTags((prev) => prev.filter((t) => t.tagID !== tagToDelete.tagID));
    } catch (error) {
      console.error('删除标签失败:', error);
      alert('删除标签失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={className}>
      {/* 标题和创建按钮 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          热门标签
        </h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-3.5 w-3.5" />
              创建
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新标签</DialogTitle>
              <DialogDescription>
                添加一个新的标签来分类文章
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="tag-name" className="text-sm font-medium">
                  标签名称
                </label>
                <Input
                  id="tag-name"
                  placeholder="输入标签名称..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="tag-slug" className="text-sm font-medium">
                  Slug（URL标识）
                </label>
                <Input
                  id="tag-slug"
                  placeholder="例如: javascript"
                  value={newTagSlug}
                  onChange={(e) => setNewTagSlug(e.target.value)}
                />
                <p className="text-xs text-zinc-500">
                  用于生成标签的 URL，建议使用小写字母和连字符
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="tag-description" className="text-sm font-medium">
                  描述（可选）
                </label>
                <Textarea
                  id="tag-description"
                  placeholder="输入标签描述..."
                  value={newTagDescription}
                  onChange={(e) => setNewTagDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreateTag} disabled={creating}>
                {creating ? '创建中...' : '创建'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索框 */}
      <div className="sticky top-16 z-40 bg-gradient-to-b from-zinc-50 via-zinc-50/95 to-zinc-50/80 dark:from-black dark:via-black/95 dark:to-black/80 backdrop-blur-sm pb-4 transition-all">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            placeholder="搜索标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200/50 dark:border-zinc-800/50"
          />
        </div>
      </div>

      {/* 标签列表 */}
      <div
        className="space-y-3 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 240px)' }}
      >
        {tags.map((tag, index) => (
          <div
            key={`${tag.tagID}-${index}`}
            className="group relative rounded-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden"
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/50 to-transparent dark:from-zinc-800/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-4">
              <div className="flex items-start justify-between gap-2">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => handleTagClick(tag)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                      {tag.name}
                    </h3>
                  </div>
                  
                  {tag.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                      {tag.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-500">
                    {tag.likes !== undefined && (
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{tag.likes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('编辑功能即将上线');
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTagToDelete(tag);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 加载状态 */}
        {loading && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={`skeleton-${i}`} className="rounded-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 p-4">
                <Skeleton className="h-5 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
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
            <div className="rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm p-4 mb-3">
              <Search className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
              暂无标签
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {searchQuery ? '尝试更改搜索条件' : '点击上方按钮创建第一个标签'}
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
              确定要删除标签「{tagToDelete?.name}」吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
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

