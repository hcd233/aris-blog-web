import axios from 'axios';
import {
  CreateArticleBody,
  UpdateArticleBody,
  UpdateArticleStatusBody,
  CreateArticleVersionBody,
  CreateArticleResponse,
  UpdateArticleResponse,
  UpdateArticleStatusResponse,
  CreateArticleVersionResponse,
  GetArticleInfoResponse,
  GetArticleVersionInfoResponse,
  GetLatestArticleVersionInfoResponse,
  ListArticlesResponse,
  ListArticleVersionsResponse,
  DeleteArticleResponse,
  CreateArticleCommentBody,
  CreateArticleCommentResponse,
  ListArticleCommentsResponse,
  LikeArticleBody,
  LogUserViewArticleBody,
  LogArticleViewResponse,
} from '@/types/api/article';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://9.134.115.68:8170';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器，添加认证token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器，处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 清除token并重定向到登录页
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class ArticleService {
  // 创建文章
  static async createArticle(data: CreateArticleBody): Promise<CreateArticleResponse> {
    const response = await apiClient.post('/v1/article', data);
    return response.data.data;
  }

  // 获取文章信息
  static async getArticle(articleID: number): Promise<GetArticleInfoResponse> {
    const response = await apiClient.get(`/v1/article/${articleID}`);
    return response.data.data;
  }

  // 更新文章
  static async updateArticle(articleID: number, data: UpdateArticleBody): Promise<UpdateArticleResponse> {
    const response = await apiClient.patch(`/v1/article/${articleID}`, data);
    return response.data.data;
  }

  // 删除文章
  static async deleteArticle(articleID: number): Promise<DeleteArticleResponse> {
    const response = await apiClient.delete(`/v1/article/${articleID}`);
    return response.data.data;
  }

  // 更新文章状态
  static async updateArticleStatus(articleID: number, data: UpdateArticleStatusBody): Promise<UpdateArticleStatusResponse> {
    const response = await apiClient.put(`/v1/article/${articleID}/status`, data);
    return response.data.data;
  }

  // 创建文章版本
  static async createArticleVersion(articleID: number, data: CreateArticleVersionBody): Promise<CreateArticleVersionResponse> {
    const response = await apiClient.post(`/v1/article/${articleID}/version`, data);
    return response.data.data;
  }

  // 获取文章版本信息
  static async getArticleVersion(articleID: number, version: number): Promise<GetArticleVersionInfoResponse> {
    const response = await apiClient.get(`/v1/article/${articleID}/version/${version}`);
    return response.data.data;
  }

  // 获取最新文章版本信息
  static async getLatestArticleVersion(articleID: number): Promise<GetLatestArticleVersionInfoResponse> {
    const response = await apiClient.get(`/v1/article/${articleID}/version/latest`);
    return response.data.data;
  }

  // 获取文章版本列表
  static async listArticleVersions(articleID: number, page: number = 1, pageSize: number = 10): Promise<ListArticleVersionsResponse> {
    const response = await apiClient.get(`/v1/article/${articleID}/versions`, {
      params: { page, pageSize }
    });
    return response.data.data;
  }

  // 获取文章列表
  static async listArticles(page: number = 1, pageSize: number = 10, categoryID?: number, status?: string): Promise<ListArticlesResponse> {
    const params: Record<string, unknown> = { page, pageSize };
    if (categoryID) params.categoryID = categoryID;
    if (status) params.status = status;
    
    const response = await apiClient.get('/v1/articles', { params });
    return response.data.data;
  }

  // 获取用户文章列表
  static async listUserArticles(userID: number, page: number = 1, pageSize: number = 10): Promise<ListArticlesResponse> {
    const response = await apiClient.get(`/v1/user/${userID}/articles`, {
      params: { page, pageSize }
    });
    return response.data.data;
  }

  // 获取子文章列表
  static async listChildrenArticles(articleID: number, page: number = 1, pageSize: number = 10): Promise<ListArticlesResponse> {
    const response = await apiClient.get(`/v1/article/${articleID}/children`, {
      params: { page, pageSize }
    });
    return response.data.data;
  }

  // 创建文章评论
  static async createArticleComment(data: CreateArticleCommentBody): Promise<CreateArticleCommentResponse> {
    const response = await apiClient.post('/v1/article/comment', data);
    return response.data.data;
  }

  // 获取文章评论列表
  static async listArticleComments(articleID: number, page: number = 1, pageSize: number = 10): Promise<ListArticleCommentsResponse> {
    const response = await apiClient.get(`/v1/article/${articleID}/comments`, {
      params: { page, pageSize }
    });
    return response.data.data;
  }

  // 点赞文章
  static async likeArticle(data: LikeArticleBody): Promise<void> {
    await apiClient.post('/v1/article/like', data);
  }

  // 记录文章浏览
  static async logArticleView(data: LogUserViewArticleBody): Promise<LogArticleViewResponse> {
    const response = await apiClient.post('/v1/article/view', data);
    return response.data.data;
  }

  // 获取用户点赞的文章列表
  static async listUserLikeArticles(userID: number, page: number = 1, pageSize: number = 10): Promise<ListArticlesResponse> {
    const response = await apiClient.get(`/v1/user/${userID}/like-articles`, {
      params: { page, pageSize }
    });
    return response.data.data;
  }

  // 获取用户浏览的文章列表
  static async listUserViewArticles(userID: number, page: number = 1, pageSize: number = 10): Promise<ListArticlesResponse> {
    const response = await apiClient.get(`/v1/user/${userID}/view-articles`, {
      params: { page, pageSize }
    });
    return response.data.data;
  }
}