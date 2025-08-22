"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { arisSDK } from "@/lib/sdk";
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
import ArticleList from "@/components/ArticleList";
import Link from "next/link";
import AppIcon from "@/components/AppIcon";
import { appConfig } from "@/config/app";
import { CategoryTree } from "@/components/CategoryTree";
import { ThemeToggle } from "@/components/ThemeToggle";
import { hasCreatorAccess } from "@/lib/permissions";

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagsTotal, setTagsTotal] = useState<number>(0);
  const [articlesTotal, setArticlesTotal] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    arisSDK.auth
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
      await arisSDK.auth.logout();
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

  const handleArticlesTotalChange = (total: number) => {
    setArticlesTotal(total);
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
        data-oid="p20zdnw"
      >
        <div className="text-center" data-oid=":uqprgm">
          <Icons.spinner
            className="h-12 w-12 animate-spin mx-auto text-blue-600"
            data-oid="ag7p3if"
          />

          <p
            className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300"
            data-oid="h_zjz7m"
          >
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!localStorage.getItem("accessToken") && !currentUser) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
        data-oid="bdgni_e"
      >
        <div className="text-center" data-oid="2buxytp">
          <p
            className="text-lg mb-4 text-gray-700 dark:text-gray-300"
            data-oid="wz84:wl"
          >
            Redirecting to login...
          </p>
          <Icons.spinner
            className="h-10 w-10 animate-spin mx-auto text-blue-600"
            data-oid="yvfqprx"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      data-oid="y7049e."
    >
      {/* Header */}
      <header
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
        data-oid="ilkcq-5"
      >
        <div className="container mx-auto px-6 py-4" data-oid=":crb_x0">
          <div className="flex items-center justify-between" data-oid="mhqz0f2">
            <div className="flex items-center gap-4" data-oid="82jpkpa">
              <div className="flex items-center gap-2" data-oid="26-20g2">
                <AppIcon size="md" data-oid="pkx4e5d" />
                <h1
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                  data-oid="e8n5:kh"
                >
                  {appConfig.name}
                </h1>
              </div>
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex"
                data-oid="6x-91-3"
              >
                Dashboard
              </Badge>
            </div>

            <div className="flex items-center space-x-4" data-oid="_kb7a95">
              {currentUser && (
                <div className="flex items-center space-x-3" data-oid="1w0pbuq">
                  <div
                    className="hidden md:block text-right"
                    data-oid="eo-:2wa"
                  >
                    <p
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      data-oid="z0qbw0l"
                    >
                      {currentUser.name}
                    </p>
                    <p
                      className="text-xs text-gray-500 dark:text-gray-400"
                      data-oid="azj.z7f"
                    >
                      {currentUser.email}
                    </p>
                  </div>
                  <Avatar
                    className="w-10 h-10 border-2 border-blue-200 dark:border-blue-700"
                    data-oid="hkrxhj6"
                  >
                    <AvatarImage
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      data-oid="6e0h5ur"
                    />

                    <AvatarFallback
                      className="bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 font-semibold"
                      data-oid="y0wv4kg"
                    >
                      {currentUser.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {currentUser.permission === "admin" && (
                    <Badge
                      variant="default"
                      className="hidden sm:inline-flex text-xs"
                      data-oid="63wgqj:"
                    >
                      Admin
                    </Badge>
                  )}
                </div>
              )}
              {currentUser && hasCreatorAccess(currentUser.role) && (
                <Button
                  onClick={() => router.push("/articles/create")}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200"
                >
                  <Icons.plus className="w-4 h-4 mr-2" />
                  Create Article
                </Button>
              )}
              <ThemeToggle />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                data-oid="uozz6_a"
              >
                <Icons.logOut className="w-4 h-4 mr-2" data-oid="3gl:qm." />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8" data-oid="e40_agh">
        {error && (
          <Card
            className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
            data-oid="kv17vgv"
          >
            <CardHeader data-oid="5:cjyuk">
              <CardTitle
                className="text-red-800 dark:text-red-200 flex items-center"
                data-oid="6q9p6.7"
              >
                <Icons.alertCircle
                  className="w-5 h-5 mr-2"
                  data-oid="t-e7vj4"
                />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="i8w37fk">
              <p className="text-red-700 dark:text-red-300" data-oid="sk.7mn6">
                {error}
              </p>
              {!currentUser && (
                <Button
                  onClick={() => router.push("/login")}
                  className="mt-3"
                  size="sm"
                  data-oid="al5kysd"
                >
                  Go to Login
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {currentUser && (
          <>
            {/* User Profile Overview */}
            <Card
              className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800"
              data-oid="d2:iy-."
            >
              <CardHeader className="pb-3" data-oid="ta.asjo">
                <div className="flex items-center space-x-2" data-oid="5177sld">
                  <Icons.user
                    className="w-5 h-5 text-blue-600"
                    data-oid="ykuq19p"
                  />

                  <CardTitle
                    className="text-lg text-blue-800 dark:text-blue-200"
                    data-oid="o3-t2u_"
                  >
                    Your Profile
                  </CardTitle>
                </div>
              </CardHeader>
              <Separator data-oid="gnza16s" />
              <CardContent data-oid="9fiwbl8">
                <div className="flex items-center space-x-6" data-oid="qrcfsl4">
                  <Avatar
                    className="w-20 h-20 border-4 border-blue-200 dark:border-blue-700"
                    data-oid="akx8-_2"
                  >
                    <AvatarImage
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      data-oid="7gj4rxy"
                    />

                    <AvatarFallback
                      className="bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200 text-2xl font-bold"
                      data-oid="h:.jn5e"
                    >
                      {currentUser.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1" data-oid="pio.rag">
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      data-oid=":vo56r."
                    >
                      <div data-oid="0jy:i7c">
                        <p
                          className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                          data-oid="pc5v6br"
                        >
                          Username
                        </p>
                        <p
                          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                          data-oid="2cv7.k_"
                        >
                          {currentUser.name || "Not set"}
                        </p>
                      </div>
                      <div data-oid="9ext8df">
                        <p
                          className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                          data-oid="9m12fc9"
                        >
                          Email
                        </p>
                        <p
                          className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center"
                          data-oid="k:dqdfr"
                        >
                          <Icons.mail
                            className="w-4 h-4 mr-2 text-gray-500"
                            data-oid="qh3wp:u"
                          />

                          {currentUser.email || "Not set"}
                        </p>
                      </div>
                      <div data-oid="k3y1.94">
                        <p
                          className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                          data-oid="28wld.6"
                        >
                          User ID
                        </p>
                        <p
                          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                          data-oid="6zo5ea6"
                        >
                          #{currentUser.userID}
                        </p>
                      </div>
                      <div data-oid="iub-xk2">
                        <p
                          className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                          data-oid="dhnolad"
                        >
                          Permission
                        </p>
                        <Badge
                          variant={
                            currentUser.permission === "admin"
                              ? "default"
                              : "secondary"
                          }
                          className="text-sm"
                          data-oid="x0rkeda"
                        >
                          {currentUser.permission || "user"}
                        </Badge>
                      </div>
                      <div data-oid=":6ifxwl">
                        <p
                          className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                          data-oid="mt17kpl"
                        >
                          Member Since
                        </p>
                        <p
                          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                          data-oid=":25jdak"
                        >
                          {currentUser.createdAt
                            ? new Date(
                                currentUser.createdAt,
                              ).toLocaleDateString("zh-CN")
                            : "Unknown"}
                        </p>
                      </div>
                      <div data-oid="hwuu14f">
                        <p
                          className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
                          data-oid="q179f.3"
                        >
                          Last Login
                        </p>
                        <p
                          className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                          data-oid=".eqm4s2"
                        >
                          {currentUser.lastLogin
                            ? new Date(
                                currentUser.lastLogin,
                              ).toLocaleDateString("zh-CN")
                            : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="space-y-6" data-oid="i.5t7s6">
              {/* Articles Section */}
              <Card
                className="hover:shadow-lg transition-shadow duration-200"
                data-oid="ljmmp.h"
              >
                <CardHeader className="pb-3" data-oid="cczhq3v">
                  <div
                    className="flex items-center justify-between"
                    data-oid="0keo1pq"
                  >
                    <div
                      className="flex items-center space-x-2"
                      data-oid="0wgd6ag"
                    >
                      <Icons.fileText
                        className="w-5 h-5 text-blue-600"
                        data-oid=":wzs2rs"
                      />

                      <CardTitle className="text-lg" data-oid="rnk3.uq">
                        Articles
                      </CardTitle>
                    </div>
                    {articlesTotal > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                        data-oid="cps9isn"
                      >
                        {articlesTotal}
                      </Badge>
                    )}
                  </div>
                  <CardDescription data-oid="jy718_a">
                    Your blog posts
                  </CardDescription>
                </CardHeader>
                <Separator data-oid="-ridj6s" />
                <CardContent data-oid="rs553l5">
                  <ArticleList
                    onTotalChange={handleArticlesTotalChange}
                    data-oid="yii2_cd"
                  />
                </CardContent>
              </Card>

              {/* Categories and Tags Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Categories Section - Only show for creators and admins */}
                {hasCreatorAccess(currentUser?.permission) && (
                  <div className="lg:col-span-1">
                    <CategoryTree />
                  </div>
                )}

                {/* Tags Section */}
                <Card
                  className="hover:shadow-lg transition-shadow duration-200"
                  data-oid="fmdvtp-"
                >
                  <CardHeader className="pb-3" data-oid="9mps8zr">
                    <div
                      className="flex items-center justify-between"
                      data-oid="07e12u0"
                    >
                      <div
                        className="flex items-center space-x-2"
                        data-oid=".5b6.4e"
                      >
                        <Icons.tag
                          className="w-5 h-5 text-orange-600"
                          data-oid="l1f9:y0"
                        />

                        <CardTitle className="text-lg" data-oid="742rsz0">
                          Tags
                        </CardTitle>
                      </div>
                      {tagsTotal > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                          data-oid="cps9isn"
                        >
                          {tagsTotal}
                        </Badge>
                      )}
                    </div>
                    <CardDescription data-oid="c7dbdmt">
                      Label your articles
                    </CardDescription>
                  </CardHeader>
                  <Separator data-oid="spb6_iv" />
                  <CardContent data-oid="j.j82x7">
                    <TagList
                      onTotalChange={handleTagsTotalChange}
                      data-oid="yii2_cd"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
