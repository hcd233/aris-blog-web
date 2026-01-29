import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用 Turbopack
  turbopack: {},
  
  // 图片配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's.lvlvko.top',
      },
    ],
  },
  
  // 环境变量
  env: {
    API_BASE_URL: 'https://s.lvlvko.top',
  },
};

export default nextConfig;
