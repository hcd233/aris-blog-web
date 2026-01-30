"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/sidebar";
import { ArticleCard } from "@/components/article-card";
import { ArticleDetailModal } from "@/components/article-detail-modal";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Search } from "lucide-react";
import { listTags } from "@/lib/api/config";
import { useArticles } from "@/hooks/use-articles";
import type { DetailedTag } from "@/lib/api/types.gen";
import { cn } from "@/lib/utils";

export default function Home() {
  const [categories, setCategories] = useState<string[]>(["全部"]);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  const [tagMap, setTagMap] = useState<Map<string, string>>(new Map());

  const tagSlug = activeCategory !== "全部" ? tagMap.get(activeCategory) : undefined;
  
  const {
    articles,
    loading,
    imagesLoading,
    imagesLoaded,
    refetch,
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
  }, []);

  const handleArticleClick = useCallback((slug: string) => {
    setSelectedArticleSlug(slug);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedArticleSlug(null);
  }, []);

  const isLoading = loading || imagesLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Sidebar />

      <main className="ml-[72px] lg:ml-[220px]">
        <header className={cn(
          "sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#0a0a0a]/80",
          "bg-white/95 dark:bg-[#0a0a0a]/95",
          "border-b border-gray-200 dark:border-[#1a1a1a]"
        )}>
          <div className="max-w-[1200px] mx-auto px-4 py-4">
            <div className="relative max-w-xl mx-auto mb-4">
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
      </main>

      <ArticleDetailModal
        articleSlug={selectedArticleSlug || ""}
        isOpen={!!selectedArticleSlug}
        onClose={handleCloseModal}
      />
    </div>
  );
}
