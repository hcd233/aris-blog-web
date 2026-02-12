import { cn } from "@/lib/utils";
import { FileText, SearchX, Bell } from "lucide-react";

interface EmptyStateProps {
  className?: string;
  icon?: "article" | "search" | "bell";
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const iconMap = {
  article: FileText,
  search: SearchX,
  bell: Bell,
};

const defaultTitles = {
  article: "还没有内容",
  search: "没有找到相关内容",
  bell: "暂无通知",
};

const defaultDescriptions = {
  article: "快去创作属于你的第一篇内容吧！",
  search: "尝试使用其他关键词搜索",
  bell: "当有人与你互动时，你会在这里收到通知",
};

export function EmptyState({
  className,
  icon = "article",
  title,
  description,
  action,
}: EmptyStateProps) {
  const Icon = iconMap[icon];
  
  return (
    <div className={cn("flex flex-col items-center justify-center py-20", className)}>
      <div className="text-6xl mb-4 opacity-50">
        <Icon className="w-16 h-16 text-gray-400 dark:text-gray-600" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
        {title || defaultTitles[icon]}
      </p>
      <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
        {description || defaultDescriptions[icon]}
      </p>
      {action}
    </div>
  );
}
