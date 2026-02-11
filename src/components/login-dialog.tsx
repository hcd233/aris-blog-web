"use client";

import { useState } from "react";
import { Github, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { oauth2Login } from "@/lib/api-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

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

  const handleSendCode = () => {
    toast.info("开发中", {
      description: "手机验证码登录功能正在开发中",
    });
  };

  const handlePhoneLogin = () => {
    toast.info("开发中", {
      description: "手机验证码登录功能正在开发中",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-[800px] p-0 gap-0 overflow-hidden border-0 bg-white dark:bg-[#111111] max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col md:flex-row md:h-[520px]">
          {/* 左侧 - OAuth 登录 */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-8 py-8 md:py-6 md:border-r border-gray-100 dark:border-[#2a2a2a]">
            {/* Header Tag */}
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 text-sm">
                登录后推荐更懂你的笔记
              </div>
            </div>

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-3">
                <span className="text-white font-bold text-2xl">Aris</span>
              </div>
            </div>

            {/* OAuth Buttons - 替换扫码区域 */}
            <div className="w-full max-w-[280px] space-y-3">
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 font-normal text-base rounded-full",
                  "bg-white dark:bg-[#1a1a1a]",
                  "border-gray-200 dark:border-[#2a2a2a]",
                  "text-gray-900 dark:text-white",
                  "hover:bg-gray-50 dark:hover:bg-[#222] hover:border-gray-300 dark:hover:border-[#333]"
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
                  "bg-white dark:bg-[#1a1a1a]",
                  "border-gray-200 dark:border-[#2a2a2a]",
                  "text-gray-900 dark:text-white",
                  "hover:bg-gray-50 dark:hover:bg-[#222] hover:border-gray-300 dark:hover:border-[#333]"
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

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                登录即代表同意
                <span className="text-gray-600 dark:text-gray-400 cursor-pointer hover:underline">《用户协议》</span>
                <span className="text-gray-600 dark:text-gray-400 cursor-pointer hover:underline">《隐私政策》</span>
              </p>
            </div>
          </div>

          {/* 右侧 - 手机验证码登录（禁用） - 桌面端显示 */}
          <div className="hidden md:flex flex-1 flex-col px-8 py-6 relative bg-gray-50/50 dark:bg-[#0a0a0a]/50">
            {/* Close Button - 只在右侧显示 */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 z-10 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center">
                手机号登录
              </h3>
              
              {/* 手机号登录提示 */}
              <div className="mb-6 mx-auto max-w-[280px] text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <span className="text-amber-600 dark:text-amber-400 text-xs">目前仅支持 GitHub 和 Google 登录</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">手机号登录功能敬请期待</p>
              </div>

              <div className="space-y-4 max-w-[280px] mx-auto w-full">
                {/* 手机号输入 */}
                <div className="relative">
                  <div className="flex items-center border border-gray-200 dark:border-[#2a2a2a] rounded-full bg-white dark:bg-[#1a1a1a] px-4 h-12">
                    <span className="text-gray-500 text-sm mr-2">+86</span>
                    <div className="w-px h-4 bg-gray-200 dark:bg-[#333] mr-3" />
                    <Input
                      type="tel"
                      placeholder="输入手机号"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled
                      className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 text-gray-900 dark:text-white placeholder:text-gray-300 disabled:opacity-100"
                    />
                  </div>
                </div>

                {/* 验证码输入 */}
                <div className="relative">
                  <div className="flex items-center border border-gray-200 dark:border-[#2a2a2a] rounded-full bg-white dark:bg-[#1a1a1a] px-4 h-12">
                    <Input
                      type="text"
                      placeholder="输入验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled
                      className="flex-1 border-0 bg-transparent p-0 focus-visible:ring-0 text-gray-900 dark:text-white placeholder:text-gray-300 disabled:opacity-100"
                    />
                    <button
                      onClick={handleSendCode}
                      disabled
                      className="text-red-400 text-sm font-medium disabled:opacity-50 whitespace-nowrap ml-2"
                    >
                      获取验证码
                    </button>
                  </div>
                </div>

                {/* 登录按钮 */}
                <Button
                  className="w-full h-12 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-50"
                  onClick={handlePhoneLogin}
                  disabled
                >
                  登录
                </Button>

                {/* 协议 */}
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-400">
                    我已阅读并同意
                    <span className="text-gray-600 dark:text-gray-400">《用户协议》</span>
                    <span className="text-gray-600 dark:text-gray-400">《隐私政策》</span>
                    <span className="text-gray-600 dark:text-gray-400">《儿童/青少年个人信息保护规则》</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">新用户可直接登录</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
