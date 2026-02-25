"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { CommentItem } from "@/components/comment-item";
import { useComments } from "@/hooks/use-comments";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { ListedComment } from "@/lib/api/types.gen";

type CommentSectionProps = {
  articleId: number;
  articleAuthorId: number;
  onTotalChange?: (total: number) => void;
  onReply?: (comment: ListedComment) => void;
  refreshKey?: number;
};

export function CommentSection({
  articleId,
  articleAuthorId,
  onTotalChange,
  onReply,
  refreshKey,
}: CommentSectionProps) {
  const { isAuthenticated } = useAuth();
  const {
    comments,
    total,
    hasMore,
    loading,
    initialLoaded,
    repliesMap,
    fetchComments,
    loadMore,
    fetchReplies,
    loadMoreReplies,
    expandAllReplies,
    removeComment,
    toggleCommentLike,
  } = useComments(articleId);

  // 滚动加载引用
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 初始加载
  useEffect(() => {
    if (articleId > 0) {
      fetchComments(1, false);
    }
  }, [articleId]);

  // 监听刷新键变化
  useEffect(() => {
    if (articleId > 0 && refreshKey && refreshKey > 0) {
      fetchComments(1, false);
    }
  }, [refreshKey, articleId]);

  // 瀑布流滚动加载
  useEffect(() => {
    if (!hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMore]);

  // 同步总数到外部
  useEffect(() => {
    onTotalChange?.(total);
  }, [total, onTotalChange]);

  // 点击回复
  const handleReply = useCallback((comment: ListedComment) => {
    if (!isAuthenticated) {
      toast.error("请先登录", { description: "登录后即可评论" });
      return;
    }
    onReply?.(comment);
  }, [isAuthenticated, onReply]);

  return (
    <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        共 {total} 条评论
      </div>

      {!initialLoaded && loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          暂无评论，来抢沙发吧～
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleAuthorId={articleAuthorId}
              repliesState={repliesMap[comment.id]}
              onExpandAllReplies={expandAllReplies}
              onLoadMoreReplies={loadMoreReplies}
              onReply={handleReply}
              onDelete={removeComment}
              onToggleLike={toggleCommentLike}
            />
          ))}

          {/* 加载更多触发器 */}
          {hasMore && (
            <div ref={loadMoreRef} className="py-4 flex items-center justify-center">
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
          )}

          {/* 结束文案 */}
          {!hasMore && comments.length > 0 && (
            <div className="py-6 flex items-center justify-center">
              <span className="text-xs text-gray-400 dark:text-gray-500 px-4 py-1.5">
                - THE END -
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
