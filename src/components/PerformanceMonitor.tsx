"use client";

import { useState, useEffect } from 'react';
import { cacheManager } from '@/lib/cache-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface PerformanceStats {
  cacheStats: {
    totalItems: number;
    expiredItems: number;
    totalSize: number;
    maxSize: number;
  };
  requestStats: {
    pendingRequests: number;
    totalRequests: number;
  };
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    cacheStats: {
      totalItems: 0,
      expiredItems: 0,
      totalSize: 0,
      maxSize: 1000,
    },
    requestStats: {
      pendingRequests: 0,
      totalRequests: 0,
    },
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const cacheStats = cacheManager.getStats();
      
      // 获取请求统计（这里需要从全局状态获取）
      const requestStats = {
        pendingRequests: 0, // 这里需要从实际的请求状态管理器中获取
        totalRequests: 0,
      };

      setStats({
        cacheStats,
        requestStats,
      });
    };

    // 初始更新
    updateStats();

    // 定期更新统计信息
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, []);

  const clearCache = () => {
    cacheManager.clear();
    setStats(prev => ({
      ...prev,
      cacheStats: {
        totalItems: 0,
        expiredItems: 0,
        totalSize: 0,
        maxSize: 1000,
      },
    }));
  };

  const cacheUsagePercent = (stats.cacheStats.totalItems / stats.cacheStats.maxSize) * 100;
  const memoryUsageMB = (stats.cacheStats.totalSize / 1024 / 1024).toFixed(2);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-white/80 backdrop-blur-sm"
        >
          📊 性能监控
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">性能监控</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearCache}
                className="text-xs"
              >
                清除缓存
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-xs"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 缓存统计 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">缓存使用</span>
              <Badge variant="secondary" className="text-xs">
                {stats.cacheStats.totalItems}/{stats.cacheStats.maxSize}
              </Badge>
            </div>
            
            <Progress value={cacheUsagePercent} className="h-2" />
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span>内存使用: </span>
                <span className="font-medium">{memoryUsageMB} MB</span>
              </div>
              <div>
                <span>过期项: </span>
                <span className="font-medium">{stats.cacheStats.expiredItems}</span>
              </div>
            </div>
          </div>

          {/* 请求统计 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">请求状态</span>
              <Badge 
                variant={stats.requestStats.pendingRequests > 0 ? "destructive" : "secondary"}
                className="text-xs"
              >
                {stats.requestStats.pendingRequests} 进行中
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span>总请求: </span>
                <span className="font-medium">{stats.requestStats.totalRequests}</span>
              </div>
              <div>
                <span>缓存命中: </span>
                <span className="font-medium">
                  {stats.cacheStats.totalItems > 0 ? '高' : '低'}
                </span>
              </div>
            </div>
          </div>

          {/* 性能建议 */}
          <div className="text-xs text-gray-500 border-t pt-2">
            <div className="font-medium mb-1">性能建议:</div>
            <ul className="space-y-1">
              {cacheUsagePercent > 80 && (
                <li>⚠️ 缓存使用率较高，考虑清理</li>
              )}
              {stats.cacheStats.expiredItems > 10 && (
                <li>🔄 有过期缓存项，建议清理</li>
              )}
              {memoryUsageMB > 10 && (
                <li>💾 内存使用较多，检查缓存策略</li>
              )}
              {stats.requestStats.pendingRequests > 5 && (
                <li>⏳ 并发请求较多，检查去重设置</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PerformanceMonitor;