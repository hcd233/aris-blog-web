import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ListedArticle } from "@/lib/api/types.gen";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  article: ListedArticle;
}

// 生成随机高度来模拟瀑布流效果
const getRandomHeight = (id: number) => {
  const heights = [280, 320, 360, 400, 440, 480];
  return heights[id % heights.length];
};

// 生成渐变色封面
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

export function ArticleCard({ article }: ArticleCardProps) {
  const imageHeight = getRandomHeight(article.id);
  const gradient = getGradient(article.id);
  const hasCoverImage = article.coverImage && article.coverImage.length > 0;

  return (
    <Link href={`/article/${article.slug}`}>
      <div className="group cursor-pointer">
        {/* Image Container */}
        <div 
          className={cn(
            "relative rounded-2xl overflow-hidden mb-3",
            "bg-gradient-to-br",
            gradient
          )}
          style={{ height: `${imageHeight}px` }}
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
    </Link>
  );
}
