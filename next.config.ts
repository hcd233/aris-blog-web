import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用 Turbopack
  turbopack: {},
  // 启用 standalone 模式，用于 Docker 部署
  output: 'standalone',
  // 禁用图片优化（如果使用外部 CDN，可设为 true）
  images: {
    unoptimized: true,
  },
  // API 代理配置
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path* || "http://localhost:8080"`,
      },
    ];
  },
};

export default nextConfig;
