"use client";

import { useState, useEffect } from "react";
import { Github, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { oauth2Login } from "@/lib/api-config";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function MobileLoginDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // 监听认证状态，未登录时自动弹出
  useEffect(() => {
    if (!isAuthenticated) {
      // 检查是否是 OAuth2 回调页面（包含 code 和 state 参数）
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      
      // 如果是 OAuth2 回调，不弹出抽屉
      if (code && state) {
        return;
      }
      
      // 延迟一点显示，避免页面加载时立即弹出影响体验
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated]);

  const handleOAuthLogin = async (provider: "github" | "google") => {
    setIsLoading(provider);
    try {
      const { data, error } = await oauth2Login({
        query: { platform: provider },
      });

      if (error || !data?.redirectURL) {
        console.error("登录失败:", error);
        toast.error("登录失败", {
          description: "请检查网络连接后重试",
        });
        return;
      }

      // 重定向到 OAuth2 登录页面
      window.location.href = data.redirectURL;
    } catch (err) {
      console.error("登录错误:", err);
      toast.error("登录出错", {
        description: "请稍后重试",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // 如果已登录，不渲染
  if (isAuthenticated) return null;

  return (
    <>
      {/* 背景遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 md:hidden animate-in fade-in duration-200"
          onClick={handleClose}
        />
      )}

      {/* 底部抽屉 */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "bg-[#1c1c1e] rounded-t-3xl",
          "transition-transform duration-300 ease-out",
          "shadow-2xl",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 pt-8 pb-10">
          {/* Logo 和标题 */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">Aris</span>
            </div>
            <p className="text-white/80 text-base">登录后推荐更懂你的笔记</p>
          </div>

          {/* OAuth 按钮 */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className={cn(
                "w-full h-12 font-normal text-base rounded-full",
                "bg-[#2c2c2e] border-0",
                "text-white",
                "hover:bg-[#3a3a3c]"
              )}
              onClick={() => handleOAuthLogin("github")}
              disabled={isLoading !== null}
            >
              {isLoading === "github" ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Github className="w-5 h-5 mr-2" />
              )}
              使用 GitHub 登录
            </Button>

            <Button
              variant="outline"
              className={cn(
                "w-full h-12 font-normal text-base rounded-full",
                "bg-[#2c2c2e] border-0",
                "text-white",
                "hover:bg-[#3a3a3c]"
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
              使用 Google 登录
            </Button>
          </div>

          {/* 协议提示 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              登录即代表同意
              <span className="text-gray-400 cursor-pointer">《用户协议》</span>
              <span className="text-gray-400 cursor-pointer">《隐私政策》</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
