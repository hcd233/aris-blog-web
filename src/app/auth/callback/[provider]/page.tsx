"use client";

import { useEffect, Suspense, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import authService from "@/services/auth.service";
import oAuthService from "@/services/oauth.service";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import type { OAuthProvider } from "@/types/api/auth.types";

interface OAuthCallbackProps {
  params: Promise<{
    provider: string;
  }>;
}

function OAuthCallbackContent({ provider }: { provider: OAuthProvider }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const hasProcessed = useRef(false);

  const providerConfig = oAuthService.getProviderConfig(provider);

  useEffect(() => {
    // 使用 useRef 防止重复调用，即使组件重新渲染也不会重置
    if (hasProcessed.current) {
      console.log(`[CallbackPage] Already processed ${provider} callback, skipping`);
      return;
    }

    if (code && state) {
      hasProcessed.current = true;
      console.log(`[CallbackPage] Setting hasProcessed to true for ${provider}`);
      
      // 调试日志：查看实际获取到的参数
      console.log(`[CallbackPage] Processing ${provider} OAuth callback:`, {
        code: code,
        state: state,
        codeLength: code.length,
        stateLength: state.length
      });
      
      authService
        .handleOAuthCallback(provider, code, state)
        .then((data) => {
          console.log(
            `[CallbackPage] Data received from ${provider} OAuth callback:`,
            data,
          );

          if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            console.log(
              `[CallbackPage] accessToken set in localStorage:`,
              data.accessToken,
            );
          } else {
            console.warn(
              `[CallbackPage] No accessToken received from ${provider}:`,
              data,
            );
          }

          if (data.refreshToken) {
            localStorage.setItem("refreshToken", data.refreshToken);
            console.log(
              `[CallbackPage] refreshToken set in localStorage:`,
              data.refreshToken,
            );
          } else {
            console.warn(
              `[CallbackPage] No refreshToken received from ${provider}:`,
              data,
            );
          }

          toast.success("登录成功", {
            description: `您已成功使用 ${providerConfig.displayName} 登录。`,
          });
          router.push("/");
        })
        .catch((error) => {
          console.error(`${provider} OAuth callback error:`, error);
          toast.error("登录失败", {
            description:
              error.message ||
              `使用 ${providerConfig.displayName} 登录时发生错误。`,
          });
          router.push(`/login?error=oauth_callback_failed&provider=${provider}`);
        });
    } else {
      const errorParam = searchParams.get("error");
      const errorDescriptionParam = searchParams.get("error_description");

      let errorMessage = `缺少 ${providerConfig.displayName} OAuth 回调所需的 code 或 state 参数。`;
      if (errorParam) {
        errorMessage = `${providerConfig.displayName} OAuth 错误: ${errorParam}. ${errorDescriptionParam || ""}`;
      }
      console.error(errorMessage);
      toast.error("登录失败", {
        description: errorMessage,
      });
      router.push(`/login?error=${errorParam || "oauth_missing_params"}&provider=${provider}`);
    }
  }, [code, state, router, searchParams, provider, providerConfig]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Icons.spinner className="h-12 w-12 animate-spin" />
      <p className="ml-4 mt-4 text-lg">
        正在处理 {providerConfig.displayName} 登录...
      </p>
      <p className="text-sm text-muted-foreground">
        请稍等，我们正在验证您的身份。
      </p>
    </div>
  );
}

export default function OAuthCallbackPage({ params }: OAuthCallbackProps) {
  const [provider, setProvider] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 异步获取路由参数
    params
      .then(({ provider: resolvedProvider }) => {
        if (oAuthService.isSupportedProvider(resolvedProvider)) {
          setProvider(resolvedProvider as OAuthProvider);
        } else {
          setError('Unsupported provider');
        }
      })
      .catch((err) => {
        console.error('Failed to resolve params:', err);
        setError('Failed to load page parameters');
      });
  }, [params]);

  // 加载中状态
  if (provider === null && error === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Icons.spinner className="h-12 w-12 animate-spin" />
        <p className="ml-4 mt-4 text-lg">Loading...</p>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Icons.alertTriangle className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-lg">页面加载失败</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  // 检查是否为支持的OAuth提供商
  if (provider && !oAuthService.isSupportedProvider(provider)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Icons.alertTriangle className="h-12 w-12 text-destructive" />
        <p className="mt-4 text-lg">不支持的OAuth提供商</p>
        <p className="text-sm text-muted-foreground">
          提供商 {provider} 不受支持。
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Icons.spinner className="h-12 w-12 animate-spin" />
          <p className="ml-4 mt-4 text-lg">Loading callback page...</p>
        </div>
      }
    >
      <OAuthCallbackContent provider={provider as OAuthProvider} />
    </Suspense>
  );
} 