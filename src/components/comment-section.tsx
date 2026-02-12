"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentItem } from "@/components/comment-item";
import { useComments } from "@/hooks/use-comments";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ListedComment } from "@/lib/api/types.gen";

type CommentSectionProps = {
  articleId: number;
  articleAuthorId: number;
  onTotalChange?: (total: number) => void;
};

export function CommentSection({
  articleId,
  articleAuthorId,
  onTotalChange,
}: CommentSectionProps) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const {
    comments,
    total,
    hasMore,
    loading,
    initialLoaded,
    submitting,
    repliesMap,
    fetchComments,
    loadMore,
    fetchReplies,
    loadMoreReplies,
    expandAllReplies,
    submitComment,
    removeComment,
    toggleCommentLike,
  } = useComments(articleId);

  // 评论输入状态
  const [inputValue, setInputValue] = useState("");
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [replyTarget, setReplyTarget] = useState<ListedComment | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 初始加载
  useEffect(() => {
    if (articleId > 0) {
      fetchComments(1, false);
    }
  }, [articleId]);

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
    setReplyTarget(comment);
    setIsInputExpanded(true);
    setInputValue("");
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [isAuthenticated]);

  // 点击底部输入框占位区域
  const handleInputClick = useCallback(() => {
    if (!isAuthenticated) {
      toast.error("请先登录", { description: "登录后即可评论" });
      return;
    }
    setIsInputExpanded(true);
    setReplyTarget(null);
    setInputValue("");
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [isAuthenticated]);

  // 取消输入
  const handleCancel = useCallback(() => {
    setIsInputExpanded(false);
    setReplyTarget(null);
    setInputValue("");
  }, []);

  // 提交评论
  const handleSubmit = useCallback(async () => {
    const parentID = replyTarget
      ? (replyTarget.parentID === 0 ? replyTarget.id : replyTarget.parentID)
      : 0;

    const success = await submitComment(inputValue, parentID);
    if (success) {
      setInputValue("");
      setIsInputExpanded(false);
      setReplyTarget(null);
    }
  }, [inputValue, replyTarget, submitComment]);

  // textarea 自动调高
  const handleTextareaInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  // Ctrl/Cmd + Enter 发送
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <>
      {/* 评论列表（位于可滚动区域内） */}
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

      {/* 底部输入栏（固定在底部，不跟随滚动） */}
      <div className="sticky bottom-0 px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a]">
        {isInputExpanded ? (
          <div className="space-y-2">
            {replyTarget && (
              <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <span>回复 @{replyTarget.author.name}</span>
                <button
                  onClick={() => setReplyTarget(null)}
                  className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={replyTarget ? `回复 ${replyTarget.author.name}...` : "说点什么..."}
              className={cn(
                "w-full resize-none rounded-lg px-3 py-2 text-sm",
                "bg-gray-100 dark:bg-[#2a2a2a]",
                "text-gray-900 dark:text-white",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                "focus:outline-none focus:ring-1 focus:ring-[#ff2442]/30",
                "min-h-[60px] max-h-[120px]"
              )}
              rows={2}
            />

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                Ctrl + Enter 发送
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-3 text-xs text-gray-500"
                  onClick={handleCancel}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-4 text-xs bg-[#ff2442] hover:bg-[#e01e3a] text-white rounded-full"
                  onClick={handleSubmit}
                  disabled={submitting || !inputValue.trim()}
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-1" />
                      发送
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-[#2a2a2a] cursor-pointer"
            onClick={handleInputClick}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentUser?.avatar || undefined} />
              <AvatarFallback className="text-[10px]">
                {currentUser?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-400 dark:text-gray-500 text-sm">说点什么...</span>
          </div>
        )}
      </div>
    </>
  );
}
