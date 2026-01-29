"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Heart, MessageCircle, Star, Share2, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getArticle } from "@/lib/api/sdk.gen";
import type { DetailedArticle, User } from "@/lib/api/types.gen";
import { RichTextContent } from "@/components/rich-text-content";
import { cn } from "@/lib/utils";

interface ArticleDetailModalProps {
  articleSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleDetailModal({ articleSlug, isOpen, onClose }: ArticleDetailModalProps) {
  const [article, setArticle] = useState<DetailedArticle | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && articleSlug) {
      fetchArticleDetail();
    }
  }, [isOpen, articleSlug]);

  const fetchArticleDetail = async () => {
    setLoading(true);
    try {
      const { data } = await getArticle({
        query: { slug: articleSlug },
      });
      if (data?.article) {
        setArticle(data.article);
      }
    } catch (error) {
      console.error("获取文章详情失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (action: string) => {
    alert(`敬请期待：${action}功能`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "刚刚";
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          onClick={onClose}
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-[95vw] max-w-[1100px] h-[90vh] max-h-[800px]",
            "bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl",
            "flex flex-col md:flex-row",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "duration-300 ease-out"
          )}
          onInteractOutside={onClose}
        >
          {/* Close Button - Mobile Only */}
          <button
            onClick={onClose}
            className="absolute top-3 left-3 z-50 md:hidden w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hidden Dialog Title for accessibility */}
          <Dialog.Title className="sr-only">
            {article?.title || "文章详情"}
          </Dialog.Title>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : !article ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
              文章加载失败
            </div>
          ) : (
            <>
              {/* Left Side - Image */}
              <div className="relative w-full md:w-[55%] h-[40vh] md:h-full bg-gray-100 dark:bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="text-8xl opacity-20 text-gray-900 dark:text-white">
                      {article.title.charAt(0) || "A"}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Side - Content */}
              <div className="flex-1 flex flex-col h-[50vh] md:h-full">
                {/* Header - Author Info */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={article.author.avatar} alt={article.author.name} />
                      <AvatarFallback className="text-sm bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                        {article.author.name.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {article.author.name}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#ff2442] hover:bg-[#e01e3a] text-white rounded-full px-5 text-xs font-medium"
                    onClick={() => handleAction("关注")}
                  >
                    关注
                  </Button>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  {/* Article Content */}
                  <div className="px-5 py-4">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 leading-snug">
                      {article.title}
                    </h1>
                    
                    {/* Article Body */}
                    <RichTextContent
                      content={article.content}
                      className="text-gray-700 dark:text-gray-300 text-sm"
                    />

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {article.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-[#576b95] dark:text-[#7b9bd1] text-sm cursor-pointer hover:opacity-80"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Publish Time */}
                    <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                      编辑于 {formatDate(article.updatedAt || article.createdAt)}
                    </div>
                  </div>

                  {/* Comments Section Placeholder */}
                  <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      共 0 条评论
                    </div>
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
                      暂无评论，来抢沙发吧～
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#1a1a1a]">
                  {/* Comment Input */}
                  <div className="flex-1 mr-4">
                    <div 
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-[#2a2a2a] cursor-pointer"
                      onClick={() => handleAction("评论")}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={article.author.avatar} />
                        <AvatarFallback className="text-[10px]">U</AvatarFallback>
                      </Avatar>
                      <span className="text-gray-400 dark:text-gray-500 text-sm">说点什么...</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4">
                    <button 
                      className="flex flex-col items-center gap-0.5 text-gray-600 dark:text-gray-400 hover:text-[#ff2442] transition-colors"
                      onClick={() => handleAction("点赞")}
                    >
                      <Heart className="w-6 h-6" />
                      <span className="text-[10px]">0</span>
                    </button>
                    <button 
                      className="flex flex-col items-center gap-0.5 text-gray-600 dark:text-gray-400 hover:text-yellow-500 transition-colors"
                      onClick={() => handleAction("收藏")}
                    >
                      <Star className="w-6 h-6" />
                      <span className="text-[10px]">0</span>
                    </button>
                    <button 
                      className="flex flex-col items-center gap-0.5 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                      onClick={() => handleAction("评论")}
                    >
                      <MessageCircle className="w-6 h-6" />
                      <span className="text-[10px]">0</span>
                    </button>
                    <button 
                      className="flex flex-col items-center gap-0.5 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors"
                      onClick={() => handleAction("分享")}
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Desktop Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 hidden md:flex w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
