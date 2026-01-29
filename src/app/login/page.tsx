"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PenLine, Github, Loader2 } from "lucide-react";
import { oauth2Login } from "@/lib/api/config";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: "github" | "google") => {
    setIsLoading(provider);
    try {
      const { data, error } = await oauth2Login({
        query: { platform: provider },
      });

      if (error || !data?.redirectURL) {
        console.error("登录失败:", error);
        alert("登录失败，请重试");
        return;
      }

      // 重定向到 OAuth2 登录页面
      window.location.href = data.redirectURL;
    } catch (err) {
      console.error("登录错误:", err);
      alert("登录出错，请重试");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-[400px]">
        <div className={cn(
          "rounded-2xl shadow-2xl overflow-hidden",
          "bg-white dark:bg-[#111111]",
          "border border-gray-200 dark:border-[#2a2a2a]"
        )}>
          {/* Header */}
          <div className="pt-10 pb-6 px-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <PenLine className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Aris Blog</span>
            </Link>
            
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              登录到 Aris Blog
            </h1>
            <p className="text-gray-500 dark:text-[#666] text-sm">
              欢迎回来！请登录以继续
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="px-8 space-y-3">
            <Button
              variant="outline"
              className={cn(
                "w-full h-11 font-normal",
                "bg-gray-100 dark:bg-[#1a1a1a]",
                "border-gray-200 dark:border-[#2a2a2a]",
                "text-gray-900 dark:text-white",
                "hover:bg-gray-200 dark:hover:bg-[#222] hover:border-gray-300 dark:hover:border-[#333]"
              )}
              onClick={() => handleOAuthLogin("github")}
              disabled={isLoading !== null}
            >
              {isLoading === "github" ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Github className="w-5 h-5 mr-2" />
              )}
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className={cn(
                "w-full h-11 font-normal",
                "bg-gray-100 dark:bg-[#1a1a1a]",
                "border-gray-200 dark:border-[#2a2a2a]",
                "text-gray-900 dark:text-white",
                "hover:bg-gray-200 dark:hover:bg-[#222] hover:border-gray-300 dark:hover:border-[#333]"
              )}
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading !== null}
            >
              {isLoading === "google" ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="px-8 py-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-gray-200 dark:bg-[#2a2a2a]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={cn(
                  "px-2",
                  "bg-white dark:bg-[#111111]",
                  "text-gray-400 dark:text-[#666]"
                )}>or</span>
              </div>
            </div>
          </div>

          {/* Email Form */}
          <div className="px-8 pb-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-900 dark:text-white mb-2 block">
                  邮箱地址
                </label>
                <Input
                  type="email"
                  placeholder="请输入邮箱地址"
                  className={cn(
                    "h-11",
                    "bg-gray-100 dark:bg-[#1a1a1a]",
                    "border-gray-200 dark:border-[#2a2a2a]",
                    "text-gray-900 dark:text-white",
                    "placeholder:text-gray-400 dark:placeholder:text-[#555]",
                    "focus:border-gray-300 dark:focus:border-[#444] focus:ring-0"
                  )}
                />
              </div>
              
              <Button 
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium"
                onClick={() => alert("邮箱登录功能开发中")}
              >
                Continue
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>

            <div className="mt-4 text-center">
              <button className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 text-sm transition-colors">
                使用 Passkey 登录
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className={cn(
            "px-8 py-4 border-t",
            "bg-gray-50 dark:bg-[#0d0d0d]",
            "border-gray-200 dark:border-[#1a1a1a]"
          )}>
            <p className="text-center text-sm text-gray-500 dark:text-[#666]">
              还没有账号？{" "}
              <Link 
                href="/register" 
                className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors"
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 dark:text-[#444] text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secured by Aris Blog</span>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-gray-400 dark:text-[#444]">
          <Link href="/support" className="hover:text-gray-600 dark:hover:text-[#666] transition-colors">
            帮助中心
          </Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-gray-600 dark:hover:text-[#666] transition-colors">
            隐私政策
          </Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-gray-600 dark:hover:text-[#666] transition-colors">
            服务条款
          </Link>
        </div>
      </div>
    </div>
  );
}
