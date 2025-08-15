'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useArticles } from '@/hooks/useArticles';
import { mockArticles } from '@/lib/mock-data';

export default function TestPage() {
  const { articles, isLoadingArticles } = useArticles();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">文章管理功能测试</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>测试状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>加载状态:</strong> {isLoadingArticles ? '加载中...' : '已完成'}
            </div>
            <div>
              <strong>文章数量:</strong> {articles.length}
            </div>
            <div>
              <strong>已发布文章:</strong> {articles.filter(a => a.status === 'publish').length}
            </div>
            <div>
              <strong>草稿文章:</strong> {articles.filter(a => a.status === 'draft').length}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">文章列表</h2>
        <div className="grid gap-4">
          {articles.map((article) => (
            <Card key={article.articleID}>
              <CardHeader>
                <CardTitle>{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div><strong>状态:</strong> {article.status}</div>
                  <div><strong>阅读量:</strong> {article.views}</div>
                  <div><strong>点赞数:</strong> {article.likes}</div>
                  <div><strong>标签:</strong> {article.tags?.join(', ')}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={() => window.location.href = '/articles'}>
          前往文章管理页面
        </Button>
      </div>
    </div>
  );
}