# API 重复调用优化方案

## 🎯 优化目标

减少无意义的API重复调用，提升应用性能和用户体验。

## 🚀 主要改进

### 1. 智能缓存系统 (`src/lib/cache-manager.ts`)

- **TTL控制**: 自动过期机制
- **优先级管理**: 重要数据优先保留
- **自动清理**: 定期清理过期缓存
- **预加载**: 预测性加载数据
- **内存管理**: 防止内存泄漏

```typescript
import { cacheManager, withCache } from '@/lib/cache-manager';

// 自动缓存API调用
const getUser = withCache(
  async (id: number) => await api.getUser(id),
  (id: number) => `user:${id}`,
  { ttl: 10 * 60 * 1000, priority: 9 }
);
```

### 2. 增强的查询Hook (`src/hooks/useOptimizedQuery.ts`)

- **请求去重**: 防止相同请求并发执行
- **智能重试**: 自动重试失败请求
- **后台刷新**: 静默更新过期数据
- **预加载**: hover和可见性预取
- **缓存集成**: 与缓存管理器深度集成

```typescript
const { data, loading, isStale } = useOptimizedQuery(
  ['user', userId],
  () => userService.getUser(userId),
  {
    backgroundRefetch: true,
    dedupeTime: 1000,
    retryCount: 3,
    cacheOptions: { ttl: 5 * 60 * 1000 }
  }
);
```

### 3. 优化的API客户端 (`src/lib/api-client.ts`)

- **请求去重**: 拦截器级别的去重
- **智能错误处理**: 自动token刷新
- **请求追踪**: 唯一Trace ID
- **并发控制**: 防止重复请求

### 4. 服务层缓存集成 (`src/services/article.service.ts`)

- **自动缓存**: 读取操作自动缓存
- **缓存失效**: 更新操作自动清除相关缓存
- **智能键生成**: 基于参数的缓存键

## 📊 性能提升

### 缓存命中率
- **之前**: 0% (无缓存)
- **现在**: 预计 70-90% (智能缓存)

### 重复请求减少
- **之前**: 每次访问都发起新请求
- **现在**: 相同请求在1秒内去重

### 用户体验改善
- **加载速度**: 缓存数据立即可用
- **后台更新**: 数据在后台静默刷新
- **错误恢复**: 自动重试机制

## 🛠️ 使用方法

### 1. 在组件中使用优化查询

```typescript
import { useOptimizedQuery } from '@/hooks';

function UserProfile({ userId }: { userId: number }) {
  const { data: user, loading, isStale } = useOptimizedQuery(
    ['user', userId],
    () => userService.getUser(userId),
    {
      backgroundRefetch: true,
      staleTime: 30 * 1000,
      cacheOptions: {
        ttl: 5 * 60 * 1000,
        priority: 8,
      }
    }
  );

  return (
    <div>
      {user && <UserCard user={user} />}
      {isStale && <Badge>更新中...</Badge>}
    </div>
  );
}
```

### 2. 在服务中使用缓存装饰器

```typescript
import { withCache } from '@/lib/cache-manager';

class UserService {
  getUser = withCache(
    async (id: number) => {
      const response = await this.get(`/users/${id}`);
      return response.data;
    },
    (id: number) => `user:${id}`,
    { ttl: 10 * 60 * 1000, priority: 9 }
  );

  async updateUser(id: number, data: any) {
    const response = await this.patch(`/users/${id}`, data);
    
    // 清除相关缓存
    cacheManager.delete(`user:${id}`);
    cacheManager.delete('users:list');
    
    return response;
  }
}
```

### 3. 性能监控

```typescript
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

function App() {
  return (
    <div>
      {/* 你的应用内容 */}
      <PerformanceMonitor />
    </div>
  );
}
```

## 🔧 配置选项

### 缓存配置

```typescript
const cacheOptions = {
  ttl: 5 * 60 * 1000,        // 缓存生存时间 (5分钟)
  priority: 8,               // 缓存优先级 (1-10)
  enablePreload: true,       // 启用预加载
  maxSize: 1000,            // 最大缓存项数
};
```

### 查询配置

```typescript
const queryOptions = {
  cacheTime: 5 * 60 * 1000,  // 缓存时间
  staleTime: 30 * 1000,      // 数据过期时间
  dedupeTime: 1000,          // 去重时间窗口
  retryCount: 3,             // 重试次数
  retryDelay: 1000,          // 重试延迟
  backgroundRefetch: true,   // 后台刷新
  prefetchOnHover: true,     // hover预取
  prefetchOnVisible: true,   // 可见性预取
};
```

## 📈 监控和调试

### 缓存统计

```typescript
const stats = cacheManager.getStats();
console.log('缓存统计:', {
  总项数: stats.totalItems,
  过期项数: stats.expiredItems,
  总大小: stats.totalSize,
  最大大小: stats.maxSize,
});
```

### 请求追踪

每个API请求都有唯一的Trace ID：

```
[APIClient] Requesting URL: /api/users | Trace-ID: abc-123-def
```

### 性能监控组件

`PerformanceMonitor` 组件提供实时性能指标：
- 缓存使用率
- 内存使用量
- 请求状态
- 性能建议

## 🚨 注意事项

1. **内存管理**: 缓存会占用内存，定期清理过期缓存
2. **数据一致性**: 更新操作后及时清除相关缓存
3. **网络优化**: 合理设置重试次数和延迟
4. **用户体验**: 使用后台刷新和预加载提升响应速度

## 🔄 迁移指南

### 从 useQuery 迁移

```typescript
// 旧版本
const { data, loading, error } = useQuery(
  ['user', userId],
  () => userService.getUser(userId)
);

// 新版本
const { data, loading, error, isStale, invalidate } = useOptimizedQuery(
  ['user', userId],
  () => userService.getUser(userId),
  {
    backgroundRefetch: true,
    dedupeTime: 1000,
    retryCount: 3,
  }
);
```

### 服务层迁移

```typescript
// 旧版本
async getUser(id: number) {
  return await this.get(`/users/${id}`);
}

// 新版本
getUser = withCache(
  async (id: number) => {
    return await this.get(`/users/${id}`);
  },
  (id: number) => `user:${id}`,
  { ttl: 10 * 60 * 1000, priority: 9 }
);
```

## 📚 相关文档

- [API优化指南](./docs/api-optimization.md) - 详细使用说明
- [缓存管理器API](./src/lib/cache-manager.ts) - 缓存系统文档
- [优化查询Hook](./src/hooks/useOptimizedQuery.ts) - Hook使用说明

## 🎉 总结

通过这些优化，我们实现了：

✅ **智能缓存**: 自动缓存API响应，减少重复请求  
✅ **请求去重**: 防止相同请求的并发执行  
✅ **智能重试**: 自动重试失败的请求  
✅ **后台刷新**: 静默更新过期数据  
✅ **性能监控**: 实时监控缓存和请求状态  
✅ **用户体验**: 更快的响应速度和更好的错误处理  

这些改进将显著减少API的无意义重复调用，提升应用性能和用户体验。