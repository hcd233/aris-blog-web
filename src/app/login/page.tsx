"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import authService from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.redirectToGitHubOAuth();
      if (response.redirectURL) {
        window.location.href = response.redirectURL;
      } else {
        setError("无法获取GitHub登录链接，请稍后再试。");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("GitHub login initiation failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "GitHub登录启动失败，请检查网络或联系管理员。",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Icons.logo className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">欢迎回来</h1>
          <p className="text-sm text-muted-foreground">
            使用您的 GitHub 账户登录 Aris Blog
          </p>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">错误!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <Button
          variant="outline"
          type="button"
          onClick={handleGitHubLogin}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}
          使用 GitHub 登录
        </Button>

        <p className="px-8 text-center text-sm text-muted-foreground">
          点击登录，即表示您同意我们的服务条款和隐私政策。
        </p>
      </div>
    </div>
  );
}
