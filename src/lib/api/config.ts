import { client } from "./client.gen";
import {
  chat,
  createArticle,
  createTodoItems,
  deleteArticle,
  deleteTag,
  deleteTodoItem,
  doAction,
  getArticle,
  getCredential,
  getCurrentUser,
  healthCheck,
  listArticles,
  listTags,
  listTodoItems,
  oauth2Callback,
  oauth2Login,
  refreshToken,
  sseHealthCheck,
  undoAction,
  updateArticle,
  updateTodoItem,
  updateUser,
  uploadImage,
} from "./sdk.gen";

// 设置认证token
export const setAuthToken = (token: string | null) => {
  const currentConfig = client.getConfig();
  if (token) {
    client.setConfig({
      ...currentConfig,
      headers: {
        ...currentConfig.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } else {
    const headers = { ...currentConfig.headers };
    delete (headers as Record<string, unknown>).Authorization;
    client.setConfig({
      ...currentConfig,
      headers,
    });
  }
};

// 配置 API 客户端 baseUrl
client.setConfig({
  baseUrl: "https://mem.lvlvko.top",
  auth: async () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken") || undefined;
    }
    return undefined;
  },
});

// 从localStorage读取token并设置（初始化时）
if (typeof window !== "undefined") {
  const token = localStorage.getItem("accessToken");
  if (token) {
    setAuthToken(token);
  }
}

// 导出API客户端
export { client };

// 导出API函数
export {
  chat,
  createArticle,
  createTodoItems,
  deleteArticle,
  deleteTag,
  deleteTodoItem,
  doAction,
  getArticle,
  getCredential,
  getCurrentUser,
  healthCheck,
  listArticles,
  listTags,
  listTodoItems,
  oauth2Callback,
  oauth2Login,
  refreshToken,
  sseHealthCheck,
  undoAction,
  updateArticle,
  updateTodoItem,
  updateUser,
  uploadImage,
};
