"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { ArticleCard } from "@/components/article-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { listTags, listArticles } from "@/lib/api/sdk.gen";
import type { DetailedTag, ListedArticle } from "@/lib/api/types.gen";
import { cn } from "@/lib/utils";

export default function Home() {
  const [categories, setCategories] = useState<string[]>(["全部"]);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<ListedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取 tags 列表
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data } = await listTags({
          query: { page: 1, pageSize: 10 },
        });
        if (data?.tags) {
          const tagNames = data.tags.map((tag: DetailedTag) => tag.name);
          setCategories(["全部", ...tagNames]);
        }
      } catch (error) {
        console.error("获取标签失败:", error);
      }
    };

    fetchTags();
  }, []);

  // 获取文章列表
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const params: any = {
          query: {
            page: 1,
            pageSize: 20,
          },
        };

        // 如果有搜索关键词
        if (searchQuery) {
          params.query.query = searchQuery;
        }

        // 如果选择了非"全部"的分类
        if (activeCategory !== "全部") {
          params.query.tagName = activeCategory;
        }

        const { data } = await listArticles(params);
        if (data?.articles) {
          setArticles(data.articles);
        }
      } catch (error) {
        console.error("获取文章失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-[72px] lg:ml-[220px]">
        {/* Header with Search */}
        <header className={cn(
          "sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#0a0a0a]/80",
          "bg-white/95 dark:bg-[#0a0a0a]/95",
          "border-b border-gray-200 dark:border-[#1a1a1a]"
        )}>
          <div className="max-w-[1200px] mx-auto px-4 py-4">
            {/* Search Bar */}
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

            {/* Categories */}
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

        {/* Content Grid - Waterfall Layout */}
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 text-gray-400 dark:text-[#666]">
              <p>暂无文章</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="break-inside-avoid">
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
