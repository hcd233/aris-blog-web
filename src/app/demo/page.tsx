'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArticleList } from '@/components/articles/ArticleList';
import { ArticleStats } from '@/components/articles/ArticleStats';
import { useArticles } from '@/hooks/useArticles';
import { mockArticles } from '@/lib/mock-data';
import { ArrowRight, FileText, BarChart3, Settings } from 'lucide-react';

export default function DemoPage() {
  const { articles, isLoadingArticles } = useArticles();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">文章管理系统演示</h1>
        <p className="text-xl text-muted-foreground mb-8">
          基于 Swagger API 实现的完整文章管理功能
        </p>
      </div>

      {/* 功能特性 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <CardTitle>文章管理</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• 创建、编辑、删除文章</li>
              <li>• 草稿/发布状态管理</li>
              <li>• 版本控制和历史记录</li>
              <li>• 标签和分类管理</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-600" />
              <CardTitle>数据分析</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• 阅读量、点赞数统计</li>
              <li>• 文章表现分析</li>
              <li>• 热门文章排行</li>
              <li>• 发布状态统计</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600" />
              <CardTitle>用户体验</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• 响应式设计</li>
              <li>• 实时预览功能</li>
              <li>• 搜索和筛选</li>
              <li>• 批量操作支持</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 统计信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            数据统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ArticleStats articles={articles} />
        </CardContent>
      </Card>

      {/* 文章列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              文章列表
            </CardTitle>
            <Button variant="outline" size="sm">
              查看全部
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ArticleList
            articles={articles}
            isLoading={isLoadingArticles}
            showActions={false}
          />
        </CardContent>
      </Card>

      {/* 技术栈 */}
      <Card>
        <CardHeader>
          <CardTitle>技术栈</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="font-semibold text-blue-600">Next.js 15</div>
              <div className="text-sm text-muted-foreground">React 框架</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="font-semibold text-green-600">TypeScript</div>
              <div className="text-sm text-muted-foreground">类型安全</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="font-semibold text-purple-600">Tailwind CSS</div>
              <div className="text-sm text-muted-foreground">样式框架</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="font-semibold text-orange-600">Radix UI</div>
              <div className="text-sm text-muted-foreground">组件库</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API 接口 */}
      <Card>
        <CardHeader>
          <CardTitle>API 接口</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">文章管理</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>POST /v1/article - 创建文章</li>
                  <li>GET /v1/article/{'{id}'} - 获取文章</li>
                  <li>PATCH /v1/article/{'{id}'} - 更新文章</li>
                  <li>DELETE /v1/article/{'{id}'} - 删除文章</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">版本管理</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>POST /v1/article/{'{id}'}/version - 创建版本</li>
                  <li>GET /v1/article/{'{id}'}/version/latest - 最新版本</li>
                  <li>GET /v1/article/{'{id}'}/version/list - 版本列表</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 开始使用 */}
      <Card className="text-center">
        <CardContent className="pt-6">
          <h3 className="text-2xl font-bold mb-4">准备开始使用？</h3>
          <p className="text-muted-foreground mb-6">
            体验完整的文章管理功能，包括创建、编辑、版本控制等
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg">
              开始使用
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg">
              查看文档
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}