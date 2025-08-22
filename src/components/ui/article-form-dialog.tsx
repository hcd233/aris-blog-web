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
import type { CreateArticleRequestDTO, UpdateArticleRequestDTO, CreateArticleVersionRequestDTO } from "@/types/dto";
import { generateSlugWithFallback } from "@/lib/slugify";
import { CategorySelector } from "./category-selector";
import { TagSelector } from "./tag-selector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import articleService from "@/services/article.service";

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

  const [currentStep, setCurrentStep] = useState<"article" | "content">("article");
  const [createdArticleId, setCreatedArticleId] = useState<number | null>(null);
  const { refetch: refetchArticles } = useArticles();
  const createArticleMutation = useCreateArticle();
  const updateArticleMutation = useUpdateArticle(initialData?.articleID || 0);

  const isLoading = createArticleMutation.loading || updateArticleMutation.loading;

  // 使用防抖处理标题变化，避免频繁的异步slug生成
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
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
          const slug = await generateSlugWithFallback(title, {
            maxLength: 60,
            fallback: 'untitled-article'
          });
          setFormData(prev => ({ ...prev, slug }));
        } catch (error) {
          console.warn('Failed to generate slug:', error);
        }
      }, 300); // 300ms防抖延迟
    }
  }, []);

  const handleCreateArticle = async () => {
    if (!formData.title.trim() || !formData.slug.trim() || formData.categoryID === 0) {
      toast.error("Please fill in all required fields (title, slug, category)");
      return;
    }

    try {
      const createData: CreateArticleRequestDTO = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        categoryID: formData.categoryID,
        tags: formData.tags,
      };
      
      const createdArticle = await createArticleMutation.mutateAsync(createData);
      setCreatedArticleId(createdArticle.articleID);
      
      toast.success("Article created successfully");
      
      // 如果有内容，切换到内容编辑步骤
      if (formData.content.trim()) {
        setCurrentStep("content");
      } else {
        // 没有内容，直接完成
        onOpenChange(false);
        refetchArticles();
        onSubmitSuccess?.();
      }
    } catch (error) {
      console.error("Failed to create article:", error);
      toast.error("Failed to create article");
    }
  };

  const handleCreateVersion = async () => {
    if (!createdArticleId || !formData.content.trim()) {
      toast.error("No content to save");
      return;
    }

    try {
      const versionData: CreateArticleVersionRequestDTO = {
        content: formData.content.trim(),
      };
      
      await articleService.createArticleVersion(createdArticleId, versionData);
      
      toast.success("Article version created successfully");
      onOpenChange(false);
      refetchArticles();
      onSubmitSuccess?.();
    } catch (error) {
      console.error("Failed to create article version:", error);
      toast.error("Failed to create article version");
    }
  };

  const handleUpdateArticle = async () => {
    if (!formData.title.trim() || !formData.slug.trim() || formData.categoryID === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const updateData: UpdateArticleRequestDTO = {
        categoryID: formData.categoryID,
        slug: formData.slug.trim(),
        tags: formData.tags,
      };
      await updateArticleMutation.mutateAsync(updateData);
      
      // For edit mode, also create a new version if content is provided
      if (formData.content.trim() && initialData?.articleID) {
        const versionData: CreateArticleVersionRequestDTO = {
          content: formData.content.trim(),
        };
        await articleService.createArticleVersion(initialData.articleID, versionData);
      }
      
      toast.success("Article updated successfully");
      onOpenChange(false);
      refetchArticles();
      onSubmitSuccess?.();
    } catch (error) {
      console.error("Failed to update article:", error);
    }
  };

  const handleSubmit = () => {
    if (mode === "create") {
      if (currentStep === "article") {
        handleCreateArticle();
      } else {
        handleCreateVersion();
      }
    } else {
      handleUpdateArticle();
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
      setCurrentStep("article");
      setCreatedArticleId(null);
    }
  }, [open, initialData]);

  const getDialogConfig = () => {
    if (mode === "create") {
      return {
        title: currentStep === "article" ? "Create New Article" : "Add Content",
        description: currentStep === "article" ? "Fill in the article details" : "Write your article content",
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
      <DialogContent className="sm:max-w-[800px] border-0 shadow-xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
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
        <div className="px-6 py-6">
          {mode === "create" && currentStep === "article" ? (
            // Article creation step
            <div className="space-y-6">
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

              {/* 分类选择 */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Category *</Label>
                <CategorySelector
                  value={formData.categoryID}
                  onChange={(categoryID) => setFormData(prev => ({ ...prev, categoryID }))}
                />
              </div>

              {/* 标签选择 */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Tags</Label>
                <TagSelector
                  value={formData.tags}
                  onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                />
              </div>
            </div>
          ) : mode === "create" && currentStep === "content" ? (
            // Content creation step
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Icons.check className="w-4 h-4 text-green-600" />
                <span>Article &quot;{formData.title}&quot; created successfully</span>
              </div>
              
              <MarkdownEditor
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                label="Content"
                placeholder="Write your article content in Markdown format..."
              />
            </div>
          ) : (
            // Edit mode - show all fields in tabs
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
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
                    className="border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-lg transition-all duration-200"
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
                    className="border-2 border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 rounded-lg transition-all duration-200 font-mono text-sm"
                  />
                </div>

                {/* 分类选择 */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Category *</Label>
                  <CategorySelector
                    value={formData.categoryID}
                    onChange={(categoryID) => setFormData(prev => ({ ...prev, categoryID }))}
                  />
                </div>

                {/* 标签选择 */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Tags</Label>
                  <TagSelector
                    value={formData.tags}
                    onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="content">
                <MarkdownEditor
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  label="Content"
                  placeholder="Write your article content in Markdown format..."
                />
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* 底部按钮 */}
        <DialogFooter className="px-6 pb-6 space-x-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => {
              if (mode === "create" && currentStep === "content") {
                setCurrentStep("article");
              } else {
                onOpenChange(false);
              }
            }}
            disabled={isLoading}
            className="border-2 border-gray-300 hover:bg-gray-100 transition-colors"
          >
            {mode === "create" && currentStep === "content" ? "Back" : "Cancel"}
          </Button>
          
          {mode === "create" && currentStep === "article" && (
            <Button
              variant="outline"
              onClick={() => {
                // Skip content step - create article without content
                handleCreateArticle();
              }}
              disabled={isLoading || !formData.title.trim() || !formData.slug.trim() || formData.categoryID === 0}
              className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Create Without Content
            </Button>
          )}
          
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading || 
              !formData.title.trim() || 
              !formData.slug.trim() || 
              formData.categoryID === 0 ||
              (mode === "create" && currentStep === "content" && !formData.content.trim())
            }
            className={`${config.button} text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                {mode === "create" 
                  ? (currentStep === "article" ? "Creating..." : "Saving Content...") 
                  : "Updating..."}
              </>
            ) : (
              mode === "create" 
                ? (currentStep === "article" ? "Create & Add Content" : "Save Content")
                : "Update Article"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}