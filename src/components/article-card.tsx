"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ListedArticle } from "@/lib/api/types.gen";
import { cn, getGradient, getImageDimensions, calculateImageHeight } from "@/lib/utils";
import { Heart } from "lucide-react";
import { useArticleActions } from "@/hooks/use-article-actions";

interface ArticleCardProps {
  article: ListedArticle;
  onClick?: () => void;
  onLikeChange?: (articleId: number, liked: boolean, likes: number) => void;
}

export function ArticleCard({ article, onClick, onLikeChange }: ArticleCardProps) {
  const gradient = getGradient(article.id);
  const hasCoverImage = article.coverImage && article.coverImage.length > 0;
  
  const [imageHeight, setImageHeight] = useState<number>(280);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const {
    isLiked,
    likesCount,
    isLikeLoading,
    handleLike,
    setInitialState,
  } = useArticleActions({
    onLikeChange: (liked, likes) => {
      onLikeChange?.(article.id, liked, likes);
    },
  });

  useEffect(() => {
    setInitialState(article.liked, false, article.likes, 0);
  }, [article.liked, article.likes, setInitialState]);

  useEffect(() => {
    if (!hasCoverImage) {
      setImageHeight(280);
      return;
    }

    const loadImage = async () => {
      try {
        const { width: naturalWidth, height: naturalHeight } = await getImageDimensions(article.coverImage!);
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

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await handleLike(article.id);
  };

  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
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
        {hasCoverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl opacity-30 text-gray-900 dark:text-white">
              {article.title.charAt(0) || "A"}
            </span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>

      <h3 className={cn(
        "font-medium text-[15px] leading-snug mb-2 line-clamp-2 transition-colors",
        "text-gray-900 dark:text-white",
        "group-hover:text-gray-700 dark:group-hover:text-gray-200"
      )}>
        {article.title}
      </h3>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={article.author.avatar} alt={article.author.name} />
            <AvatarFallback className="text-[10px] bg-gradient-to-br from-purple-500 to-blue-500 text-white">
              {article.author.name.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-gray-500 dark:text-[#999] text-xs">{article.author.name}</span>
        </div>
        
        <button
          onClick={handleLikeClick}
          disabled={isLikeLoading}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
            isLiked
              ? "text-[#ff2442] bg-red-50 dark:bg-red-900/20"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          )}
        >
          <Heart
            className={cn(
              "w-3.5 h-3.5 transition-all",
              isLiked && "fill-current scale-110"
            )}
          />
          <span>{likesCount}</span>
        </button>
      </div>
    </div>
  );
}
