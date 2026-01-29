"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Hash, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// Mock tags data - 实际项目中应该从 API 获取
const MOCK_TAGS = [
  "小红书科技AMA",
  "人机交互系统",
  "智能硬件设计",
  "多模态人工智能",
  "算法",
  "大模型",
  "前端开发",
  "React",
  "TypeScript",
  "Next.js",
  "TailwindCSS",
  "人工智能",
  "机器学习",
  "深度学习",
  "生活记录",
  "美食",
  "旅行",
  "摄影",
];

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  className?: string;
}

export function TagInput({
  tags,
  onTagsChange,
  maxTags = 10,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter tags based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = MOCK_TAGS.filter(
        (tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !tags.includes(tag)
      ).slice(0, 8);
      setFilteredTags(filtered);
      setSelectedIndex(0);
    } else {
      setFilteredTags([]);
    }
  }, [searchQuery, tags]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsSearching(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Check if user typed #
    const hashIndex = value.lastIndexOf("#");
    if (hashIndex !== -1 && hashIndex === value.length - 1) {
      // User just typed #, start searching
      setIsSearching(true);
      setSearchQuery("");
    } else if (isSearching && hashIndex !== -1) {
      // User is typing after #, update search query
      const query = value.slice(hashIndex + 1);
      setSearchQuery(query);
    } else if (isSearching && hashIndex === -1) {
      // User deleted #, stop searching
      setIsSearching(false);
      setSearchQuery("");
    }
  };

  const addTag = useCallback(
    (tagName: string) => {
      const trimmedTag = tagName.trim();
      if (!trimmedTag) return;
      if (tags.length >= maxTags) {
        alert(`最多只能添加 ${maxTags} 个标签`);
        return;
      }
      if (tags.includes(trimmedTag)) {
        // Remove the tag text from input and add space
        const hashIndex = inputValue.lastIndexOf("#");
        if (hashIndex !== -1) {
          setInputValue(inputValue.slice(0, hashIndex) + " ");
        }
        setIsSearching(false);
        setSearchQuery("");
        return;
      }

      onTagsChange([...tags, trimmedTag]);

      // Remove the tag text from input and add space
      const hashIndex = inputValue.lastIndexOf("#");
      if (hashIndex !== -1) {
        setInputValue(inputValue.slice(0, hashIndex) + " ");
      }
      setIsSearching(false);
      setSearchQuery("");
    },
    [inputValue, tags, onTagsChange, maxTags]
  );

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSearching && filteredTags.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredTags.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredTags[selectedIndex]) {
          addTag(filteredTags[selectedIndex]);
        } else if (searchQuery) {
          addTag(searchQuery);
        }
      } else if (e.key === "Escape") {
        setIsSearching(false);
        setSearchQuery("");
      }
    } else if (e.key === "Enter" && inputValue.trim()) {
      // Check if there's a # with text
      const hashIndex = inputValue.lastIndexOf("#");
      if (hashIndex !== -1) {
        const afterHash = inputValue.slice(hashIndex + 1).trim();
        if (afterHash) {
          e.preventDefault();
          addTag(afterHash);
        }
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag when backspace on empty input
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSelectTag = (tag: string) => {
    addTag(tag);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Selected Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm",
                "bg-primary/10 text-primary",
                "transition-colors"
              )}
            >
              <Hash className="w-3 h-3" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div className="relative">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md border bg-background",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
            "transition-all"
          )}
        >
          <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              tags.length >= maxTags
                ? `已达到最大标签数 (${maxTags})`
                : "输入 # 搜索或添加标签，回车确认"
            }
            disabled={tags.length >= maxTags}
            className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
          />
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {tags.length}/{maxTags}
          </span>
        </div>

        {/* Search Dropdown */}
        {isSearching && (
          <div
            className={cn(
              "absolute z-50 left-0 right-0 mt-1 py-2",
              "bg-popover border border-border rounded-md shadow-lg",
              "max-h-60 overflow-y-auto"
            )}
          >
            {filteredTags.length > 0 ? (
              <div className="px-1">
                <div className="px-3 py-1.5 text-xs text-muted-foreground">
                  推荐标签
                </div>
                {filteredTags.map((tag, index) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm rounded-sm",
                      "flex items-center gap-2",
                      "transition-colors",
                      index === selectedIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => addTag(searchQuery)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm rounded-sm",
                    "flex items-center gap-2",
                    "hover:bg-accent transition-colors"
                  )}
                >
                  <Search className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>
                    创建标签 "<strong>{searchQuery}</strong>"
                  </span>
                </button>
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                输入关键词搜索标签
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="mt-1.5 text-xs text-muted-foreground">
        输入 # 开始搜索，按回车键添加标签
      </p>
    </div>
  );
}

export default TagInput;
