"use client";

import { useState } from "react";
import authService from "@/services/auth.service";
import oAuthService from "@/services/oauth.service";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { OAuthProvider } from "@/types/api/auth.types";

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setLoadingProvider(provider);
    setError(null);
    
    const providerConfig = oAuthService.getProviderConfig(provider);
    
    try {
      const response = await authService.initiateOAuth(provider);
      if (response.redirectURL) {
        window.location.href = response.redirectURL;
      } else {
        setError(`无法获取${providerConfig.displayName}登录链接，请稍后再试。`);
        setLoadingProvider(null);
      }
    } catch (err) {
      console.error(`${provider} login initiation failed:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `${providerConfig.displayName}登录启动失败，请检查网络或联系管理员。`,
      );
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-500/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md glass border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="space-y-4">
            <div className="relative mx-auto w-16 h-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Icons.logo className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-background flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                欢迎回来
              </h1>
              <p className="text-muted-foreground">
                使用您的 GitHub 账户登录 Aris Blog
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Icons.alertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">登录失败</span>
              </div>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          )}

          {/* OAuth登录按钮 */}
          <div className="space-y-4">
            {oAuthService.getSupportedProviders().map((provider) => {
              const config = oAuthService.getProviderConfig(provider);
              const isLoading = loadingProvider === provider;
              const IconComponent = Icons[config.icon as keyof typeof Icons];
              
              return (
                <Button
                  key={provider}
                  variant="outline"
                  type="button"
                  onClick={() => handleOAuthLogin(provider)}
                  disabled={loadingProvider !== null}
                  className="w-full h-12 btn-modern border-border/50 hover:bg-accent/50 hover:border-accent/50 transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Icons.spinner className="w-4 h-4 animate-spin" />
                      <span>正在连接...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span>使用 {config.displayName} 登录</span>
                    </div>
                  )}
                </Button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border/50">
            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              点击登录，即表示您同意我们的
              <a href="#" className="text-primary hover:underline mx-1">服务条款</a>
              和
              <a href="#" className="text-primary hover:underline mx-1">隐私政策</a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 底部装饰 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-xs text-muted-foreground/60">
          © 2024 Aris Blog. All rights reserved.
        </p>
      </div>
    </div>
  );
}
