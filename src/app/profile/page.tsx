"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ArticleCard } from "@/components/article-card";
import { ArticleDetailModal } from "@/components/article-detail-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sidebar } from "@/components/sidebar";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { useArticles } from "@/hooks/use-articles";
import { cn } from "@/lib/utils";
import { FileText, Heart, Bookmark, MapPin, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TabType = "notes";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("notes");
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);

  const {
    articles,
    loading,
    imagesLoading,
    imagesLoaded,
    updateArticle,
  } = useArticles({
    userId: user?.id,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("请先登录", {
        description: "请从侧边栏点击登录按钮",
      });
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleArticleClick = (slug: string) => {
    setSelectedArticleSlug(slug);
  };

  const handleCloseModal = () => {
    setSelectedArticleSlug(null);
  };

  const handleLikeChange = (articleId: number, liked: boolean, likes: number) => {
    updateArticle(articleId, { liked, likes });
  };

  const handleLockedTabClick = () => {
    toast.info("敬请期待", {
      description: "该功能正在开发中，敬请期待",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isLoading = loading || imagesLoading;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex">
      <Sidebar />

      <main className="flex-1 lg:ml-[220px]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="flex justify-center md:justify-start">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-gray-100 dark:ring-[#1a1a1a]">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl md:text-3xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  {user.name.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {user.name}
              </h1>

              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 dark:text-[#999]">
                <span>用户id: {user.id}</span>
                <span className="text-gray-300 dark:text-[#444]">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  IP属地: 广东
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#0a0a0a]/80 border-b border-gray-200 dark:border-[#1a1a1a]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center md:justify-start gap-8">
              <button
                onClick={() => setActiveTab("notes")}
                className={cn(
                  "relative py-4 text-sm font-medium transition-colors",
                  activeTab === "notes"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-[#999] hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  笔记
                </span>
                {activeTab === "notes" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ff2442] rounded-full" />
                )}
              </button>
              
              <button
                onClick={handleLockedTabClick}
                className={cn(
                  "relative py-4 text-sm font-medium transition-colors",
                  "text-gray-400 dark:text-[#666] cursor-not-allowed"
                )}
              >
                <span className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  收藏
                  <Lock className="w-3 h-3" />
                </span>
              </button>
              
              <button
                onClick={handleLockedTabClick}
                className={cn(
                  "relative py-4 text-sm font-medium transition-colors",
                  "text-gray-400 dark:text-[#666] cursor-not-allowed"
                )}
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  点赞
                  <Lock className="w-3 h-3" />
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === "notes" && (
            <>
              {isLoading ? (
                <Loading className="py-20" text="加载中..." />
              ) : articles.length === 0 ? (
                <EmptyState
                  icon="article"
                  title="还没有发布笔记"
                  description="快去创作属于你的第一篇笔记吧！"
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
            </>
          )}
        </div>

        <ArticleDetailModal
          articleSlug={selectedArticleSlug || ""}
          isOpen={!!selectedArticleSlug}
          onClose={handleCloseModal}
        />
      </main>
    </div>
  );
}
