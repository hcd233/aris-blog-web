"use client";

import { useState } from "react";
import { Heart, MessageCircle, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ListedComment } from "@/lib/api/types.gen";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

type RepliesState = {
  comments: ListedComment[];
  total: number;
  page: number;
  hasMore: boolean;
  loading: boolean;
};

type CommentItemProps = {
  comment: ListedComment;
  // 文章作者 ID，用于标记"作者"标签
  articleAuthorId?: number;
  // 回复相关
  repliesState?: RepliesState;
  onExpandReplies?: (parentId: number) => void;
  onLoadMoreReplies?: (parentId: number) => void;
  // 操作
  onReply?: (comment: ListedComment) => void;
  onDelete?: (commentId: number, parentID: number) => void;
  onToggleLike?: (commentId: number, liked: boolean, parentID: number) => void;
  // 是否是二级评论
  isReply?: boolean;
  // 被回复人的名称（二级评论专用）
  replyToName?: string;
};

export function CommentItem({
  comment,
  articleAuthorId,
  repliesState,
  onExpandReplies,
  onLoadMoreReplies,
  onReply,
  onDelete,
  onToggleLike,
  isReply = false,
  replyToName,
}: CommentItemProps) {
  const { user: currentUser } = useAuth();
  const [repliesExpanded, setRepliesExpanded] = useState(false);

  const isArticleAuthor = articleAuthorId !== undefined && comment.author.id === articleAuthorId;
  const isOwner = currentUser?.id === comment.author.id;

  const handleExpandReplies = () => {
    if (!repliesExpanded && onExpandReplies) {
      onExpandReplies(comment.id);
    }
    setRepliesExpanded(!repliesExpanded);
  };

  const replyCount = repliesState?.total ?? 0;

  return (
    <div className={cn("group", isReply ? "ml-12 mt-3" : "")}>
      <div className="flex gap-3">
        {/* 头像 */}
        <Avatar className={cn("flex-shrink-0", isReply ? "h-7 w-7" : "h-9 w-9")}>
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback className={cn(
            "bg-gradient-to-br from-purple-500 to-blue-500 text-white",
            isReply ? "text-[10px]" : "text-xs"
          )}>
            {comment.author.name.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          {/* 昵称行 */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium text-gray-900 dark:text-white truncate",
              isReply ? "text-xs" : "text-sm"
            )}>
              {comment.author.name}
            </span>
            {isArticleAuthor && (
              <span className="px-1.5 py-0.5 text-[10px] leading-none rounded bg-[#ff2442]/10 text-[#ff2442] font-medium">
                作者
              </span>
            )}
          </div>

          {/* 评论内容 */}
          <div className={cn("mt-1 text-gray-700 dark:text-gray-300", isReply ? "text-xs" : "text-sm")}>
            {replyToName && (
              <span className="text-[#576b95] dark:text-[#7b9bd1]">
                回复 {replyToName}：
              </span>
            )}
            {comment.content}
          </div>

          {/* 时间 + 操作 */}
          <div className="mt-1.5 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span>{formatDate(comment.createdAt)}</span>

            {/* 点赞 */}
            <button
              className={cn(
                "flex items-center gap-1 transition-colors",
                comment.liked ? "text-[#ff2442]" : "hover:text-[#ff2442]"
              )}
              onClick={() => onToggleLike?.(comment.id, comment.liked, comment.parentID)}
            >
              <Heart className={cn("w-3.5 h-3.5", comment.liked && "fill-current")} />
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>

            {/* 回复按钮 */}
            <button
              className="flex items-center gap-1 hover:text-blue-500 transition-colors"
              onClick={() => onReply?.(comment)}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>回复</span>
            </button>

            {/* 删除（仅作者可见） */}
            {isOwner && (
              <button
                className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                onClick={() => onDelete?.(comment.id, comment.parentID)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 展开回复（仅一级评论） */}
          {!isReply && replyCount > 0 && (
            <button
              className="mt-2 flex items-center gap-1 text-xs text-[#576b95] dark:text-[#7b9bd1] hover:opacity-80 transition-opacity"
              onClick={handleExpandReplies}
            >
              {repliesExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  收起回复
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  展开 {replyCount} 条回复
                </>
              )}
            </button>
          )}

          {/* 回复列表 */}
          {!isReply && repliesExpanded && repliesState && (
            <div className="mt-1">
              {repliesState.loading && repliesState.comments.length === 0 ? (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  {repliesState.comments.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      articleAuthorId={articleAuthorId}
                      isReply
                      replyToName={reply.parentID === comment.id ? comment.author.name : undefined}
                      onReply={onReply}
                      onDelete={onDelete}
                      onToggleLike={onToggleLike}
                    />
                  ))}
                  {repliesState.hasMore && (
                    <button
                      className="ml-12 mt-2 flex items-center gap-1 text-xs text-[#576b95] dark:text-[#7b9bd1] hover:opacity-80 transition-opacity"
                      onClick={() => onLoadMoreReplies?.(comment.id)}
                      disabled={repliesState.loading}
                    >
                      {repliesState.loading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                      查看更多回复
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
