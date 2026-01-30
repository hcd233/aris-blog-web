"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

interface CoverUploadProps {
  images: File[];
  onChange: (images: File[]) => void;
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
  const [isSorting, setIsSorting] = useState(false);
  const [imageItems, setImageItems] = useState<ImageItem[]>(() =>
    images.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }))
  );
  const [draggedItem, setDraggedItem] = useState<ImageItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const validateAndAddFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const newImageItems: ImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("文件类型错误", {
          description: `${file.name} 不是图片文件（JPG、PNG、GIF）`,
        });
        continue;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("文件过大", {
          description: `${file.name} 超过 10MB`,
        });
        continue;
      }

      // Check max images limit
      if (imageItems.length + newImageItems.length >= maxImages) {
        toast.warning("图片数量限制", {
          description: `最多只能上传 ${maxImages} 张图片`,
        });
        break;
      }

      newFiles.push(file);
      newImageItems.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
      });
    }

    if (newImageItems.length > 0) {
      const updatedItems = [...imageItems, ...newImageItems];
      setImageItems(updatedItems);
      onChange(updatedItems.map((item) => item.file));
      toast.success(`成功添加 ${newImageItems.length} 张图片`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files);
    // Reset input value to allow selecting the same file again
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
    const itemToRemove = imageItems.find((item) => item.id === id);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.preview);
    }

    const updatedItems = imageItems.filter((item) => item.id !== id);
    setImageItems(updatedItems);
    onChange(updatedItems.map((item) => item.file));
  };

  // Drag and drop for sorting
  const handleItemDragStart = (e: React.DragEvent, item: ImageItem) => {
    setIsSorting(true);
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox
    e.dataTransfer.setData("text/plain", item.id);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === imageItems[index]?.id) return;
    setDragOverIndex(index);
  };

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const sourceIndex = imageItems.findIndex((item) => item.id === draggedItem.id);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;

    const newItems = [...imageItems];
    const [movedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);

    setImageItems(newItems);
    onChange(newItems.map((item) => item.file));

    setDraggedItem(null);
    setDragOverIndex(null);
    setIsSorting(false);
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
    setIsSorting(false);
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

      {imageItems.length > 0 ? (
        <div className="space-y-3">
          {/* Grid of images */}
          <div className="grid grid-cols-3 gap-3">
            {imageItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleItemDragStart(e, item)}
                onDragOver={(e) => handleItemDragOver(e, index)}
                onDrop={(e) => handleItemDrop(e, index)}
                onDragEnd={handleItemDragEnd}
                className={cn(
                  "relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-move",
                  "border-2 border-dashed border-gray-200 dark:border-gray-700",
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
            {imageItems.length < maxImages && (
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

          {/* Hint */}
          <p className="text-xs text-muted-foreground text-center">
            拖拽图片可调整顺序，第一张将作为封面
            <span className="ml-2">
              {imageItems.length} / {maxImages}
            </span>
          </p>
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
