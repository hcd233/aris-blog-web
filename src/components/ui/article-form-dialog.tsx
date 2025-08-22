"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { useArticles, useCreateArticle, useUpdateArticle } from "@/hooks";
import { toast } from "sonner";
import type { CreateArticleRequestDTO, UpdateArticleRequestDTO } from "@/types/dto";
import { generateSlug } from "@/lib/slugify";

export interface ArticleFormData {
  title: string;
  slug: string;
  categoryID: number;
  tags: string[];
  content: string;
}

export interface ArticleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: Partial<ArticleFormData> & { articleID?: number };
  onSubmitSuccess?: () => void;
}

export function ArticleFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmitSuccess,
}: ArticleFormDialogProps) {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    slug: "",
    categoryID: 0,
    tags: [],
    content: "",
    ...initialData,
  });

  const [tagsInput, setTagsInput] = useState("");
  const { refetch: refetchArticles } = useArticles();
  const createArticleMutation = useCreateArticle();
  const updateArticleMutation = useUpdateArticle(initialData?.articleID || 0);

  const isLoading = createArticleMutation.isLoading || updateArticleMutation.isLoading;

  // 使用防抖处理标题变化，避免频繁的异步slug生成
  const debounceRef = useRef<NodeJS.Timeout>();
  
  const handleTitleChange = useCallback((title: string) => {
    setFormData(prev => ({ ...prev, title }));
    
    // 清除之前的定时器
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // 生成slug
    if (title.trim()) {
      debounceRef.current = setTimeout(async () => {
        try {
          const slug = await generateSlug(title);
          setFormData(prev => ({ ...prev, slug }));
        } catch (error) {
          console.warn('Failed to generate slug:', error);
        }
      }, 300); // 300ms防抖延迟
    }
  }, []);

  // 处理标签输入
  const handleTagsInputChange = (value: string) => {
    setTagsInput(value);
    const tags = value
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.slug.trim() || formData.categoryID === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (mode === "create") {
        const createData: CreateArticleRequestDTO = {
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          categoryID: formData.categoryID,
          tags: formData.tags,
        };
        await createArticleMutation.mutateAsync(createData);
        
        // 创建版本
        if (formData.content.trim()) {
          // 这里需要调用创建版本的API
          // await arisSDK.articles.createVersion(article.articleID, { content: formData.content });
        }
        
        toast.success("Article created successfully");
      } else {
        const updateData: UpdateArticleRequestDTO = {
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          categoryID: formData.categoryID,
          tags: formData.tags,
        };
        await updateArticleMutation.mutateAsync(updateData);
        toast.success("Article updated successfully");
      }

      onOpenChange(false);
      refetchArticles();
      onSubmitSuccess?.();
    } catch (error) {
      console.error("Failed to save article:", error);
    }
  };

  // 重置表单当对话框关闭
  useEffect(() => {
    if (!open) {
      setFormData({
        title: "",
        slug: "",
        categoryID: 0,
        tags: [],
        content: "",
        ...initialData,
      });
      setTagsInput(initialData?.tags?.join(", ") || "");
    }
  }, [open, initialData]);

  const getDialogConfig = () => {
    if (mode === "create") {
      return {
        title: "Create New Article",
        description: "Fill in the article details and content",
        icon: <Icons.fileText className="w-5 h-5 mr-2" />,
        color: "blue",
        gradient: "from-blue-50 to-indigo-50",
        border: "border-blue-100",
        text: "text-blue-700",
        button: "bg-blue-600 hover:bg-blue-700",
      };
    } else {
      return {
        title: "Edit Article",
        description: "Update the article details and content",
        icon: <Icons.edit className="w-5 h-5 mr-2" />,
        color: "green",
        gradient: "from-green-50 to-emerald-50",
        border: "border-green-100",
        text: "text-green-700",
        button: "bg-green-600 hover:bg-green-700",
      };
    }
  };

  const config = getDialogConfig();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-0 shadow-xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* 头部渐变背景 */}
        <div
          className={`p-6 rounded-t-lg border-b ${config.border} dark:border-${config.color}-800 bg-gradient-to-br ${config.gradient} dark:from-${config.color}-900/20 dark:to-amber-900/20`}
        >
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${config.text} dark:text-${config.color}-300 flex items-center`}>
              {config.icon}
              {config.title}
            </DialogTitle>
            <DialogDescription className={`${config.text} dark:text-${config.color}-400`}>
              {config.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* 表单内容 */}
        <div className="px-6 py-6 space-y-4">
          {/* 标题字段 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="Enter article title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all duration-200"
            />
          </div>

          {/* Slug字段 */}
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-semibold">
              Slug *
            </Label>
            <Input
              id="slug"
              placeholder="Article slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all duration-200 font-mono text-sm"
            />
          </div>

          {/* 分类ID字段 */}
          <div className="space-y-2">
            <Label htmlFor="categoryID" className="text-sm font-semibold">
              Category ID *
            </Label>
            <Input
              id="categoryID"
              type="number"
              placeholder="Enter category ID"
              value={formData.categoryID || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryID: parseInt(e.target.value) || 0 }))}
              className="border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all duration-200"
            />
          </div>

          {/* 标签字段 */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-semibold">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              placeholder="tag1, tag2, tag3"
              value={tagsInput}
              onChange={(e) => handleTagsInputChange(e.target.value)}
              className="border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg transition-all duration-200"
            />
          </div>

          {/* 内容编辑器 */}
          <MarkdownEditor
            value={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            label="Content"
            placeholder="Write your article content in Markdown format..."
          />
        </div>

        {/* 底部按钮 */}
        <DialogFooter className="px-6 pb-6 space-x-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-2 border-gray-300 hover:bg-gray-100 transition-colors"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.title.trim() || !formData.slug.trim() || formData.categoryID === 0}
            className={`${config.button} text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              `${mode === "create" ? "Create Article" : "Update Article"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}