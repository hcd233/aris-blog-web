// 应用配置
export const appConfig = {
  // 应用名称
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Aris Blog',
  
  // 应用图标URL，如果没有设置则使用默认的Next.js样式图标
  iconUrl: process.env.NEXT_PUBLIC_APP_ICON_URL || null,

  // 默认图标样式（当没有自定义图标时使用）
  defaultIcon: {
    letter: 'A',
    gradient: 'from-blue-600 to-indigo-600'
  }
}; 