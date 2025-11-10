/**
 * 环境变量配置
 * 集中管理所有环境变量，提供类型安全和默认值
 */

export const env = {
  /**
   * 后端 API 基础地址
   */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://s.lvlvko.top',

  /**
   * 前端应用地址（用于 OAuth 回调等）
   */
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  /**
   * OpenAPI 规范地址（用于代码生成）
   */
  openApiUrl: process.env.OPENAPI_URL || 'https://s.lvlvko.top/openapi.yaml',
} as const;

/**
 * 验证必需的环境变量是否存在
 */
export function validateEnv() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_BASE_URL',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️ 缺少以下环境变量（将使用默认值）: ${missingVars.join(', ')}`
    );
  }
}

// 在开发模式下验证环境变量
if (process.env.NODE_ENV === 'development') {
  validateEnv();
}

