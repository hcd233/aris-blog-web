'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // 检查是否已登录，如果是则直接跳转到主页，否则跳转到登录页
    if (isAuthenticated()) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
    </div>
  );
}
