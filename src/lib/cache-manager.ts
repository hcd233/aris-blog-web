// 智能缓存管理器
interface CacheItem<T> {
  data: T;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  error?: Error;
  ttl: number; // Time to live
  priority: number; // 缓存优先级 (1-10, 10最高)
}

interface CacheOptions {
  ttl?: number; // 缓存生存时间 (毫秒)
  priority?: number; // 缓存优先级 (1-10)
  maxSize?: number; // 最大缓存项数
  enablePreload?: boolean; // 是否启用预加载
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
    
    // 定期清理过期缓存
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }

  // 设置缓存项
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = 5 * 60 * 1000, // 默认5分钟
      priority = 5,
      enablePreload = false,
    } = options;

    // 如果缓存已满，移除最低优先级的项
    if (this.cache.size >= this.maxSize) {
      this.evictLowestPriority();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      lastAccessed: now,
      accessCount: 1,
      ttl,
      priority,
    });

    // 如果启用预加载，设置预加载定时器
    if (enablePreload && ttl > 0) {
      const preloadTime = ttl * 0.8; // 在TTL的80%时预加载
      setTimeout(() => {
        this.emit('preload', key);
      }, preloadTime);
    }
  }

  // 获取缓存项
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    
    // 检查是否过期
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问统计
    item.lastAccessed = now;
    item.accessCount++;

    return item.data;
  }

  // 检查缓存是否存在且未过期
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // 删除缓存项
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // 清空所有缓存
  clear(): void {
    this.cache.clear();
  }

  // 获取缓存统计信息
  getStats() {
    const now = Date.now();
    let totalItems = 0;
    let expiredItems = 0;
    let totalSize = 0;

    for (const [key, item] of this.cache.entries()) {
      totalItems++;
      if (now - item.timestamp > item.ttl) {
        expiredItems++;
      }
      totalSize += JSON.stringify(item.data).length;
    }

    return {
      totalItems,
      expiredItems,
      totalSize,
      maxSize: this.maxSize,
    };
  }

  // 清理过期缓存
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[CacheManager] Cleaned up ${keysToDelete.length} expired cache items`);
    }
  }

  // 移除最低优先级的缓存项
  private evictLowestPriority(): void {
    let lowestPriority = Infinity;
    let lowestPriorityKey = '';

    for (const [key, item] of this.cache.entries()) {
      if (item.priority < lowestPriority) {
        lowestPriority = item.priority;
        lowestPriorityKey = key;
      }
    }

    if (lowestPriorityKey) {
      this.cache.delete(lowestPriorityKey);
      console.log(`[CacheManager] Evicted lowest priority cache item: ${lowestPriorityKey}`);
    }
  }

  // 预加载相关方法
  private listeners = new Map<string, Function[]>();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // 销毁缓存管理器
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
    this.listeners.clear();
  }
}

// 创建全局缓存管理器实例
export const cacheManager = new CacheManager();

// 缓存键生成器
export function generateCacheKey(prefix: string, params?: Record<string, any>): string {
  if (!params) return prefix;
  
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);
  
  return `${prefix}:${JSON.stringify(sortedParams)}`;
}

// 缓存装饰器
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  options: CacheOptions = {}
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = keyGenerator(...args);
    
    // 尝试从缓存获取
    const cached = cacheManager.get(key);
    if (cached !== null) {
      return cached;
    }

    // 执行函数并缓存结果
    try {
      const result = await fn(...args);
      cacheManager.set(key, result, options);
      return result;
    } catch (error) {
      // 缓存错误结果（短期）
      cacheManager.set(key, null, { ...options, ttl: 30 * 1000 }); // 30秒
      throw error;
    }
  }) as T;
}

export default cacheManager;