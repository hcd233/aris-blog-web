'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { oauth2Callback, getCurrentUserInfo } from '@/api';
import { saveTokens, saveUser } from '@/lib/auth';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const providerParam = searchParams.get('provider') || 'github';
      const provider = (providerParam === 'google' ? 'google' : 'github') as 'github' | 'google';

      if (!code) {
        setError('缺少授权码');
        return;
      }

      try {
        // 调用后端完成 OAuth2 回调
        const response = await oauth2Callback(provider, {
          code,
          state: state || undefined,
        });

        // 保存 token
        saveTokens({
          access_token: response.accessToken,
          refresh_token: response.refreshToken,
        });

        // 获取用户信息
        const userResponse = await getCurrentUserInfo();
        saveUser({
          id: userResponse.user.userID,
          name: userResponse.user.name,
          email: userResponse.user.email,
          avatar_url: userResponse.user.avatar,
        });

        // 跳转到主页
        router.push('/home');
      } catch (err) {
        console.error('OAuth2 回调失败:', err);
        setError(err instanceof Error ? err.message : '登录失败');
        
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">登录失败</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">{error}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            正在跳转到登录页...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400">正在登录...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4" />
            <p className="text-zinc-600 dark:text-zinc-400">正在准备...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

