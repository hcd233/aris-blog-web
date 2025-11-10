'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isAuthenticated } from '@/lib/auth';
import { oauth2Login } from '@/api';
import { BookOpen, Sparkles, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/home');
    }
  }, [router]);

  const handleLogin = async (provider: 'github' | 'google') => {
    try {
      setLoadingProvider(provider);
      const response = await oauth2Login(provider);
      window.location.href = response.redirectURL;
    } catch (error) {
      console.error('获取登录 URL 失败:', error);
      setLoadingProvider(null);
      alert('登录失败，请重试');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* 左侧背景图区域 */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
        
        {/* 内容 */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Aris Blog
            </h1>
            <p className="text-xl text-zinc-300 mb-8">
              分享知识，记录成长，连接世界
            </p>
          </div>

          {/* 特性列表 */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 group">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">丰富的文章内容</h3>
                <p className="text-zinc-400">探索各类技术文章，发现编程的乐趣</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">智能标签系统</h3>
                <p className="text-zinc-400">通过标签快速找到感兴趣的内容</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm group-hover:bg-white/20 transition-all">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">实时互动交流</h3>
                <p className="text-zinc-400">与作者和其他读者进行深度交流</p>
              </div>
            </div>
          </div>

          {/* 装饰性引用 */}
          <div className="mt-12 p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <p className="text-zinc-300 italic mb-2">
              &ldquo;写作是更好的思考，分享是更好的学习。&rdquo;
            </p>
            <p className="text-zinc-500 text-sm">— Aris Blog</p>
          </div>
        </div>
      </div>

      {/* 右侧登录表单区域 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-50 dark:bg-black">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
              Aris Blog
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">分享知识，记录成长</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                欢迎回来
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                选择一个方式登录以继续
              </p>
            </div>

            <div className="space-y-3">
              {/* GitHub 登录按钮 */}
              <Button 
                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => handleLogin('github')}
                disabled={loadingProvider !== null}
              >
                {loadingProvider === 'github' ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    正在跳转...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    使用 GitHub 登录
                  </>
                )}
              </Button>

              {/* Google 登录按钮 */}
              <Button 
                className="w-full h-12 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-200 dark:border-zinc-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                variant="outline"
                onClick={() => handleLogin('google')}
                disabled={loadingProvider !== null}
              >
                {loadingProvider === 'google' ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    正在跳转...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    使用 Google 登录
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                登录即表示您同意我们的
                <a href="#" className="text-zinc-900 dark:text-zinc-100 hover:underline ml-1">服务条款</a>
                和
                <a href="#" className="text-zinc-900 dark:text-zinc-100 hover:underline ml-1">隐私政策</a>
              </p>
            </div>
          </div>

          {/* 额外信息 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              还没有账号？登录后自动创建
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

