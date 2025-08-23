"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { CategorySelector } from "@/components/ui/category-selector";
import { TagSelector } from "@/components/ui/tag-selector";
import { ThemeToggle } from "@/components/ThemeToggle";
import AppIcon from "@/components/AppIcon";
import { appConfig } from "@/config/app";
import { arisSDK } from "@/lib/sdk";
import type { CurrentUser } from "@/types/api/auth.types";
import type { Article, ArticleVersion, CreateArticleVersionRequestDTO, UpdateArticleRequestDTO } from "@/types/dto";
import { toast } from "sonner";
import { hasCreatorAccess } from "@/lib/permissions";
import { generateSlugWithFallback } from "@/lib/slugify";
import articleService from "@/services/article.service";

export default function ArticleWritePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [articleVersion, setArticleVersion] = useState<ArticleVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form data
  const [title, setTitle] = useState("");
  const [articleSlug, setArticleSlug] = useState("");
  const [categoryID, setCategoryID] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState("");

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Check authentication
        const token = localStorage.getItem("accessToken");
        if (!token) {
          router.replace("/login");
          return;
        }

        // Get current user
        const userData = await arisSDK.auth.getCurrentUser();
        setCurrentUser(userData);

        if (!hasCreatorAccess(userData.role)) {
          toast.error("You don't have permission to edit articles");
          router.replace("/");
          return;
        }

        // Get article by slug
        const articlesResponse = await articleService.listArticles({ 
          page: 1, 
          pageSize: 1 
        });
        const foundArticle = articlesResponse.articles.find(a => a.slug === slug);

        if (!foundArticle) {
          toast.error("Article not found");
          router.replace("/");
          return;
        }

        setArticle(foundArticle);
        setTitle(foundArticle.title);
        setArticleSlug(foundArticle.slug);
        setCategoryID(foundArticle.categoryID || 0);
        setTags(foundArticle.tags || []);

        // Get latest version
        try {
          const latestVersion = await articleService.getLatestArticleVersion(foundArticle.articleID);
          setArticleVersion(latestVersion);
          setContent(latestVersion.content || "");
        } catch (error) {
          // No version exists yet
          console.log("No version found, starting with empty content");
          setContent("");
        }

      } catch (error) {
        console.error("Failed to load article:", error);
        toast.error("Failed to load article");
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadData();
    }
  }, [slug, router]);

  // Auto-save draft
  useEffect(() => {
    if (!article || !content.trim()) return;

    const saveTimer = setTimeout(async () => {
      try {
        await articleService.createArticleVersion(article.articleID, {
          content: content.trim()
        });
        console.log("Draft auto-saved");
      } catch (error) {
        console.error("Failed to auto-save:", error);
      }
    }, 5000); // Auto-save every 5 seconds

    return () => clearTimeout(saveTimer);
  }, [content, article]);

  const handleSave = async () => {
    if (!article) return;

    try {
      setIsSaving(true);

      // Update article metadata
      const updateData: UpdateArticleRequestDTO = {
        categoryID: categoryID,
        slug: articleSlug.trim(),
        tags: tags,
      };
      await articleService.updateArticle(article.articleID, updateData);

      // Create new version with content
      if (content.trim()) {
        const versionData: CreateArticleVersionRequestDTO = {
          content: content.trim(),
        };
        await articleService.createArticleVersion(article.articleID, versionData);
      }

      toast.success("Article saved successfully");
    } catch (error) {
      console.error("Failed to save article:", error);
      toast.error("Failed to save article");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = async (newTitle: string) => {
    setTitle(newTitle);
    
    // Auto-generate slug from title
    if (newTitle.trim()) {
      try {
        const newSlug = await generateSlugWithFallback(newTitle, {
          maxLength: 60,
          fallback: 'untitled-article'
        });
        setArticleSlug(newSlug);
      } catch (error) {
        console.warn('Failed to generate slug:', error);
      }
    }
  };

  const handlePublish = async () => {
    if (!article) return;

    try {
      setIsSaving(true);
      
      // First save the current state
      await handleSave();
      
      // Then update status to publish
      await articleService.updateArticleStatus(article.articleID, { 
        status: "publish" as any 
      });
      
      toast.success("Article published successfully");
      router.push("/");
    } catch (error) {
      console.error("Failed to publish article:", error);
      toast.error("Failed to publish article");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await arisSDK.auth.logout();
      localStorage.removeItem("accessToken");
      router.replace("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center space-x-2">
          <Icons.spinner className="h-6 w-6 animate-spin" />
          <span className="text-lg text-gray-600 dark:text-gray-300">Loading article...</span>
        </div>
      </div>
    );
  }

  if (!currentUser || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.alertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl font-bold text-red-700 dark:text-red-300">
              Article Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => router.push("/")}
              className="w-full"
            >
              <Icons.chevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <AppIcon size="md" />
                <h1
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer"
                  onClick={() => router.push("/")}
                >
                  {appConfig.name}
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <Icons.chevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Write</span>
                <Icons.chevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{title || "Untitled"}</span>
              </div>
            </div>

            {/* Right side - User menu and actions */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icons.upload className="w-4 h-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>

              <Button
                onClick={handlePublish}
                disabled={isSaving}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Icons.zap className="w-4 h-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>

              <ThemeToggle />
              
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>
                    {currentUser.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <Icons.logOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Article title..."
                  className="text-3xl font-bold border-none bg-transparent p-0 focus:ring-0 focus:outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Content Editor */}
              <div className="min-h-[600px]">
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your article..."
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Article Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Icons.settings className="w-5 h-5 mr-2" />
                    Article Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-semibold">
                      URL Slug
                    </Label>
                    <Input
                      id="slug"
                      value={articleSlug}
                      onChange={(e) => setArticleSlug(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Category</Label>
                    <CategorySelector
                      value={categoryID}
                      onChange={setCategoryID}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Tags</Label>
                    <TagSelector
                      value={tags}
                      onChange={setTags}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Article Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Icons.fileText className="w-5 h-5 mr-2" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Characters:</span>
                    <span className="text-sm font-medium">{content.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Words:</span>
                    <span className="text-sm font-medium">
                      {content.trim() ? content.trim().split(/\s+/).length : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reading time:</span>
                    <span className="text-sm font-medium">
                      {Math.max(1, Math.ceil((content.trim().split(/\s+/).length || 0) / 200))} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}