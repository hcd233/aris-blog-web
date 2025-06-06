"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import authService from "@/services/auth.service";
import { Icons } from "@/components/icons";
import { toast } from "sonner"; // 从 sonner 导入 toast

function GitHubCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  useEffect(() => {
    if (code && state) {
      authService
        .handleGitHubOAuthCallback(code, state)
        .then((data) => {
          // DEBUG LOG: Log data received from backend
          console.log(
            "[CallbackPage] Data received from handleGitHubOAuthCallback:",
            data,
          );

          if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            // DEBUG LOG: Log token being set
            console.log(
              "[CallbackPage] accessToken set in localStorage:",
              data.accessToken,
            );
          } else {
            console.warn(
              "[CallbackPage] No accessToken received in data:",
              data,
            );
          }

          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
            console.log(
              "[CallbackPage] refreshToken set in localStorage:",
              data.refreshToken,
            );
          } else {
            console.warn(
              "[CallbackPage] No refreshToken received in data:",
              data,
            );
          }

          toast.success("Login Successful", {
            // 使用 sonner 的 success 方法
            description: "You have been successfully logged in with GitHub.",
          });
          router.push("/"); // 重定向到首页
        })
        .catch((error) => {
          console.error("GitHub OAuth callback error:", error);
          toast.error("Login Failed", {
            // 使用 sonner 的 error 方法
            description:
              error.message ||
              "An error occurred during GitHub OAuth callback.",
          });
          router.push("/login?error=oauth_callback_failed"); // 重定向回登录页并带上错误提示
        });
    } else {
      const errorParam = searchParams.get("error");
      const errorDescriptionParam = searchParams.get("error_description");

      let errorMessage = "Missing code or state in GitHub OAuth callback.";
      if (errorParam) {
        errorMessage = `GitHub OAuth Error: ${errorParam}. ${errorDescriptionParam || ""}`;
      }
      console.error(errorMessage);
      toast.error("Login Failed", {
        // 使用 sonner 的 error 方法
        description: errorMessage,
      });
      router.push(`/login?error=${errorParam || "oauth_missing_params"}`);
    }
  }, [code, state, router, searchParams]); // searchParams 加入依赖数组

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Icons.spinner className="h-12 w-12 animate-spin" />
      <p className="ml-4 mt-4 text-lg">处理Github登录中...</p>
      <p className="text-sm text-muted-foreground">
        请稍等，我们正在验证您的身份。
      </p>
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Icons.spinner className="h-12 w-12 animate-spin" />

          <p className="ml-4 mt-4 text-lg">Loading callback page...</p>
        </div>
      }
    >
      <GitHubCallback />
    </Suspense>
  );
}
