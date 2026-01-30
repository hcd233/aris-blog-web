"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ImagePlus, X, GripVertical, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { uploadImage } from "@/lib/api/config";

type UploadStatus = "pending" | "uploading" | "success" | "error";

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  imageName?: string;
  error?: string;
}

interface CoverUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
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
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<ImageItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // 使用 useEffect 在渲染完成后通知父组件，避免在渲染期间调用 setState
  useEffect(() => {
    const successfulNames = imageItems
      .filter((i) => i.status === "success" && i.imageName)
      .map((i) => i.imageName!);
    
    // 只在成功上传的图片名发生变化时才通知父组件
    if (JSON.stringify(successfulNames) !== JSON.stringify(images)) {
      onChange(successfulNames);
    }
  }, [imageItems, images, onChange]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const uploadFile = async (item: ImageItem) => {
    try {
      setImageItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "uploading" } : i
        )
      );

      const { data, error } = await uploadImage({
        body: {
          image: item.file,
        },
      });

      if (error) {
        throw new Error(typeof error === "string" ? error : "上传失败");
      }

      if (!data?.imageName) {
        throw new Error("服务器返回数据异常");
      }

      // Update item status and imageName
      setImageItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: "success" as const, imageName: data.imageName }
            : i
        )
      );

      return data.imageName;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "上传失败";
      setImageItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: "error" as const, error: errorMsg }
            : i
        )
      );
      toast.error("上传失败", {
        description: `${item.file.name}: ${errorMsg}`,
      });
      throw err;
    }
  };

  const validateAndUploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const newItems: ImageItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file type
        if (!file.type.startsWith("image/")) {
          toast.error("文件类型错误", {
            description: `${file.name} 不是图片文件`,
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
        if (imageItems.length + newItems.length >= maxImages) {
          toast.warning("图片数量限制", {
            description: `最多只能上传 ${maxImages} 张图片`,
          });
          break;
        }

        const id = Math.random().toString(36).substr(2, 9);
        newItems.push({
          id,
          file,
          preview: URL.createObjectURL(file),
          status: "pending",
        });
      }

      if (newItems.length > 0) {
        const updatedItems = [...imageItems, ...newItems];
        setImageItems(updatedItems);
        toast.success(`开始上传 ${newItems.length} 张图片...`);

        // Concurrent upload
        await Promise.all(newItems.map((item) => uploadFile(item)));
      }
    },
    [imageItems, maxImages]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndUploadFiles(e.target.files);
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
    validateAndUploadFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    const itemToRemove = imageItems.find((item) => item.id === id);
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.preview);
    }

    const updatedItems = imageItems.filter((item) => item.id !== id);
    setImageItems(updatedItems);
    // onChange 会通过 useEffect 自动触发
  };

  const handleRetry = async (id: string) => {
    const item = imageItems.find((i) => i.id === id);
    if (!item) return;
    
    await uploadFile(item);
  };

  // Drag and drop for sorting
  const handleItemDragStart = (e: React.DragEvent, item: ImageItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
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

    const sourceIndex = imageItems.findIndex(
      (item) => item.id === draggedItem.id
    );
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;

    const newItems = [...imageItems];
    const [movedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);

    setImageItems(newItems);
    // onChange 会通过 useEffect 自动触发

    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleItemDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const uploadingCount = imageItems.filter(
    (i) => i.status === "uploading"
  ).length;
  const hasError = imageItems.some((i) => i.status === "error");

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
                draggable={item.status === "success"}
                onDragStart={(e) => handleItemDragStart(e, item)}
                onDragOver={(e) => handleItemDragOver(e, index)}
                onDrop={(e) => handleItemDrop(e, index)}
                onDragEnd={handleItemDragEnd}
                className={cn(
                  "relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800",
                  "border-2",
                  item.status === "success" && "border-gray-200 dark:border-gray-700 cursor-move",
                  item.status === "uploading" && "border-yellow-400",
                  item.status === "error" && "border-red-400",
                  item.status === "pending" && "border-gray-200 dark:border-gray-700",
                  dragOverIndex === index && "border-primary ring-2 ring-primary/20",
                  index === 0 && item.status === "success" && "ring-2 ring-[#ff2442]/30"
                )}
              >
                <img
                  src={item.preview}
                  alt={`图片 ${index + 1}`}
                  className={cn(
                    "w-full h-full object-cover",
                    item.status !== "success" && "opacity-50"
                  )}
                />

                {/* Uploading overlay */}
                {item.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}

                {/* Error overlay */}
                {item.status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/20">
                    <button
                      onClick={() => handleRetry(item.id)}
                      className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <span className="text-xs text-red-600 mt-1 font-medium">点击重试</span>
                  </div>
                )}

                {/* Index badge */}
                {item.status === "success" && (
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                )}

                {/* Drag handle hint */}
                {item.status === "success" && (
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
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  disabled={item.status === "uploading"}
                  className={cn(
                    "absolute top-2 right-2 w-7 h-7 rounded-full",
                    "bg-black/50 hover:bg-black/70 text-white",
                    "flex items-center justify-center",
                    "transition-opacity opacity-0 group-hover:opacity-100",
                    "focus:opacity-100",
                    item.status === "uploading" && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* First image indicator */}
                {index === 0 && item.status === "success" && (
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
                disabled={uploadingCount > 0}
                className={cn(
                  "aspect-square rounded-xl",
                  "border-2 border-dashed cursor-pointer",
                  "flex flex-col items-center justify-center gap-2",
                  "transition-colors",
                  "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  uploadingCount > 0 && "opacity-50 cursor-not-allowed"
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
            <div className="flex items-center gap-2">
              {uploadingCount > 0 && (
                <span className="text-yellow-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  上传中 {uploadingCount} 张
                </span>
              )}
              {hasError && (
                <span className="text-red-500">有上传失败的图片</span>
              )}
              <span className="text-muted-foreground">
                {imageItems.length} / {maxImages}
              </span>
            </div>
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
