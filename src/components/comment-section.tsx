"use client";

import { useEffect, useCallback } from "react";
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

          {hasMore && (
            <button
              className="w-full py-2 text-xs text-[#576b95] dark:text-[#7b9bd1] hover:opacity-80 transition-opacity"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "查看更多评论"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
