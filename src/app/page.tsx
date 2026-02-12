"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ArticleCard } from "@/components/article-card";
import { ArticleDetailModal } from "@/components/article-detail-modal";
import { OAuthCallbackHandler } from "@/components/oauth-callback-handler";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";
import { listTags } from "@/lib/api-config";
import { useArticles } from "@/hooks/use-articles";
import type { DetailedTag } from "@/lib/api/types.gen";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";
import { MobileLoginDrawer } from "@/components/mobile-login-drawer";

// 包裹组件用于处理 OAuth 回调
function OAuthCallbackWrapper({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const searchParams = useSearchParams();
  const [showCallbackHandler, setShowCallbackHandler] = useState(false);
  const [callbackData, setCallbackData] = useState<{
    provider: string | null;
    code: string | null;
    state: string | null;
  }>({ provider: null, code: null, state: null });

  useEffect(() => {
    // 从 query string 获取回调参数（callback 页面重定向过来的）
    const urlParams = new URLSearchParams(window.location.search);
    const provider = urlParams.get("provider");
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    console.log("OAuth callback detected:", { provider, code, state });

    if (code && state && provider) {
      setCallbackData({ provider, code, state });
      setShowCallbackHandler(true);

      // 清除 URL 参数，避免刷新时重复处理
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleCallbackComplete = useCallback(() => {
    setShowCallbackHandler(false);
    // 登录成功后刷新文章列表，而不是整个页面
    onLoginSuccess();
  }, [onLoginSuccess]);

  if (!showCallbackHandler) return null;

  return (
    <OAuthCallbackHandler
      provider={callbackData.provider}
      code={callbackData.code}
      state={callbackData.state}
      onComplete={handleCallbackComplete}
    />
  );
}

// 用于处理 URL 参数的包裹组件
function ArticleSlugHandler({ onArticleSlug }: { onArticleSlug: (slug: string | null) => void }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const articleSlug = searchParams.get("article");
    onArticleSlug(articleSlug);
  }, [searchParams, onArticleSlug]);
  
  return null;
}

// 主页内容组件
function MainContent({ refreshKey }: { refreshKey: number }) {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<string[]>(["全部"]);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [tagMap, setTagMap] = useState<Map<string, string>>(new Map());

  // 从 URL 参数读取搜索词
  useEffect(() => {
    const queryFromUrl = searchParams.get("q");
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams]);

  const tagSlug = activeCategory !== "全部" ? tagMap.get(activeCategory) : undefined;
  
  const {
    articles,
    loading,
    imagesLoading,
    imagesLoaded,
  } = useArticles({
    tagSlug,
    query: searchQuery || undefined,
  });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data } = await listTags({
          query: { page: 1, pageSize: 10 },
        });
        if (data?.tags) {
          const tagNames: string[] = [];
          const newTagMap = new Map<string, string>();
          data.tags.forEach((tag: DetailedTag) => {
            tagNames.push(tag.name);
            newTagMap.set(tag.name, tag.slug);
          });
          setCategories(["全部", ...tagNames]);
          setTagMap(newTagMap);
        }
      } catch (error) {
        console.error("获取标签失败:", error);
      }
    };

    fetchTags();
  }, [refreshKey]);

  const handleArticleClick = useCallback((slug: string) => {
    setSelectedArticleSlug(slug);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedArticleSlug(null);
    // 清除 URL 参数
    if (window.location.search.includes("article=")) {
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const isLoading = loading || imagesLoading;

  const handleArticleSlugChange = useCallback((slug: string | null) => {
    if (slug) {
      setSelectedArticleSlug(slug);
    }
  }, []);

  return (
    <main className="md:ml-[72px] lg:ml-[220px] pb-16 md:pb-0">
      <Suspense fallback={null}>
        <ArticleSlugHandler onArticleSlug={handleArticleSlugChange} />
      </Suspense>
      <header className={cn(
        "sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#0a0a0a]/80",
        "bg-white/95 dark:bg-[#0a0a0a]/95",
        "border-b border-gray-200 dark:border-[#1a1a1a]"
      )}>
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-[#666]" />
            <Input
              placeholder="搜索感兴趣的内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full h-11 pl-12 pr-4 rounded-full focus:ring-0",
                "bg-gray-100 dark:bg-[#1a1a1a]",
                "border-gray-200 dark:border-[#2a2a2a]",
                "text-gray-900 dark:text-white",
                "placeholder:text-gray-400 dark:placeholder:text-[#666]",
                "focus:border-gray-300 dark:focus:border-[#444]"
              )}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeCategory === category
                    ? "bg-gray-900 text-white dark:bg-white dark:text-black"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1a1a1a] dark:text-[#999] dark:hover:bg-[#2a2a2a] dark:hover:text-white"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {isLoading ? (
          <Loading className="py-20" text="加载中..." />
        ) : articles.length === 0 ? (
          <EmptyState 
            icon={searchQuery ? "search" : "article"}
            title={searchQuery ? "没有找到相关内容" : "暂无文章"}
            description={searchQuery ? "尝试使用其他关键词搜索" : "还没有人发布文章，成为第一个吧！"}
          />
        ) : (
          imagesLoaded && (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="break-inside-avoid">
                  <ArticleCard 
                    article={article} 
                    onClick={() => handleArticleClick(article.slug)}
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
  );
}

export default function Home() {
  const [mainContentKey, setMainContentKey] = useState(0);

  const handleLoginSuccess = useCallback(() => {
    // 登录成功后通过改变 key 强制重新渲染主内容区域
    setMainContentKey(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* OAuth 回调处理弹窗 */}
      <Suspense fallback={null}>
        <OAuthCallbackWrapper onLoginSuccess={handleLoginSuccess} />
      </Suspense>

      <Sidebar />

      <MainContent key={mainContentKey} refreshKey={mainContentKey} />

      {/* 移动端底部登录抽屉 */}
      <MobileLoginDrawer />
    </div>
  );
}
