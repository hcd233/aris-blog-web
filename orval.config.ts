import { defineConfig } from 'orval';

// 从环境变量读取配置，如果未设置则使用默认值
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://s.lvlvko.top';
const OPENAPI_URL = process.env.OPENAPI_URL || `${API_BASE_URL}/openapi.yaml`;

export default defineConfig({
  blog: {
    input: {
      target: OPENAPI_URL,
    },
    output: {
      mode: 'tags-split',
      target: './src/api/endpoints',
      schemas: './src/api/models',
      client: 'axios-functions',
      // 不设置 baseUrl，让生成的代码使用相对路径
      // baseURL 由 custom-instance.ts 中的 AXIOS_INSTANCE 管理
      override: {
        mutator: {
          path: './src/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});

