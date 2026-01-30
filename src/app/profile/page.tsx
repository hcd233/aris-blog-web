"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ArticleCard } from "@/components/article-card";
import { ArticleDetailModal } from "@/components/article-detail-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { listArticles } from "@/lib/api/config";
import type { ListedArticle } from "@/lib/api/types.gen";
import { cn } from "@/lib/utils";
import { FileText, Heart, Bookmark, MapPin, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TabType = "notes";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("notes");
  const [articles, setArticles] = useState<ListedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);

  // 如果未登录，重定向到登录页面
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // 获取用户的文章列表
  useEffect(() => {
    const fetchUserArticles = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await listArticles({
          query: {
            page: 1,
            pageSize: 50,
            userID: user.id,
            sortField: "createdAt",
            sort: "desc",
          },
        });
        
        if (error) {
          console.error("获取文章失败:", error);
          return;
        }
        
        if (data?.articles) {
          setArticles(data.articles);
        }
      } catch (error) {
        console.error("请求失败:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchUserArticles();
    }
  }, [isAuthenticated, user?.id]);

  const handleArticleClick = (slug: string) => {
    setSelectedArticleSlug(slug);
  };

  const handleCloseModal = () => {
    setSelectedArticleSlug(null);
  };

  const handleLikeChange = (articleId: number, liked: boolean, likes: number) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, liked, likes }
        : article
    ));
  };

  const handleLockedTabClick = () => {
    toast.info("敬请期待", {
      description: "该功能正在开发中，敬请期待",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Profile Header */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-gray-100 dark:ring-[#1a1a1a]">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-2xl md:text-3xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                {user.name.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            {/* Username */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {user.name}
            </h1>

            {/* User ID & Location */}
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

      {/* Tabs */}
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

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "notes" && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 dark:text-[#666] text-lg mb-2">还没有发布笔记</p>
                <p className="text-gray-400 dark:text-[#555] text-sm">快去创作属于你的第一篇笔记吧！</p>
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
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
            )}
          </>
        )}


      </div>

      {/* Article Detail Modal */}
      <ArticleDetailModal
        articleSlug={selectedArticleSlug || ""}
        isOpen={!!selectedArticleSlug}
        onClose={handleCloseModal}
      />
    </div>
  );
}
