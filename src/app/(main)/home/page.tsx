'use client';

import { ArticleListEnhanced } from '@/components/article-list-enhanced';
import { TagListEnhanced } from '@/components/tag-list-enhanced';
import type { Tag } from '@/api';

export default function HomePage() {
  const handleTagClick = (tag: Tag) => {
    console.log('Tag clicked:', tag);
    // 可以在这里实现标签点击后的筛选逻辑
    // 例如：跳转到标签详情页或筛选文章
  };

  return (
    <main className="container mx-auto px-4 py-6 min-h-screen bg-gradient-to-br from-zinc-50 via-zinc-100/50 to-zinc-50 dark:from-black dark:via-zinc-900/50 dark:to-black">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 文章列表 - 左侧 3/4 宽度 */}
        <div className="lg:col-span-3">
          <ArticleListEnhanced className="animate-in fade-in slide-in-from-bottom-4 duration-500" />
        </div>

        {/* 标签列表 - 右侧 1/4 宽度 */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <TagListEnhanced 
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150" 
              onTagClick={handleTagClick}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

