# API 优化指南

本文档介绍如何使用新的API优化功能来减少无意义的重复调用。

## 概述

我们实现了多层级的API优化机制：

1. **智能缓存系统** - 自动缓存API响应，减少重复请求
2. **请求去重** - 防止相同请求的并发执行
3. **智能重试** - 自动重试失败的请求
4. **后台刷新** - 在后台静默更新数据
5. **预加载** - 预测性加载可能需要的资源

## 核心组件

### 1. 缓存管理器 (CacheManager)

智能缓存系统，支持：
- TTL (Time To Live) 控制
- 优先级管理
- 自动清理
- 预加载功能

```typescript
import { cacheManager, generateCacheKey, withCache } from '@/lib/cache-manager';

// 基本使用
const data = cacheManager.get('my-cache-key');
cacheManager.set('my-cache-key', data, {
  ttl: 5 * 60 * 1000, // 5分钟
  priority: 8,
  enablePreload: true,
});

// 使用装饰器
const cachedFunction = withCache(
  async (id: number) => {
    return await api.getUser(id);
  },
  (id: number) => `user:${id}`,
  {
    ttl: 10 * 60 * 1000,
    priority: 9,
  }
);
```

### 2. 优化的查询Hook (useOptimizedQuery)

增强的查询hook，提供更好的缓存和去重功能：

```typescript
import { useOptimizedQuery } from '@/hooks';

function MyComponent() {
  const { data, loading, error, refetch, isStale } = useOptimizedQuery(
    ['user', userId],
    () => userService.getUser(userId),
    {
      // 缓存配置
      cacheTime: 5 * 60 * 1000, // 5分钟
      staleTime: 30 * 1000, // 30秒后认为数据过期
      
      // 去重配置
      dedupeTime: 1000, // 1秒内相同请求去重
      
      // 重试配置
      retryCount: 3,
      retryDelay: 1000,
      
      // 高级功能
      backgroundRefetch: true, // 后台静默刷新
      prefetchOnHover: true, // hover时预取
      prefetchOnVisible: true, // 可见时预取
      
      // 缓存选项
      cacheOptions: {
        ttl: 10 * 60 * 1000,
        priority: 8,
        enablePreload: true,
      },
    }
  );

  return (
    <div>
      {loading && <Spinner />}
      {isStale && <StaleIndicator />}
      {data && <UserProfile user={data} />}
    </div>
  );
}
```

### 3. 增强的API客户端

API客户端现在包含：
- 请求去重
- 智能错误处理
- Token自动刷新
- 请求追踪

```typescript
// 自动去重 - 相同的请求只会执行一次
const user1 = await userService.getUser(123);
const user2 = await userService.getUser(123); // 复用第一个请求的结果

// 自动重试 - 网络错误时自动重试
const data = await apiClient.get('/api/data'); // 失败时自动重试3次

// 智能缓存 - 响应自动缓存
const articles = await articleService.listArticles(); // 结果自动缓存2分钟
```

## 最佳实践

### 1. 合理设置缓存时间

```typescript
// 用户数据 - 较长缓存时间
useOptimizedQuery(['user', userId], getUser, {
  cacheTime: 10 * 60 * 1000, // 10分钟
  staleTime: 2 * 60 * 1000, // 2分钟后后台刷新
});

// 实时数据 - 较短缓存时间
useOptimizedQuery(['notifications'], getNotifications, {
  cacheTime: 30 * 1000, // 30秒
  staleTime: 10 * 1000, // 10秒后后台刷新
  refetchInterval: 30 * 1000, // 每30秒自动刷新
});
```

### 2. 使用后台刷新

```typescript
// 启用后台刷新，提升用户体验
const { data, isStale } = useOptimizedQuery(
  ['articles'],
  getArticles,
  {
    backgroundRefetch: true,
    staleTime: 60 * 1000,
  }
);

// 显示数据状态
return (
  <div>
    {data && (
      <>
        <ArticleList articles={data} />
        {isStale && <Badge>数据更新中...</Badge>}
      </>
    )}
  </div>
);
```

### 3. 预加载优化

```typescript
// 在用户可能访问的页面预加载数据
const { data: userProfile } = useOptimizedQuery(
  ['user', userId],
  getUserProfile,
  {
    prefetchOnHover: true, // 鼠标悬停时预取
    prefetchOnVisible: true, // 元素可见时预取
  }
);
```

### 4. 缓存失效策略

```typescript
// 在数据更新后清除相关缓存
const updateUser = useMutation(
  (data) => userService.updateUser(userId, data),
  {
    onSuccess: () => {
      // 清除用户相关缓存
      cacheManager.delete(`user:${userId}`);
      cacheManager.delete('users:list');
    },
  }
);
```

## 性能监控

### 缓存统计

```typescript
// 获取缓存统计信息
const stats = cacheManager.getStats();
console.log('缓存统计:', {
  总项数: stats.totalItems,
  过期项数: stats.expiredItems,
  总大小: stats.totalSize,
  最大大小: stats.maxSize,
});
```

### 请求追踪

每个API请求都会生成唯一的Trace ID，便于调试：

```typescript
// 在控制台查看请求追踪
console.log('[APIClient] Requesting URL: /api/users | Trace-ID: abc-123-def');
```

## 迁移指南

### 从 useQuery 迁移到 useOptimizedQuery

```typescript
// 旧版本
const { data, loading, error } = useQuery(
  ['user', userId],
  () => userService.getUser(userId),
  {
    staleTime: 30 * 1000,
  }
);

// 新版本 - 更多优化选项
const { data, loading, error, isStale, invalidate } = useOptimizedQuery(
  ['user', userId],
  () => userService.getUser(userId),
  {
    staleTime: 30 * 1000,
    backgroundRefetch: true,
    dedupeTime: 1000,
    retryCount: 3,
    cacheOptions: {
      ttl: 5 * 60 * 1000,
      priority: 8,
    },
  }
);
```

### 服务层缓存集成

```typescript
// 在服务中使用缓存装饰器
class UserService extends BaseService {
  // 自动缓存用户信息
  getUser = withCache(
    async (id: number) => {
      const response = await this.get(`/users/${id}`);
      return response.data;
    },
    (id: number) => `user:${id}`,
    {
      ttl: 10 * 60 * 1000,
      priority: 9,
    }
  );

  // 更新后清除缓存
  async updateUser(id: number, data: any) {
    const response = await this.patch(`/users/${id}`, data);
    
    // 清除相关缓存
    cacheManager.delete(`user:${id}`);
    cacheManager.delete('users:list');
    
    return response;
  }
}
```

## 注意事项

1. **内存管理**: 缓存会占用内存，定期清理过期缓存
2. **数据一致性**: 更新操作后及时清除相关缓存
3. **网络优化**: 合理设置重试次数和延迟，避免过度请求
4. **用户体验**: 使用后台刷新和预加载提升响应速度

## 故障排除

### 常见问题

1. **缓存不生效**: 检查缓存键是否正确生成
2. **重复请求**: 确认去重时间窗口设置合理
3. **内存泄漏**: 检查是否有未清理的定时器和监听器

### 调试技巧

```typescript
// 启用详细日志
console.log('缓存状态:', cacheManager.getStats());
console.log('请求状态:', requestStates.size);

// 手动清除缓存
cacheManager.clear();

// 检查特定缓存项
const cached = cacheManager.get('my-key');
console.log('缓存项:', cached);
```