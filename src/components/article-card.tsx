"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ListedArticle } from "@/lib/api/types.gen";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ArticleCardProps {
  article: ListedArticle;
  onClick?: () => void;
}

// 渐变色封面
const getGradient = (id: number) => {
  const gradients = [
    "from-purple-500/20 to-blue-500/20",
    "from-pink-500/20 to-rose-500/20",
    "from-emerald-500/20 to-teal-500/20",
    "from-orange-500/20 to-red-500/20",
    "from-cyan-500/20 to-blue-500/20",
    "from-violet-500/20 to-purple-500/20",
  ];
  return gradients[id % gradients.length];
};

// 获取图片实际尺寸
const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
};

// 计算图片高度（基于容器宽度和原始宽高比）
const calculateImageHeight = (
  naturalWidth: number,
  naturalHeight: number,
  containerWidth: number,
  minHeight: number = 200,
  maxHeight: number = 600
): number => {
  const aspectRatio = naturalHeight / naturalWidth;
  let height = containerWidth * aspectRatio;
  
  // 限制最小和最大高度
  if (height < minHeight) height = minHeight;
  if (height > maxHeight) height = maxHeight;
  
  return Math.round(height);
};

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const gradient = getGradient(article.id);
  const hasCoverImage = article.coverImage && article.coverImage.length > 0;
  
  const [imageHeight, setImageHeight] = useState<number>(280);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 加载图片并计算高度
  useEffect(() => {
    if (!hasCoverImage) {
      setImageHeight(280);
      return;
    }

    const loadImage = async () => {
      try {
        const { width: naturalWidth, height: naturalHeight } = await getImageDimensions(article.coverImage!);
        
        // 获取容器宽度用于计算（瀑布流列宽约 200-280px）
        // 使用固定参考宽度计算，实际渲染时会根据容器自适应
        const containerWidth = 240;
        const calculatedHeight = calculateImageHeight(naturalWidth, naturalHeight, containerWidth);
        
        setImageHeight(calculatedHeight);
        setImageLoaded(true);
      } catch (error) {
        console.error("加载图片失败:", error);
        setImageHeight(280);
      }
    };

    loadImage();
  }, [article.coverImage, hasCoverImage, article.id]);

  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div 
        className={cn(
          "relative rounded-2xl overflow-hidden mb-3",
          "bg-gradient-to-br",
          gradient
        )}
        style={{ 
          height: `${imageHeight}px`
        }}
      >
        {/* Cover Image (if exists) */}
        {hasCoverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          /* Placeholder when no cover image */
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-30 text-gray-900 dark:text-white">
              {article.title.charAt(0) || "A"}
            </span>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>

      {/* Title */}
      <h3 className={cn(
        "font-medium text-[15px] leading-snug mb-2 line-clamp-2 transition-colors",
        "text-gray-900 dark:text-white",
        "group-hover:text-gray-700 dark:group-hover:text-gray-200"
      )}>
        {article.title}
      </h3>

      {/* Author */}
      <div className="flex items-center gap-2">
        <Avatar className="h-5 w-5">
          <AvatarImage src={article.author.avatar} alt={article.author.name} />
          <AvatarFallback className="text-[10px] bg-gradient-to-br from-purple-500 to-blue-500 text-white">
            {article.author.name.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <span className="text-gray-500 dark:text-[#999] text-xs">{article.author.name}</span>
      </div>
    </div>
  );
}
