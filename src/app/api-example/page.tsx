'use client';

import { useEffect, useState } from 'react';
import { listArticles, type Article } from '@/api';

export default function ApiExamplePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        const response = await listArticles({
          page: 1,
          pageSize: 10,
        });
        setArticles(response.articles || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取文章失败');
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-500">错误: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
          API 调用示例 - 文章列表
        </h1>
        
        <div className="grid gap-6">
          {articles.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
              暂无文章
            </div>
          ) : (
            articles.map((article) => (
              <div
                key={article.articleID}
                className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <h2 className="text-2xl font-semibold mb-2 text-black dark:text-white">
                  {article.title}
                </h2>
                
                <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                  {article.user && (
                    <span>作者: {article.user.name}</span>
                  )}
                  
                  {article.publishedAt && (
                    <span>
                      发布于: {new Date(article.publishedAt).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                  
                  {article.views !== undefined && (
                    <span>阅读: {article.views}</span>
                  )}
                  
                  {article.likes !== undefined && (
                    <span>点赞: {article.likes}</span>
                  )}
                </div>
                
                {article.tags && article.tags.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

