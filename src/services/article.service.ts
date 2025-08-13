import apiClient from '@/lib/api-client'
import type {
  Article,
  ArticleVersion,
  CreateArticleRequest,
  CreateArticleResponse,
  GetArticleInfoResponse,
  UpdateArticleRequest,
  UpdateArticleResponse,
  UpdateArticleStatusRequest,
  UpdateArticleStatusResponse,
  DeleteArticleResponse,
  ListArticlesParams,
  ListArticlesResponse,
  CreateArticleVersionRequest,
  CreateArticleVersionResponse,
  GetArticleVersionInfoResponse,
  GetLatestArticleVersionInfoResponse,
  ListArticleVersionsParams,
  ListArticleVersionsResponse,
  ListArticleCommentsParams,
  ListArticleCommentsResponse,
  LikeArticleRequest,
  LikeArticleResponse,
  LogUserViewArticleRequest,
  LogArticleViewResponse,
  ListUserLikeArticlesParams,
  ListUserLikeArticlesResponse,
  ListUserViewArticlesParams,
  ListUserViewArticlesResponse,
} from '@/types/api/article.types'

class ArticleService {
  // ============ Core Article Management ============

  /**
   * Create a new article
   */
  async createArticle(data: CreateArticleRequest): Promise<CreateArticleResponse> {
    const res = await apiClient.post<CreateArticleResponse>('/v1/article', data)
    return res.data as CreateArticleResponse
  }

  /**
   * Get article information by ID
   */
  async getArticleInfo(articleID: number): Promise<GetArticleInfoResponse> {
    const res = await apiClient.get<GetArticleInfoResponse>(`/v1/article/${articleID}`)
    return res.data as GetArticleInfoResponse
  }

  /**
   * Get article information by author name and slug
   */
  async getArticleBySlug(authorName: string, articleSlug: string): Promise<GetArticleInfoResponse> {
    const res = await apiClient.get<GetArticleInfoResponse>(`/v1/article/slug/${authorName}/${articleSlug}`)
    return res.data as GetArticleInfoResponse
  }

  /**
   * Update article metadata (title, slug, category)
   */
  async updateArticle(articleID: number, data: UpdateArticleRequest): Promise<UpdateArticleResponse> {
    const res = await apiClient.patch<UpdateArticleResponse>(`/v1/article/${articleID}`, data)
    return res.data as UpdateArticleResponse
  }

  /**
   * Update article status (draft/publish)
   */
  async updateArticleStatus(articleID: number, data: UpdateArticleStatusRequest): Promise<UpdateArticleStatusResponse> {
    const res = await apiClient.put<UpdateArticleStatusResponse>(`/v1/article/${articleID}/status`, data)
    return res.data as UpdateArticleStatusResponse
  }

  /**
   * Delete an article
   */
  async deleteArticle(articleID: number): Promise<DeleteArticleResponse> {
    const res = await apiClient.delete<DeleteArticleResponse>(`/v1/article/${articleID}`)
    return res.data as DeleteArticleResponse
  }

  /**
   * List articles with pagination
   */
  async listArticles(params: ListArticlesParams): Promise<ListArticlesResponse> {
    const { page, pageSize = 10 } = params
    const res = await apiClient.get<ListArticlesResponse>('/v1/article/list', {
      params: { page, pageSize }
    })
    return res.data as ListArticlesResponse
  }

  // ============ Article Version Management ============

  /**
   * Create a new version for an article
   */
  async createArticleVersion(articleID: number, data: CreateArticleVersionRequest): Promise<CreateArticleVersionResponse> {
    const res = await apiClient.post<CreateArticleVersionResponse>(`/v1/article/${articleID}/version`, data)
    return res.data as CreateArticleVersionResponse
  }

  /**
   * Get specific version of an article
   */
  async getArticleVersion(articleID: number, version: number): Promise<GetArticleVersionInfoResponse> {
    const res = await apiClient.get<GetArticleVersionInfoResponse>(`/v1/article/${articleID}/version/v${version}`)
    return res.data as GetArticleVersionInfoResponse
  }

  /**
   * Get the latest version of an article
   */
  async getLatestArticleVersion(articleID: number): Promise<GetLatestArticleVersionInfoResponse> {
    const res = await apiClient.get<GetLatestArticleVersionInfoResponse>(`/v1/article/${articleID}/version/latest`)
    return res.data as GetLatestArticleVersionInfoResponse
  }

  /**
   * List all versions of an article
   */
  async listArticleVersions(params: ListArticleVersionsParams): Promise<ListArticleVersionsResponse> {
    const { articleID, page, pageSize = 10 } = params
    const res = await apiClient.get<ListArticleVersionsResponse>(`/v1/article/${articleID}/version/list`, {
      params: { page, pageSize }
    })
    return res.data as ListArticleVersionsResponse
  }

  // ============ Article Comments ============

  /**
   * List comments for an article
   */
  async listArticleComments(params: ListArticleCommentsParams): Promise<ListArticleCommentsResponse> {
    const { articleID, page, pageSize = 10 } = params
    const res = await apiClient.get<ListArticleCommentsResponse>(`/v1/comment/article/${articleID}/list`, {
      params: { page, pageSize }
    })
    return res.data as ListArticleCommentsResponse
  }

  // ============ Article Operations ============

  /**
   * Like or unlike an article
   */
  async likeArticle(data: LikeArticleRequest): Promise<LikeArticleResponse> {
    const res = await apiClient.post<LikeArticleResponse>('/v1/operation/like/article', data)
    return res.data as LikeArticleResponse
  }

  /**
   * Log user view of an article
   */
  async logArticleView(data: LogUserViewArticleRequest): Promise<LogArticleViewResponse> {
    const res = await apiClient.post<LogArticleViewResponse>('/v1/operation/view/article', data)
    return res.data as LogArticleViewResponse
  }

  // ============ User Assets ============

  /**
   * List articles liked by the current user
   */
  async listUserLikeArticles(params: ListUserLikeArticlesParams): Promise<ListUserLikeArticlesResponse> {
    const { page, pageSize = 10 } = params
    const res = await apiClient.get<ListUserLikeArticlesResponse>('/v1/asset/like/articles', {
      params: { page, pageSize }
    })
    return res.data as ListUserLikeArticlesResponse
  }

  /**
   * List articles viewed by the current user
   */
  async listUserViewArticles(params: ListUserViewArticlesParams): Promise<ListUserViewArticlesResponse> {
    const { page, pageSize = 10 } = params
    const res = await apiClient.get<ListUserViewArticlesResponse>('/v1/asset/view/articles', {
      params: { page, pageSize }
    })
    return res.data as ListUserViewArticlesResponse
  }

  /**
   * Delete a user's article view record
   */
  async deleteUserView(viewID: number): Promise<void> {
    await apiClient.delete(`/v1/asset/view/article/${viewID}`)
  }

  // ============ Utility Methods ============

  /**
   * Get article with its latest version content
   */
  async getArticleWithLatestVersion(articleID: number): Promise<{
    article: Article
    version: ArticleVersion
  }> {
    try {
      const [articleResponse, versionResponse] = await Promise.all([
        this.getArticleInfo(articleID),
        this.getLatestArticleVersion(articleID)
      ])

      return {
        article: articleResponse.article,
        version: versionResponse.version
      }
    } catch (error) {
      console.error('获取文章和版本失败:', error)
      throw error
    }
  }

  /**
   * Create article with initial content
   */
  async createArticleWithContent(
    articleData: CreateArticleRequest,
    content: string
  ): Promise<{
    article: Article
    version: ArticleVersion
  }> {
    try {
      // First create the article
      const articleResponse = await this.createArticle(articleData)
      
      // Then create the first version with content
      const versionResponse = await this.createArticleVersion(
        articleResponse.article.articleID,
        { content }
      )

      return {
        article: articleResponse.article,
        version: versionResponse.articleVersion
      }
    } catch (error) {
      console.error('创建文章和内容失败:', error)
      throw error
    }
  }

  /**
   * Save article content (creates new version)
   */
  async saveArticleContent(articleID: number, content: string): Promise<ArticleVersion> {
    try {
      const response = await this.createArticleVersion(articleID, { content })
      return response.articleVersion
    } catch (error) {
      console.error('保存文章内容失败:', error)
      throw error
    }
  }

  /**
   * Publish article (change status to publish)
   */
  async publishArticle(articleID: number): Promise<void> {
    try {
      await this.updateArticleStatus(articleID, { status: 'publish' })
    } catch (error) {
      console.error('发布文章失败:', error)
      throw error
    }
  }

  /**
   * Unpublish article (change status to draft)
   */
  async unpublishArticle(articleID: number): Promise<void> {
    try {
      await this.updateArticleStatus(articleID, { status: 'draft' })
    } catch (error) {
      console.error('取消发布文章失败:', error)
      throw error
    }
  }

  /**
   * Generate unique slug from title
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  }

  /**
   * Validate article data before submission
   */
  validateArticleData(data: Partial<CreateArticleRequest>): string[] {
    const errors: string[] = []

    if (!data.title?.trim()) {
      errors.push('文章标题不能为空')
    }

    if (!data.slug?.trim()) {
      errors.push('文章链接不能为空')
    }

    if (!data.categoryID) {
      errors.push('必须选择一个分类')
    }

    if (!data.tags || data.tags.length === 0) {
      errors.push('至少需要一个标签')
    }

    // Validate slug format
    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push('文章链接只能包含小写字母、数字和连字符')
    }

    return errors
  }
}

export const articleService = new ArticleService()
export default articleService