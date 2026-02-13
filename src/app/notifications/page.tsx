"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { MobileNav } from "@/components/mobile-nav";
import { useAuth } from "@/lib/auth";
import { useNotification } from "@/lib/notification-context";
import { cn } from "@/lib/utils";
import { listNotifications, ackNotification } from "@/lib/api-config";
import type { ListedNotification } from "@/lib/api/types.gen";
import { toast } from "sonner";
import { MessageCircle, Heart, UserPlus, Search } from "lucide-react";
import Image from "next/image";

// 通知类型 - id映射到API的category参数
const tabs = [
  { id: "comment", label: "评论和@", icon: MessageCircle, category: "comment_and_at" as const },
  { id: "like", label: "赞和收藏", icon: Heart, category: "like_and_save" as const },
  { id: "follow", label: "新增关注", icon: UserPlus, category: undefined },
];

// 格式化时间
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  
  return date.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
}

// 获取通知类型显示文本 - 根据通知数据和tab类型返回文案
function getNotificationTypeText(notification: ListedNotification, activeTab: string): string {
  const { type, article, comment } = notification;
  
  // 判断目标类型：文章或评论
  const targetType = comment ? "comment" : article ? "article" : null;
  
  if (activeTab === "like") {
    // 赞和收藏Tab
    if (type === "like") {
      return targetType === "comment" ? "赞了你的评论" : "赞了你的笔记";
    }
    if (type === "save") {
      return targetType === "comment" ? "收藏了你的评论" : "收藏了你的笔记";
    }
    return "与你互动";
  }
  
  if (activeTab === "comment") {
    // 评论和@Tab
    if (type === "comment") {
      return "评论了你的笔记";
    }
    if (type === "reply") {
      return "回复了你的评论";
    }
    if (type === "mention") {
      return "提到了你";
    }
    return "评论了你";
  }
  
  // 默认情况（全部Tab或其他）
  if (type === "like") {
    return targetType === "comment" ? "赞了你的评论" : "赞了你的笔记";
  }
  if (type === "save") {
    return targetType === "comment" ? "收藏了你的评论" : "收藏了你的笔记";
  }
  if (type === "comment") {
    return "评论了你的笔记";
  }
  if (type === "reply") {
    return "回复了你的评论";
  }
  if (type === "follow") {
    return "关注了你";
  }
  if (type === "mention") {
    return "提到了你";
  }
  
  return "与你互动";
}

// 回复输入框组件
function ReplyInput({
  username,
  onSubmit,
  onCancel,
}: {
  username: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content);
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <div className="flex-1 relative">
        <Input
          placeholder={`回复 ${username}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={cn(
            "w-full h-9 pl-3 pr-10 rounded-lg",
            "bg-gray-100 dark:bg-[#1a1a1a]",
            "border-0",
            "text-sm text-gray-900 dark:text-white",
            "placeholder:text-gray-400 dark:placeholder:text-[#666]"
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-8 px-3 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        取消
      </Button>
    </div>
  );
}

// 通知项组件
function NotificationItem({
  notification,
  activeTab,
  onClick,
  onReply,
}: {
  notification: ListedNotification;
  activeTab: string;
  onClick: (notification: ListedNotification) => void;
  onReply: (notification: ListedNotification, content: string) => void;
}) {
  const isUnread = notification.status === "unread";
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // 判断是否是评论/回复通知
  const isCommentNotification = notification.type === "comment" || notification.type === "reply";
  
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 cursor-pointer transition-colors",
        "hover:bg-gray-50 dark:hover:bg-[#1a1a1a]",
        isUnread && "bg-red-50/30 dark:bg-red-900/5"
      )}
    >
      {/* 用户头像 */}
      <div className="flex-shrink-0" onClick={() => onClick(notification)}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={notification.sender.avatar} alt={notification.sender.name} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm">
            {notification.sender.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 min-w-0" onClick={() => onClick(notification)}>
        {/* 用户名和操作 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900 dark:text-white">
            {notification.sender.name}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {getNotificationTypeText(notification, activeTab)}
          </span>
          <span className="text-gray-400 dark:text-gray-500 text-sm">
            {formatTime(notification.createdAt)}
          </span>
          {isUnread && (
            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
          )}
        </div>

        {/* 评论内容 */}
        {notification.comment?.content && (
          <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">
            {notification.comment.content}
          </p>
        )}
        
        {/* 被回复的内容（灰色引用样式）- 从notification.content中解析 */}
        {notification.content && notification.type === "reply" && (
          <div className="mt-2 pl-3 border-l-2 border-gray-200 dark:border-gray-600">
            <p className="text-gray-400 dark:text-gray-500 text-sm line-clamp-1">
              {notification.content}
            </p>
          </div>
        )}
        
        {/* 文章标题（如果没有评论内容） */}
        {notification.article?.title && !notification.comment && (
          <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm line-clamp-1">
            {notification.article.title}
          </p>
        )}

        {/* 回复和点赞按钮（仅评论tab） */}
        {activeTab === "comment" && isCommentNotification && !showReplyInput && (
          <div className="mt-3 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full px-4 text-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
              onClick={(e) => {
                e.stopPropagation();
                setShowReplyInput(true);
              }}
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1" />
              回复
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 rounded-full p-0",
                isLiked && "text-red-500 hover:text-red-600"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
                toast.success(isLiked ? "取消点赞" : "点赞成功");
              }}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </Button>
          </div>
        )}

        {/* 回复输入框 */}
        {activeTab === "comment" && showReplyInput && (
          <div onClick={(e) => e.stopPropagation()}>
            <ReplyInput
              username={notification.sender.name}
              onSubmit={(content) => {
                onReply(notification, content);
                setShowReplyInput(false);
              }}
              onCancel={() => setShowReplyInput(false)}
            />
          </div>
        )}
      </div>

      {/* 文章封面图 */}
      {notification.article?.coverImage && (
        <div 
          className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
          onClick={() => onClick(notification)}
        >
          <Image
            src={notification.article.coverImage}
            alt={notification.article.title || "文章封面"}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { refreshUnreadCount } = useNotification();
  const [activeTab, setActiveTab] = useState("comment");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<ListedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  // 检查登录状态
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("请先登录", {
        description: "登录后即可查看通知",
      });
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // 批量标记通知为已读
  const batchAckNotifications = useCallback(async (notificationIds: number[]) => {
    if (notificationIds.length === 0) return;

    try {
      // 并行发送所有ack请求
      await Promise.all(
        notificationIds.map((id) =>
          ackNotification({
            query: { id },
          })
        )
      );

      // 更新本地状态，将所有通知标记为已读
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, status: "read" as const } : n
        )
      );

      // 刷新全局未读数
      await refreshUnreadCount();
    } catch (error) {
      console.error("批量标记已读失败:", error);
    }
  }, [refreshUnreadCount]);

  // 获取通知列表
  const fetchNotifications = useCallback(async (pageNum: number, isLoadMore = false) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);

      // 获取当前tab的category
      const currentTab = tabs.find((t) => t.id === activeTab);
      const category = currentTab?.category;

      // 如果是"新增关注"tab，使用前端过滤（API暂无此category）
      const shouldFilterFollow = activeTab === "follow";

      const { data, error } = await listNotifications({
        query: {
          page: pageNum,
          pageSize,
          category: category,
        },
      });

      if (error) {
        console.error("获取通知失败:", error);
        toast.error("获取通知失败", {
          description: "请稍后重试",
        });
        return;
      }

      if (data?.notifications) {
        let filteredNotifications = data.notifications;

        // 对"新增关注"进行前端过滤
        if (shouldFilterFollow) {
          filteredNotifications = data.notifications.filter(
            (n) => n.type === "follow"
          );
        }

        if (isLoadMore) {
          setNotifications((prev) => [...prev, ...filteredNotifications]);
        } else {
          setNotifications(filteredNotifications);
        }

        setHasMore(data.notifications.length === pageSize);

        // 自动批量标记未读通知为已读
        if (!isLoadMore) {
          const unreadIds = filteredNotifications
            .filter((n) => n.status === "unread")
            .map((n) => n.id);
          if (unreadIds.length > 0) {
            batchAckNotifications(unreadIds);
          }
        }
      }
    } catch (error) {
      console.error("获取通知失败:", error);
      toast.error("获取通知失败", {
        description: "请检查网络连接",
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, isAuthenticated, batchAckNotifications]);

  // 切换Tab时重新获取
  useEffect(() => {
    if (isAuthenticated) {
      setNotifications([]); // 清空列表，显示 loading
      setPage(1);
      fetchNotifications(1, false);
    }
  }, [activeTab, isAuthenticated, fetchNotifications]);

  // 加载更多
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  // 处理通知点击
  const handleNotificationClick = async (notification: ListedNotification) => {
    // 标记为已读
    if (notification.status === "unread") {
      try {
        await ackNotification({
          query: { id: notification.id },
        });
        
        // 更新本地状态
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, status: "read" } : n
          )
        );

        // 刷新全局未读数
        await refreshUnreadCount();
      } catch (error) {
        console.error("标记已读失败:", error);
      }
    }

    // 跳转到文章
    if (notification.article?.slug) {
      router.push(`/?article=${notification.article.slug}`);
    }
  };

  // 处理回复
  const handleReply = async (notification: ListedNotification, content: string) => {
    // 这里应该调用回复API
    toast.success("回复成功", {
      description: `已回复给 ${notification.sender.name}`,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Sidebar />

      <main className="md:ml-[72px] lg:ml-[260px] pb-16 md:pb-0">
        {/* 顶部搜索和Tab区域 */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#0a0a0a]/80 border-b border-gray-200 dark:border-[#1a1a1a]">
          {/* 搜索框 */}
          <div className="max-w-[800px] mx-auto px-4 pt-6 pb-4">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[#666]" />
              <Input
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className={cn(
                  "w-full h-11 pl-12 pr-4 rounded-full focus:ring-0",
                  "bg-gray-100 dark:bg-[#1a1a1a]",
                  "border-0",
                  "text-gray-900 dark:text-white",
                  "placeholder:text-gray-400 dark:placeholder:text-[#666]"
                )}
              />
            </div>
          </div>

          {/* Tab 导航 - 小红书风格 */}
          <div className="max-w-[800px] mx-auto px-4">
            <div className="flex items-center justify-center gap-8 py-3 border-b border-gray-200 dark:border-[#1a1a1a]">
              {tabs.map((tab) => {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative pb-3 text-base font-medium transition-colors",
                      activeTab === tab.id
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-red-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 通知列表 */}
        <div className="max-w-[800px] mx-auto min-h-[calc(100vh-200px)]">
          {loading && notifications.length === 0 ? (
            <Loading className="py-20" text="加载中..." />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon="bell"
              title="暂无通知"
              description="当有人与你互动时，你会在这里收到通知"
            />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-[#1a1a1a]">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  activeTab={activeTab}
                  onClick={handleNotificationClick}
                  onReply={handleReply}
                />
              ))}
            </div>
          )}

          {/* 加载更多 */}
          {hasMore && notifications.length > 0 && (
            <div className="py-6 text-center">
              <Button
                variant="ghost"
                onClick={loadMore}
                disabled={loading}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {loading ? "加载中..." : "加载更多"}
              </Button>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
