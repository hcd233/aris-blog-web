"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArticleFormDialog } from "@/components/ui/article-form-dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import AppIcon from "@/components/AppIcon";
import { appConfig } from "@/config/app";
import { arisSDK } from "@/lib/sdk";
import type { CurrentUser } from "@/types/api/auth.types";
import { toast } from "sonner";
import { hasCreatorAccess } from "@/lib/permissions";

export default function CreateArticlePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showArticleDialog, setShowArticleDialog] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    arisSDK.auth
      .getCurrentUser()
      .then((data) => {
        setCurrentUser(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to get current user:", err);
        toast.error("Authentication failed");
        router.replace("/login");
      });
  }, [router]);

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

  const handleCreateSuccess = () => {
    toast.success("Article created successfully!");
    router.push("/"); // Redirect to home page after creation
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center space-x-2">
          <Icons.spinner className="h-6 w-6 animate-spin" />
          <span className="text-lg text-gray-600 dark:text-gray-300">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentUser || !hasCreatorAccess(currentUser.permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icons.alertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl font-bold text-red-700 dark:text-red-300">
              Access Denied
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              You don't have permission to create articles
            </CardDescription>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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
                <span className="text-sm text-gray-600 dark:text-gray-300">Create Article</span>
              </div>
            </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>
                  {currentUser.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentUser.email}
                </p>
              </div>
              
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icons.fileText className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Create Your Story
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Share your thoughts, ideas, and experiences with the world. 
              Create beautifully formatted articles with our intuitive editor.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowArticleDialog(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Icons.plus className="w-5 h-5 mr-2" />
                Start Writing
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/")}
                className="border-2 border-gray-300 hover:border-gray-400 transition-colors"
              >
                <Icons.chevronLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icons.edit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Rich Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Write with our powerful Markdown editor that supports formatting, 
                  code blocks, and more.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icons.tag className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Smart Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Organize your content with categories and tags for better 
                  discoverability and management.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icons.zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Version Control</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Keep track of changes with automatic version management. 
                  Never lose your work again.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Quick Tips */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-800 dark:text-amber-200">
                <Icons.zap className="w-5 h-5 mr-2" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-amber-700 dark:text-amber-300">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Your article slug will be automatically generated from the title</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>You can create new tags directly in the tag selector</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Use Markdown syntax for rich formatting in your content</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>You can save articles without content and add content later</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Article Creation Dialog */}
      <ArticleFormDialog
        open={showArticleDialog}
        onOpenChange={setShowArticleDialog}
        mode="create"
        onSubmitSuccess={handleCreateSuccess}
      />
    </div>
  );
}