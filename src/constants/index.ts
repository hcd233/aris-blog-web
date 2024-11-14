// 背景图片配置
export const BACKGROUND_IMAGES = {
  DEFAULT: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80',
  AUTH: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80',
  // 可以添加更多预设背景
}

// OAuth 提供商配置
export const OAUTH_PROVIDERS = {
  GITHUB: {
    name: 'Github',
    icon: 'GithubOutlined',
    enabled: true,
  }
} as const

// API 路径配置
export const API_ROUTES = {
  AUTH: {
    github_LOGIN: '/v1/oauth2/github/login',
    github_CALLBACK: '/v1/oauth2/github/callback',
  }
} as const

// 路由路径配置
export const ROUTE_PATHS = {
  HOME: '/home',
  AUTH: '/auth',
  LOGIN: '/login',
  CALLBACK: '/auth/callback',
  SETTINGS: '/settings',
  PROFILE: '/user',
} as const 