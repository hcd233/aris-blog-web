"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ArticleCard } from "@/components/article-card";
import { ArticleDetailModal } from "@/components/article-detail-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sidebar } from "@/components/sidebar";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { useArticles } from "@/hooks/use-articles";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import type { User } from "@/lib/api/types.gen";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const userId = Number(params.id);

  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  // 从文章列表中提取的用户信息
  const [userInfo, setUserInfo] = useState<User | null>(null);

  // 如果访问的是当前登录用户，跳转到 /profile
  useEffect(() => {
    if (!authLoading && currentUser && currentUser.id === userId) {
      router.replace("/profile");
    }
  }, [authLoading, currentUser, userId, router]);

  const {
    articles,
    loading,
    imagesLoading,
    imagesLoaded,
    updateArticle,
  } = useArticles({
    userId: userId || undefined,
  });

  // 从第一篇文章中提取用户基本信息
  useEffect(() => {
    if (articles.length > 0 && !userInfo) {
      setUserInfo(articles[0].author);
    }
  }, [articles, userInfo]);

  const handleArticleClick = (slug: string) => {
    setSelectedArticleSlug(slug);
  };

  const handleCloseModal = () => {
    setSelectedArticleSlug(null);
  };

  const handleLikeChange = (articleId: number, liked: boolean, likes: number) => {
    updateArticle(articleId, { liked, likes });
  };

  if (!userId || isNaN(userId)) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">用户不存在</p>
      </div>
    );
  }

  const isLoading = loading || imagesLoading;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex">
      <Sidebar />

      <main className="flex-1 lg:ml-[220px] pb-16 md:pb-0">
        {/* 用户信息头部 */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="flex justify-center md:justify-start">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-gray-100 dark:ring-[#1a1a1a]">
                <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                <AvatarFallback className="text-2xl md:text-3xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  {userInfo?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {userInfo?.name || `用户 ${userId}`}
              </h1>

              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 dark:text-[#999]">
                <span>用户id: {userId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 栏 */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#0a0a0a]/80 border-b border-gray-200 dark:border-[#1a1a1a]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center md:justify-start gap-8">
              <button
                className={cn(
                  "relative py-4 text-sm font-medium transition-colors",
                  "text-gray-900 dark:text-white"
                )}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  笔记
                </span>
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2442] rounded-full" />
              </button>
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {isLoading ? (
            <Loading className="py-20" text="加载中..." />
          ) : articles.length === 0 ? (
            <EmptyState
              icon="article"
              title="暂无笔记"
              description="该用户还没有发布任何笔记"
            />
          ) : (
            imagesLoaded && (
              <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
                {articles.map((article) => (
                  <div key={article.id} className="break-inside-avoid">
                    <ArticleCard
                      article={article}
                      onClick={() => handleArticleClick(article.slug)}
                      onLikeChange={handleLikeChange}
                    />
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <ArticleDetailModal
          articleSlug={selectedArticleSlug || ""}
          isOpen={!!selectedArticleSlug}
          onClose={handleCloseModal}
        />

        <MobileNav />
      </main>
    </div>
  );
}
