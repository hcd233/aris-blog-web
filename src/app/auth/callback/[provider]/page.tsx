"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { oauth2Callback } from "@/lib/api/config";
import { useAuth } from "@/lib/auth";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("正在处理登录...");
  const hasProcessed = useRef(false);

  const provider = params?.provider as "github" | "google";
  const code = searchParams?.get("code");
  const state = searchParams?.get("state");

  useEffect(() => {
    if (hasProcessed.current) return;
    
    const handleCallback = async () => {
      hasProcessed.current = true;
      
      // 验证参数
      if (!provider || !code || !state) {
        setStatus("error");
        setMessage("登录参数不完整，请重试");
        return;
      }

      // 验证 provider
      if (provider !== "github" && provider !== "google") {
        setStatus("error");
        setMessage("不支持的登录方式");
        return;
      }

      try {
        // 调用后端回调 API
        const { data, error } = await oauth2Callback({
          body: {
            platform: provider,
            code,
            state,
          },
        });

        if (error || !data?.accessToken || !data?.refreshToken) {
          console.error("登录失败:", error);
          setStatus("error");
          setMessage("登录失败，请重试");
          return;
        }

        // 登录成功，保存 token
        login(data.accessToken, data.refreshToken);
        
        setStatus("success");
        setMessage("登录成功！正在跳转...");
        
        // 延迟跳转到首页
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } catch (err) {
        console.error("登录错误:", err);
        setStatus("error");
        setMessage("登录过程中发生错误，请重试");
      }
    };

    handleCallback();
  }, [provider, code, state, login, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[400px]">
        <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl shadow-2xl p-12 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
              <p className="text-white text-lg">{message}</p>
              <p className="text-[#666] text-sm">正在通过 {provider === "github" ? "GitHub" : "Google"} 登录</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="text-white text-lg">{message}</p>
              <p className="text-[#666] text-sm">即将跳转到首页</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-12 h-12 text-red-500" />
              <p className="text-white text-lg">{message}</p>
              <button
                onClick={() => router.push("/login")}
                className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                返回登录页
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
