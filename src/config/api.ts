export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
// 你可以在这里添加其他的API相关配置，例如超时时间等
export const API_TIMEOUT = process.env.NEXT_PUBLIC_API_TIMEOUT ? parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) : 10000; // 10秒 