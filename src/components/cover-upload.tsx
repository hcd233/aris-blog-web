"use client";

import { useRef, useState, useCallback } from "react";
import { ImagePlus, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

interface CoverUploadProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  className?: string;
  maxImages?: number;
}

export function CoverUpload({
  images,
  onChange,
  className,
  maxImages = 9,
}: CoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<ImageItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const validateAndAddFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const newItems: ImageItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 检查文件类型
        if (!file.type.startsWith("image/")) {
          continue;
        }

        // 检查最大数量限制
        if (images.length + newItems.length >= maxImages) {
          break;
        }

        const id = Math.random().toString(36).substr(2, 9);
        newItems.push({
          id,
          file,
          preview: URL.createObjectURL(file),
        });
      }

      if (newItems.length > 0) {
        onChange([...images, ...newItems]);
      }
    },
    [images, maxImages, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndAddFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    const itemToRemove = images.find((item) => item.id === id);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.preview);
    }

    const updatedItems = images.filter((item) => item.id !== id);
    onChange(updatedItems);
  };

  // Drag and drop for sorting
  const handleItemDragStart = (e: React.DragEvent, item: ImageItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.id);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === images[index]?.id) return;
    setDragOverIndex(index);
  };

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const sourceIndex = images.findIndex(
      (item) => item.id === draggedItem.id
    );
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;

    const newItems = [...images];
    const [movedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);

    onChange(newItems);

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {images.length > 0 ? (
        <div className="space-y-3">
          {/* Grid of images */}
          <div className="grid grid-cols-3 gap-3">
            {images.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleItemDragStart(e, item)}
                onDragOver={(e) => handleItemDragOver(e, index)}
                onDrop={(e) => handleItemDrop(e, index)}
                onDragEnd={handleItemDragEnd}
                className={cn(
                  "relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800",
                  "border-2 border-gray-200 dark:border-gray-700 cursor-move",
                  dragOverIndex === index && "border-primary ring-2 ring-primary/20",
                  index === 0 && "ring-2 ring-[#ff2442]/30"
                )}
              >
                <img
                  src={item.preview}
                  alt={`图片 ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Index badge */}
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </div>

                {/* Drag handle hint */}
                <div
                  className={cn(
                    "absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full",
                    "bg-black/50 text-white",
                    "flex items-center justify-center",
                    "transition-opacity opacity-0 group-hover:opacity-100",
                    "cursor-move"
                  )}
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className={cn(
                    "absolute top-2 right-2 w-7 h-7 rounded-full",
                    "bg-black/50 hover:bg-black/70 text-white",
                    "flex items-center justify-center",
                    "transition-opacity opacity-0 group-hover:opacity-100",
                    "focus:opacity-100"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* First image indicator */}
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-[#ff2442]/80 text-white text-xs py-1 px-2 text-center">
                    封面
                  </div>
                )}
              </div>
            ))}

            {/* Add more button */}
            {images.length < maxImages && (
              <button
                type="button"
                onClick={handleClick}
                className={cn(
                  "aspect-square rounded-xl",
                  "border-2 border-dashed cursor-pointer",
                  "flex flex-col items-center justify-center gap-2",
                  "transition-colors",
                  "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                <ImagePlus className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500">添加图片</span>
              </button>
            )}
          </div>

          {/* Status hint */}
          <div className="flex items-center justify-between text-xs">
            <p className="text-muted-foreground">
              拖拽图片可调整顺序，第一张将作为封面
            </p>
            <span className="text-muted-foreground">
              {images.length} / {maxImages}
            </span>
          </div>
        </div>
      ) : (
        // Upload placeholder
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative w-full aspect-[4/3] rounded-xl",
            "border-2 border-dashed cursor-pointer",
            "flex flex-col items-center justify-center gap-3",
            "transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
            "bg-gray-50 dark:bg-gray-800/50"
          )}
        >
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              "bg-gray-100 dark:bg-gray-700",
              "transition-colors",
              isDragging && "bg-primary/10"
            )}
          >
            <ImagePlus
              className={cn(
                "w-7 h-7 text-gray-400",
                isDragging && "text-primary"
              )}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isDragging ? "释放以上传" : "点击或拖拽上传图片"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              支持 JPG、PNG、GIF，最大 10MB，最多 {maxImages} 张
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoverUpload;
