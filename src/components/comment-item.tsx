"use client";

import { Heart, MessageCircle, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ListedComment } from "@/lib/api/types.gen";
import type { RepliesState } from "@/hooks/use-comments";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

type CommentItemProps = {
  comment: ListedComment;
  // 文章作者 ID，用于标记"作者"标签
  articleAuthorId?: number;
  // 回复相关
  repliesState?: RepliesState;
  onExpandAllReplies?: (parentId: number) => void;
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
  onExpandAllReplies,
  onLoadMoreReplies,
  onReply,
  onDelete,
  onToggleLike,
  isReply = false,
  replyToName,
}: CommentItemProps) {
  const { user: currentUser } = useAuth();

  const isArticleAuthor = articleAuthorId !== undefined && comment.author.id === articleAuthorId;
  const isOwner = currentUser?.id === comment.author.id;

  // 子评论数据
  const replies = repliesState?.comments ?? [];
  const replyTotal = repliesState?.total ?? 0;
  const repliesLoading = repliesState?.loading ?? false;
  // 当前显示的回复数少于总数，说明处于预览模式
  const hasMoreReplies = repliesState ? repliesState.hasMore : false;
  const remainingCount = replyTotal - replies.length;

  // 用户主页链接
  const userHref = currentUser?.id === comment.author.id ? "/profile" : `/user/${comment.author.id}`;

  return (
    <div className={cn("group", isReply ? "ml-0 mt-3" : "")}>
      <div className="flex gap-3">
        {/* 头像 */}
        <Link href={userHref} className="flex-shrink-0">
          <Avatar className={cn("flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity", isReply ? "h-7 w-7" : "h-9 w-9")}>
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback className={cn(
              "bg-gradient-to-br from-purple-500 to-blue-500 text-white",
              isReply ? "text-[10px]" : "text-xs"
            )}>
              {comment.author.name.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* 内容区域 */}
        <div className="flex-1 min-w-0">
          {/* 昵称行 */}
          <div className="flex items-center gap-2">
            <Link href={userHref} className="hover:opacity-80 transition-opacity">
              <span className={cn(
                "font-medium text-gray-900 dark:text-white truncate",
                isReply ? "text-xs" : "text-sm"
              )}>
                {comment.author.name}
              </span>
            </Link>
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

          {/* 时间与操作区：统一在小红书风格，时间单独一行，操作另起一行 */}
          <div className="mt-1.5">
            {/* 时间行 */}
            <div className={cn(
              "text-gray-400 dark:text-gray-500",
              isReply ? "text-xs" : "text-xs"
            )}>
              {formatDate(comment.createdAt)}
            </div>
            {/* 操作行：点赞 + 回复（与评论内容左对齐） */}
            <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
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
          </div>

          {/* 子评论列表（仅一级评论，默认展示） */}
          {!isReply && replies.length > 0 && (
            <div className="mt-1">
              {replies.map((reply) => (
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

              {/* 展开更多回复 */}
              {hasMoreReplies && remainingCount > 0 && (
                <button
                  className="ml-8 mt-2 flex items-center gap-1 text-xs text-[#576b95] dark:text-[#7b9bd1] hover:opacity-80 transition-opacity"
                  onClick={() => onExpandAllReplies?.(comment.id)}
                  disabled={repliesLoading}
                >
                  {repliesLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  展开更多回复
                </button>
              )}

              {/* 已全部展开且还有分页 */}
              {hasMoreReplies && remainingCount <= 0 && (
                <button
                  className="ml-0 mt-2 flex items-center gap-1 text-xs text-[#576b95] dark:text-[#7b9bd1] hover:opacity-80 transition-opacity"
                  onClick={() => onLoadMoreReplies?.(comment.id)}
                  disabled={repliesLoading}
                >
                  {repliesLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  查看更多回复
                </button>
              )}
            </div>
          )}

          {/* 子评论加载中（首次加载无数据时） */}
          {!isReply && repliesLoading && replies.length === 0 && replyTotal > 0 && (
            <div className="ml-0 mt-2 flex items-center py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
