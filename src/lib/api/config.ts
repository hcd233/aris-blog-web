import { client } from "./client.gen";

// 配置 API 客户端
client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://mem.lvlvko.top",
});

// 设置 Authorization token
export function setAuthToken(token: string | null) {
  if (token) {
    client.setConfig({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else {
    // 清除 Authorization header
    client.setConfig({
      headers: {},
    });
  }
}

// 初始化时检查 localStorage 中的 token
if (typeof window !== "undefined") {
  const token = localStorage.getItem("accessToken");
  if (token) {
    setAuthToken(token);
  }
}

// 导出 client
export { client };

// 导出 getCurrentUser 函数，方便 auth.tsx 使用
export { getCurrentUser } from "./sdk.gen";

// 重新导出 SDK 中的其他函数
export {
  chat,
  createArticle,
  createTodoItems,
  deleteArticle,
  deleteTodoItem,
  getArticle,
  listArticles,
  listTags,
  listTodoItems,
  oauth2Callback,
  oauth2Login,
  refreshToken,
  updateArticle,
  updateTodoItem,
  updateUser,
  healthCheck,
  sseHealthCheck,
} from "./sdk.gen";

export * from "./types.gen";
