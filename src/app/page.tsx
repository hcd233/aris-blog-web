'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import type { CurrentUser } from '@/types/api/auth.types';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import TagList from '@/components/TagList';
import AppIcon from '@/components/AppIcon';
import { appConfig } from '@/config/app';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagsTotal, setTagsTotal] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.replace('/login');
      return;
    }

    authService.getCurrentUser()
      .then((data) => {
        console.log('[HomePage] Raw getCurrentUser response:', data);
        setCurrentUser(data);
      })
      .catch((err) => {
        console.error("Failed to fetch current user:", err);
        setError(err.message || 'Failed to load user information. Please try logging in again.');
        // Potentially redirect to login if auth error (e.g., token expired)
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          toast.error("Session expired or invalid", { description: "Please log in again." });
          router.replace('/login');
        } else {
            toast.error("Error loading user data", { description: err.message });
        }
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.success("Logged out successfully");
      router.push('/login');
    } catch (e: any) {
      console.error("Logout failed:", e);
      toast.error("Logout failed", { description: e.message || "Could not log out." });
    }
  };

  const handleTagsTotalChange = (total: number) => {
    setTagsTotal(total);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Icons.spinner className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!localStorage.getItem('accessToken') && !currentUser) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">Redirecting to login...</p>
            <Icons.spinner className="h-10 w-10 animate-spin mx-auto text-blue-600" />
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <AppIcon size="md" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {appConfig.name}
                </h1>
              </div>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                Dashboard
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.email}
                    </p>
                  </div>
                  <Avatar className="w-10 h-10 border-2 border-blue-200 dark:border-blue-700">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 font-semibold">
                      {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {currentUser.permission === 'admin' && (
                    <Badge variant="default" className="hidden sm:inline-flex text-xs">
                      Admin
                    </Badge>
                  )}
                </div>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm">
                <Icons.logOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-200 flex items-center">
                <Icons.alertCircle className="w-5 h-5 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 dark:text-red-300">{error}</p>
              {!currentUser && (
                <Button onClick={() => router.push('/login')} className="mt-3" size="sm">
                  Go to Login
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {currentUser && (
          <>
            {/* User Profile Overview */}
            <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Icons.user className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg text-blue-800 dark:text-blue-200">Your Profile</CardTitle>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="w-20 h-20 border-4 border-blue-200 dark:border-blue-700">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 text-2xl font-bold">
                      {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Username</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {currentUser.name || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                          <Icons.mail className="w-4 h-4 mr-2 text-gray-500" />
                          {currentUser.email || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">User ID</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          #{currentUser.userID}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Permission</p>
                        <Badge 
                          variant={currentUser.permission === 'admin' ? 'default' : 'secondary'} 
                          className="text-sm"
                        >
                          {currentUser.permission || 'user'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Member Since</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('zh-CN') : 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Last Login</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString('zh-CN') : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Categories Section */}
              <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icons.folder className="w-5 h-5 text-purple-600" />
                      <CardTitle className="text-lg">Categories</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Icons.plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription>Organize your content</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Icons.folder className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-4">No categories yet</p>
                    <Button variant="outline" size="sm">
                      <Icons.plus className="w-4 h-4 mr-2" />
                      Create First Category
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tags Section */}
              <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icons.tag className="w-5 h-5 text-orange-600" />
                      <CardTitle className="text-lg">Tags</CardTitle>
                    </div>
                    {tagsTotal > 0 && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                        {tagsTotal}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Label your articles</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <TagList onTotalChange={handleTagsTotalChange} />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Icons.zap className="w-5 h-5 text-yellow-600" />
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </div>
                  <CardDescription>Common tasks</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Icons.plus className="w-4 h-4 mr-2" />
                      New Article
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Icons.upload className="w-4 h-4 mr-2" />
                      Upload Images
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Icons.settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Articles */}
              <Card className="lg:col-span-3 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icons.fileText className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">Recent Articles</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Icons.externalLink className="w-4 h-4" />
                      View All
                    </Button>
                  </div>
                  <CardDescription>Your latest blog posts</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Icons.fileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No articles yet</h3>
                    <p className="text-sm text-gray-500 mb-6">Start writing your first blog post</p>
                    <Button>
                      <Icons.plus className="w-4 h-4 mr-2" />
                      Write Your First Article
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
