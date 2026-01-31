"use client";

import { useEffect, useRef, useState } from "react";
import { oauth2Callback } from "@/lib/api/config";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OAuthCallbackHandlerProps {
  provider?: string | null;
  code?: string | null;
  state?: string | null;
  onComplete?: () => void;
}

export function OAuthCallbackHandler({
  provider,
  code,
  state,
  onComplete,
}: OAuthCallbackHandlerProps) {
  const { login } = useAuth();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [providerName, setProviderName] = useState("");

  useEffect(() => {
    if (hasProcessed.current || !provider || !code || !state) return;
    
    const name = provider === "github" ? "GitHub" : provider === "google" ? "Google" : "";
    setProviderName(name);
    
    const handleCallback = async () => {
      hasProcessed.current = true;
      
      // 验证 provider
      if (provider !== "github" && provider !== "google") {
        setStatus("error");
        toast.error("不支持的登录方式");
        setTimeout(() => onComplete?.(), 2000);
        return;
      }
      
      try {
        // 调用后端回调 API
        const { data, error } = await oauth2Callback({
          body: {
            platform: provider as "github" | "google",
            code,
            state,
          },
        });

        if (error || !data?.accessToken || !data?.refreshToken) {
          console.error("登录失败:", error);
          setStatus("error");
          toast.error("登录失败", {
            description: "请重新尝试登录",
          });
          setTimeout(() => onComplete?.(), 2000);
          return;
        }

        // 登录成功，保存 token
        login(data.accessToken, data.refreshToken);
        
        setStatus("success");
        toast.success("登录成功！", {
          description: "欢迎回来",
        });
        
        // 延迟关闭弹窗
        setTimeout(() => onComplete?.(), 1500);
      } catch (err) {
        console.error("登录错误:", err);
        setStatus("error");
        toast.error("登录过程中发生错误", {
          description: "请重新尝试登录",
        });
        setTimeout(() => onComplete?.(), 2000);
      }
    };

    handleCallback();
  }, [provider, code, state, login, onComplete]);

  if (!provider || !code || !state) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={cn(
        "w-[280px] rounded-xl shadow-lg border p-4",
        status === "loading" && "bg-card border-border",
        status === "success" && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        status === "error" && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      )}>
        <div className="flex items-center gap-3">
          {status === "loading" && (
            <>
              <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  正在通过 {providerName} 登录
                </p>
                <p className="text-xs text-muted-foreground">请稍候...</p>
              </div>
            </>
          )}
          
          {status === "success" && (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  登录成功！
                </p>
                <p className="text-xs text-green-600/80 dark:text-green-400/80">
                  欢迎回来
                </p>
              </div>
            </>
          )}
          
          {status === "error" && (
            <>
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  登录失败
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80">
                  请重新尝试
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
