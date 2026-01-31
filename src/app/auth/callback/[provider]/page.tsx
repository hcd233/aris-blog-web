"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const provider = params?.provider as string;
  const code = searchParams?.get("code");
  const state = searchParams?.get("state");

  useEffect(() => {
    // 重定向到首页，保留回调参数
    // 首页会检测这些参数并显示处理弹窗
    if (code && state && provider) {
      window.location.href = `/?provider=${encodeURIComponent(provider)}&code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
    } else {
      window.location.href = "/";
    }
  }, [code, state, provider]);

  return null;
}
