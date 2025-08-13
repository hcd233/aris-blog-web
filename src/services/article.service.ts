import apiClient from '@/lib/api-client'
import type {
  CreateArticleBody,
  CreateArticleResponse,
  UpdateArticleBody,
  UpdateArticleResponse,
  UpdateArticleStatusBody,
  UpdateArticleStatusResponse,
  GetArticleInfoResponse,
  ListArticlesRequest,
  ListArticlesResponse,
  CreateArticleVersionBody,
  CreateArticleVersionResponse,
  GetArticleVersionInfoResponse,
  GetLatestArticleVersionInfoResponse,
  ListArticleVersionsRequest,
  ListArticleVersionsResponse,
} from '@/types/api/article.types'

class ArticleService {
  // 创建文章
  async createArticle(data: CreateArticleBody): Promise<CreateArticleResponse> {
    const res = await apiClient.post<CreateArticleResponse>('/v1/article', data)
    return res.data as CreateArticleResponse
  }

  // 获取文章信息
  async getArticle(articleID: number): Promise<GetArticleInfoResponse> {
    const res = await apiClient.get<GetArticleInfoResponse>(`/v1/article/${articleID}`)
    return res.data as GetArticleInfoResponse
  }

  // 通过作者名和文章slug获取文章信息
  async getArticleBySlug(authorName: string, articleSlug: string): Promise<GetArticleInfoResponse> {
    const res = await apiClient.get<GetArticleInfoResponse>(`/v1/article/slug/${authorName}/${articleSlug}`)
    return res.data as GetArticleInfoResponse
  }

  // 更新文章基本信息
  async updateArticle(articleID: number, data: UpdateArticleBody): Promise<UpdateArticleResponse> {
    const res = await apiClient.patch<UpdateArticleResponse>(`/v1/article/${articleID}`, data)
    return res.data as UpdateArticleResponse
  }

  // 更新文章状态（draft/publish）
  async updateArticleStatus(articleID: number, data: UpdateArticleStatusBody): Promise<UpdateArticleStatusResponse> {
    const res = await apiClient.put<UpdateArticleStatusResponse>(`/v1/article/${articleID}/status`, data)
    return res.data as UpdateArticleStatusResponse
  }

  // 删除文章
  async deleteArticle(articleID: number): Promise<Record<string, never>> {
    const res = await apiClient.delete<Record<string, never>>(`/v1/article/${articleID}`)
    return res.data as Record<string, never>
  }

  // 列出文章
  async listArticles(params: ListArticlesRequest): Promise<ListArticlesResponse> {
    const res = await apiClient.get<ListArticlesResponse>('/v1/article/list', { params })
    return res.data as ListArticlesResponse
  }

  // 创建文章版本
  async createArticleVersion(articleID: number, data: CreateArticleVersionBody): Promise<CreateArticleVersionResponse> {
    const res = await apiClient.post<CreateArticleVersionResponse>(`/v1/article/${articleID}/version`, data)
    return res.data as CreateArticleVersionResponse
  }

  // 获取最新版本
  async getLatestVersion(articleID: number): Promise<GetLatestArticleVersionInfoResponse> {
    const res = await apiClient.get<GetLatestArticleVersionInfoResponse>(`/v1/article/${articleID}/version/latest`)
    return res.data as GetLatestArticleVersionInfoResponse
  }

  // 获取指定版本
  async getVersion(articleID: number, version: number): Promise<GetArticleVersionInfoResponse> {
    const res = await apiClient.get<GetArticleVersionInfoResponse>(`/v1/article/${articleID}/version/v${version}`)
    return res.data as GetArticleVersionInfoResponse
  }

  // 列出版本
  async listVersions(params: ListArticleVersionsRequest): Promise<ListArticleVersionsResponse> {
    const { articleID, page, pageSize } = params
    const res = await apiClient.get<ListArticleVersionsResponse>(`/v1/article/${articleID}/version/list`, {
      params: { page, pageSize }
    })
    return res.data as ListArticleVersionsResponse
  }
}

export const articleService = new ArticleService()