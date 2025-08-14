import { BaseService } from './base.service';
import {
  Article,
  ArticleVersion,
  CreateArticleRequestDTO,
  CreateArticleResponseDTO,
  UpdateArticleRequestDTO,
  UpdateArticleResponseDTO,
  UpdateArticleStatusRequestDTO,
  UpdateArticleStatusResponseDTO,
  DeleteArticleResponseDTO,
  GetArticleInfoResponseDTO,
  ListArticlesQueryDTO,
  ListArticlesResponseDTO,
  ListChildrenArticlesResponseDTO,
  CreateArticleVersionRequestDTO,
  CreateArticleVersionResponseDTO,
  GetArticleVersionInfoResponseDTO,
  GetLatestArticleVersionInfoResponseDTO,
  ListArticleVersionsQueryDTO,
  ListArticleVersionsResponseDTO,
  LikeArticleRequestDTO,
  LogArticleViewRequestDTO,
  LogArticleViewResponseDTO,
  ListUserLikeArticlesResponseDTO,
} from '@/types/dto';

/**
 * Article service for managing articles and their versions
 */
class ArticleService extends BaseService {
  /**
   * Create a new article
   */
  async createArticle(data: CreateArticleRequestDTO): Promise<Article> {
    const response = await this.post<CreateArticleRequestDTO, CreateArticleResponseDTO>(
      '/v1/article',
      data
    );
    return response.article;
  }

  /**
   * Get article information by ID
   */
  async getArticle(articleId: number): Promise<Article> {
    const response = await this.get<GetArticleInfoResponseDTO>(
      `/v1/article/${articleId}`
    );
    return response.article;
  }

  /**
   * Update article information
   */
  async updateArticle(
    articleId: number,
    data: UpdateArticleRequestDTO
  ): Promise<UpdateArticleResponseDTO> {
    return await this.patch<UpdateArticleRequestDTO, UpdateArticleResponseDTO>(
      `/v1/article/${articleId}`,
      data
    );
  }

  /**
   * Update article status
   */
  async updateArticleStatus(
    articleId: number,
    data: UpdateArticleStatusRequestDTO
  ): Promise<UpdateArticleStatusResponseDTO> {
    return await this.patch<UpdateArticleStatusRequestDTO, UpdateArticleStatusResponseDTO>(
      `/v1/article/${articleId}/status`,
      data
    );
  }

  /**
   * Delete an article
   */
  async deleteArticle(articleId: number): Promise<DeleteArticleResponseDTO> {
    return await this.delete<DeleteArticleResponseDTO>(`/v1/article/${articleId}`);
  }

  /**
   * List articles with pagination and filters
   */
  async listArticles(params?: ListArticlesQueryDTO): Promise<ListArticlesResponseDTO> {
    const queryString = params ? this.buildQueryString(params) : '';
    return await this.get<ListArticlesResponseDTO>(`/v1/articles${queryString}`);
  }

  /**
   * List articles by category
   */
  async listArticlesByCategory(
    categoryId: number,
    params?: ListArticlesQueryDTO
  ): Promise<ListChildrenArticlesResponseDTO> {
    const queryString = params ? this.buildQueryString(params) : '';
    return await this.get<ListChildrenArticlesResponseDTO>(
      `/v1/categories/${categoryId}/articles${queryString}`
    );
  }

  /**
   * Create a new version for an article
   */
  async createArticleVersion(
    articleId: number,
    data: CreateArticleVersionRequestDTO
  ): Promise<ArticleVersion> {
    const response = await this.post<CreateArticleVersionRequestDTO, CreateArticleVersionResponseDTO>(
      `/v1/article/${articleId}/version`,
      data
    );
    return response.articleVersion;
  }

  /**
   * Get specific version of an article
   */
  async getArticleVersion(articleId: number, version: number): Promise<ArticleVersion> {
    const response = await this.get<GetArticleVersionInfoResponseDTO>(
      `/v1/article/${articleId}/version/${version}`
    );
    return response.version;
  }

  /**
   * Get latest version of an article
   */
  async getLatestArticleVersion(articleId: number): Promise<ArticleVersion> {
    const response = await this.get<GetLatestArticleVersionInfoResponseDTO>(
      `/v1/article/${articleId}/version/latest`
    );
    return response.version;
  }

  /**
   * List all versions of an article
   */
  async listArticleVersions(
    articleId: number,
    params?: ListArticleVersionsQueryDTO
  ): Promise<ListArticleVersionsResponseDTO> {
    const queryString = params ? this.buildQueryString(params) : '';
    return await this.get<ListArticleVersionsResponseDTO>(
      `/v1/article/${articleId}/versions${queryString}`
    );
  }

  /**
   * Like or unlike an article
   */
  async toggleArticleLike(
    articleId: number,
    undo = false
  ): Promise<void> {
    const data: LikeArticleRequestDTO = { articleID: articleId, undo };
    await this.post('/v1/user/like/article', data);
  }

  /**
   * Log article view with progress
   */
  async logArticleView(
    articleId: number,
    progress: number
  ): Promise<LogArticleViewResponseDTO> {
    const data: LogArticleViewRequestDTO = { articleID: articleId, progress };
    return await this.post<LogArticleViewRequestDTO, LogArticleViewResponseDTO>(
      '/v1/user/view/article',
      data
    );
  }

  /**
   * Get user's liked articles
   */
  async getUserLikedArticles(userId?: number): Promise<Article[]> {
    const url = userId 
      ? `/v1/user/${userId}/like/articles`
      : '/v1/user/like/articles';
    const response = await this.get<ListUserLikeArticlesResponseDTO>(url);
    return response.articles;
  }
}

// Export singleton instance
export default new ArticleService();