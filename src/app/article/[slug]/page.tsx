"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug) {
      // 重定向到首页并带上 article 参数，复用主页的文章详情弹窗逻辑
      router.replace(`/?article=${encodeURIComponent(slug)}`);
    }
  }, [slug, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex items-center justify-center">
      <Loading text="正在跳转..." />
    </div>
  );
}
