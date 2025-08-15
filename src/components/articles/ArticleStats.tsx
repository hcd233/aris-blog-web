'use client';

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  MessageCircle, 
  FileText,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Article } from '@/types/dto';
import { cn } from '@/lib/utils';

interface ArticleStatsProps {
  articles: Article[];
  period?: '7d' | '30d' | '90d' | '1y';
  className?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
  variant?: 'default' | 'positive' | 'negative';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  description,
  variant = 'default' 
}) => {
  const getChangeColor = (change?: number) => {
    if (!change) return 'text-muted-foreground';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return null;
    return change > 0 ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs", getChangeColor(change))}>
            {getChangeIcon(change)}
            <span>{Math.abs(change)}%</span>
            <span className="text-muted-foreground">vs 上期</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const calculateStats = (articles: Article[]) => {
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(a => a.status === 'publish').length;
  const draftArticles = articles.filter(a => a.status === 'draft').length;
  const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
  const totalLikes = articles.reduce((sum, a) => sum + a.likes, 0);
  const totalComments = articles.reduce((sum, a) => sum + a.comments, 0);
  
  // 计算平均数据
  const avgViews = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;
  const avgLikes = totalArticles > 0 ? Math.round(totalLikes / totalArticles) : 0;
  const avgComments = totalArticles > 0 ? Math.round(totalComments / totalArticles) : 0;
  
  // 计算最受欢迎的文章
  const mostViewed = articles.reduce((max, a) => a.views > max.views ? a : max, articles[0]);
  const mostLiked = articles.reduce((max, a) => a.likes > max.likes ? a : max, articles[0]);
  const mostCommented = articles.reduce((max, a) => a.comments > max.comments ? a : max, articles[0]);
  
  // 计算发布率
  const publishRate = totalArticles > 0 ? Math.round((publishedArticles / totalArticles) * 100) : 0;
  
  return {
    totalArticles,
    publishedArticles,
    draftArticles,
    totalViews,
    totalLikes,
    totalComments,
    avgViews,
    avgLikes,
    avgComments,
    mostViewed,
    mostLiked,
    mostCommented,
    publishRate,
  };
};

export const ArticleStats: React.FC<ArticleStatsProps> = ({ 
  articles, 
  period = '30d',
  className 
}) => {
  const stats = calculateStats(articles);

  return (
    <div className={cn("space-y-6", className)}>
      {/* 主要统计指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总文章数"
          value={stats.totalArticles}
          icon={<FileText className="w-4 h-4 text-primary" />}
          description={`${stats.publishedArticles} 已发布，${stats.draftArticles} 草稿`}
        />
        
        <StatCard
          title="总阅读量"
          value={stats.totalViews.toLocaleString()}
          icon={<Eye className="w-4 h-4 text-blue-600" />}
          description={`平均每篇 ${stats.avgViews} 次阅读`}
        />
        
        <StatCard
          title="总点赞数"
          value={stats.totalLikes.toLocaleString()}
          icon={<Heart className="w-4 h-4 text-red-600" />}
          description={`平均每篇 ${stats.avgLikes} 次点赞`}
        />
        
        <StatCard
          title="总评论数"
          value={stats.totalComments.toLocaleString()}
          icon={<MessageCircle className="w-4 h-4 text-green-600" />}
          description={`平均每篇 ${stats.avgComments} 条评论`}
        />
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 发布状态统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              发布状态统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>已发布</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats.publishedArticles}</span>
                  <Badge variant="outline">{stats.publishRate}%</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>草稿</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats.draftArticles}</span>
                  <Badge variant="outline">{100 - stats.publishRate}%</Badge>
                </div>
              </div>
              
              {/* 进度条 */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.publishRate}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 最受欢迎文章 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              最受欢迎文章
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.mostViewed && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">阅读量最高</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-sm font-semibold line-clamp-1">{stats.mostViewed.title}</p>
                    <p className="text-xs text-muted-foreground">{stats.mostViewed.views} 次阅读</p>
                  </div>
                </div>
              )}
              
              {stats.mostLiked && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium">点赞数最高</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-sm font-semibold line-clamp-1">{stats.mostLiked.title}</p>
                    <p className="text-xs text-muted-foreground">{stats.mostLiked.likes} 次点赞</p>
                  </div>
                </div>
              )}
              
              {stats.mostCommented && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">评论数最高</span>
                  </div>
                  <div className="pl-6">
                    <p className="text-sm font-semibold line-clamp-1">{stats.mostCommented.title}</p>
                    <p className="text-xs text-muted-foreground">{stats.mostCommented.comments} 条评论</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 性能指标 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            性能指标
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.avgViews}</div>
              <div className="text-sm text-muted-foreground">平均阅读量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.avgLikes}</div>
              <div className="text-sm text-muted-foreground">平均点赞数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.avgComments}</div>
              <div className="text-sm text-muted-foreground">平均评论数</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};