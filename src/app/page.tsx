"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import type { CurrentUser } from "@/types/api/auth.types";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import TagList from "@/components/TagList";
import AppIcon from "@/components/AppIcon";
import { appConfig } from "@/config/app";
import { CategoryTree } from "@/components/CategoryTree";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingPage } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { Navigation } from "@/components/ui/navigation";

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagsTotal, setTagsTotal] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    authService
      .getCurrentUser()
      .then((data) => {
        console.log("[HomePage] Raw getCurrentUser response:", data);
        setCurrentUser(data);
      })
      .catch((err) => {
        console.error("Failed to fetch current user:", err);
        setError(
          err.message ||
            "Failed to load user information. Please try logging in again.",
        );
        // Potentially redirect to login if auth error (e.g., token expired)
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          toast.error("Session expired or invalid", {
            description: "Please log in again.",
          });
          router.replace("/login");
        } else {
          toast.error("Error loading user data", { description: err.message });
        }
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (e: unknown) {
      console.error("Logout failed:", e);
      const message = e instanceof Error ? e.message : "Could not log out.";
      toast.error("Logout failed", {
        description: message,
      });
    }
  };

  const handleTagsTotalChange = (total: number) => {
    setTagsTotal(total);
  };

  if (isLoading) {
    return <LoadingPage text="Loading your dashboard..." />;
  }

  if (!localStorage.getItem("accessToken") && !currentUser) {
    return <LoadingPage text="Redirecting to login..." />;
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <AppIcon size="md" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {appConfig.name}
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1">Personal Blog Platform</p>
                </div>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
                Dashboard
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-foreground">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                  <div className="relative">
                    <Avatar className="w-10 h-10 border-2 border-primary/20 ring-2 ring-primary/10">
                      <AvatarImage
                        src={currentUser.avatar}
                        alt={currentUser.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {currentUser.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  </div>
                  {currentUser.permission === "admin" && (
                    <Badge variant="default" className="hidden sm:inline-flex text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
                      Admin
                    </Badge>
                  )}
                </div>
              )}
              <ThemeToggle />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="btn-modern border-border/50 hover:bg-destructive/10 hover:border-destructive/30"
              >
                <Icons.logOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {error && (
          <Card className="mb-6 border-destructive/20 bg-destructive/5 card-hover">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center">
                <Icons.alertCircle className="w-5 h-5 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive/80">{error}</p>
              {!currentUser && (
                <Button
                  onClick={() => router.push("/login")}
                  className="mt-3 btn-modern"
                  size="sm"
                >
                  Go to Login
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {currentUser && (
          <>
            {/* Page Navigation */}
            <Navigation
              title="Dashboard"
              description="Welcome back! Here&apos;s an overview of your blog activity."
              breadcrumbs={[
                { label: "Home", href: "/", icon: "logo" },
                { label: "Dashboard", icon: "zap" }
              ]}
              actions={
                <Button className="btn-modern bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0">
                  <Icons.plus className="w-4 h-4 mr-2" />
                  New Article
                </Button>
              }
            />
            {/* User Profile Overview */}
            <Card className="mb-8 glass card-hover border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Icons.user className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-foreground">
                      Your Profile
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Welcome back! Here&apos;s your account overview
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator className="mb-6" />
              <CardContent>
                <div className="flex items-start space-x-8">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-primary/20 ring-4 ring-primary/10">
                      <AvatarImage
                        src={currentUser.avatar}
                        alt={currentUser.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                        {currentUser.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-background flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Username
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            {currentUser.name || "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Email
                          </p>
                          <p className="text-lg font-semibold text-foreground flex items-center">
                            <Icons.mail className="w-4 h-4 mr-2 text-muted-foreground" />
                            {currentUser.email || "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            User ID
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            #{currentUser.userID}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Permission
                          </p>
                          <Badge
                            variant={currentUser.permission === "admin" ? "default" : "secondary"}
                            className={`text-sm ${
                              currentUser.permission === "admin" 
                                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-0" 
                                : "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200"
                            }`}
                          >
                            {currentUser.permission || "user"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Member Since
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            {currentUser.createdAt
                              ? new Date(currentUser.createdAt).toLocaleDateString("zh-CN")
                              : "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Last Login
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            {currentUser.lastLogin
                              ? new Date(currentUser.lastLogin).toLocaleDateString("zh-CN")
                              : "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Articles"
                value="0"
                description="Published blog posts"
                icon="fileText"
                variant="default"
              />
              <StatCard
                title="Total Views"
                value="0"
                description="Page views this month"
                icon="eye"
                variant="success"
              />
              <StatCard
                title="Total Comments"
                value="0"
                description="Reader comments"
                icon="messageCircle"
                variant="warning"
              />
              <StatCard
                title="Total Tags"
                value={tagsTotal}
                description="Article labels"
                icon="tag"
                variant="danger"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Categories Section */}
              <div className="lg:col-span-1">
                <CategoryTree />
              </div>

              {/* Tags Section */}
              <Card className="lg:col-span-1 glass card-hover">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Icons.tag className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Tags</CardTitle>
                        <CardDescription>Label your articles</CardDescription>
                      </div>
                    </div>
                    {tagsTotal > 0 && (
                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200">
                        {tagsTotal}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <Separator className="mb-6" />
                <CardContent>
                  <TagList onTotalChange={handleTagsTotalChange} />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="lg:col-span-1 glass card-hover">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Icons.zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                      <CardDescription>Common tasks</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <Separator className="mb-6" />
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start btn-modern" variant="outline">
                      <Icons.plus className="w-4 h-4 mr-2" />
                      New Article
                    </Button>
                    <Button className="w-full justify-start btn-modern" variant="outline">
                      <Icons.upload className="w-4 h-4 mr-2" />
                      Upload Images
                    </Button>
                    <Button className="w-full justify-start btn-modern" variant="outline">
                      <Icons.settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Articles */}
              <Card className="lg:col-span-3 glass card-hover">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <Icons.fileText className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Recent Articles</CardTitle>
                        <CardDescription>Your latest blog posts</CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="btn-modern">
                      <Icons.externalLink className="w-4 h-4" />
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <Separator className="mb-6" />
                <CardContent>
                  <EmptyState
                    icon="fileText"
                    title="No articles yet"
                    description="Start writing your first blog post and share your thoughts with the world"
                    action={{
                      label: "Write Your First Article",
                      onClick: () => console.log("Create article"),
                      icon: "plus"
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
