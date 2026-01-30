"use client";

import { useState, useEffect, useCallback } from "react";
import { listArticles } from "@/lib/api/config";
import type { ListedArticle } from "@/lib/api/types.gen";
import { toast } from "sonner";
import { preloadImage } from "@/lib/utils";

interface UseArticlesOptions {
  userId?: number;
  tagSlug?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}

interface UseArticlesReturn {
  articles: ListedArticle[];
  loading: boolean;
  imagesLoading: boolean;
  imagesLoaded: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateArticle: (id: number, updates: Partial<ListedArticle>) => void;
}

export function useArticles(options: UseArticlesOptions = {}): UseArticlesReturn {
  const { userId, tagSlug, query, page = 1, pageSize = 20 } = options;
  const [articles, setArticles] = useState<ListedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = {
        query: {
          page,
          pageSize,
        },
      };

      if (query) {
        params.query.query = query;
      }

      if (tagSlug) {
        params.query.tagSlug = tagSlug;
      }

      if (userId) {
        params.query.userID = userId;
        params.query.sortField = "createdAt";
        params.query.sort = "desc";
      }

      const { data, error: apiError } = await listArticles(params);
      
      if (apiError) {
        throw new Error("获取文章失败");
      }

      if (data?.articles) {
        setArticles(data.articles);
        
        const imageUrls = data.articles
          .filter((a) => a.coverImage)
          .map((a) => a.coverImage!);

        if (imageUrls.length > 0) {
          setImagesLoading(true);
          setImagesLoaded(false);
          Promise.all(imageUrls.map(preloadImage)).then(() => {
            setImagesLoaded(true);
            setImagesLoading(false);
          });
        } else {
          setImagesLoaded(true);
        }
      }
    } catch (err) {
      console.error("获取文章失败:", err);
      setError(err instanceof Error ? err : new Error("获取文章失败"));
      toast.error("获取文章失败", {
        description: err instanceof Error ? err.message : "请稍后重试",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, tagSlug, query, page, pageSize]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const updateArticle = useCallback((id: number, updates: Partial<ListedArticle>) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === id ? { ...article, ...updates } : article
      )
    );
  }, []);

  return {
    articles,
    loading,
    imagesLoading,
    imagesLoaded,
    error,
    refetch: fetchArticles,
    updateArticle,
  };
}
