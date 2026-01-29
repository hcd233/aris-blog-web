"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoverUploadProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CoverUpload({ value, onChange, className }: CoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("图片大小不能超过 10MB");
      return;
    }

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        // Preview
        <div className="relative group">
          <div
            className={cn(
              "relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800",
              "border-2 border-dashed border-gray-200 dark:border-gray-700"
            )}
          >
            <img
              src={value}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              "absolute top-2 right-2 w-8 h-8 rounded-full",
              "bg-black/50 hover:bg-black/70 text-white",
              "flex items-center justify-center",
              "transition-opacity opacity-0 group-hover:opacity-100",
              "focus:opacity-100"
            )}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Change cover hint */}
          <div
            onClick={handleClick}
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-black/40 opacity-0 group-hover:opacity-100",
              "transition-opacity cursor-pointer rounded-xl"
            )}
          >
            <span className="text-white font-medium">更换封面</span>
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
            "relative w-full aspect-video rounded-xl",
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
              {isDragging ? "释放以上传" : "点击或拖拽上传封面"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              支持 JPG、PNG、GIF，最大 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoverUpload;
