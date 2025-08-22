import { BaseService } from './base.service';
import { cacheManager, generateCacheKey, withCache } from '@/lib/cache-manager';
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
    
    // 清除相关缓存
    this.invalidateArticleCache();
    
    return response.article;
  }

  /**
   * Get article information by ID
   */
  async getArticle(articleId: number): Promise<Article> {
    const cacheKey = generateCacheKey(`article:${articleId}`);
    
    return withCache(
      async (id: number) => {
        const response = await this.get<GetArticleInfoResponseDTO>(
          `/v1/article/${id}`
        );
        return response.article;
      },
      (id: number) => generateCacheKey(`article:${id}`),
      {
        ttl: 5 * 60 * 1000, // 5分钟
        priority: 8,
        enablePreload: true,
      }
    )(articleId);
  }

  /**
   * Update article information
   */
  async updateArticle(
    articleId: number,
    data: UpdateArticleRequestDTO
  ): Promise<UpdateArticleResponseDTO> {
    const response = await this.patch<UpdateArticleRequestDTO, UpdateArticleResponseDTO>(
      `/v1/article/${articleId}`,
      data
    );
    
    // 清除相关缓存
    this.invalidateArticleCache(articleId);
    
    return response;
  }

  /**
   * Update article status
   */
  async updateArticleStatus(
    articleId: number,
    data: UpdateArticleStatusRequestDTO
  ): Promise<UpdateArticleStatusResponseDTO> {
    const response = await this.patch<UpdateArticleStatusRequestDTO, UpdateArticleStatusResponseDTO>(
      `/v1/article/${articleId}/status`,
      data
    );
    
    // 清除相关缓存
    this.invalidateArticleCache(articleId);
    
    return response;
  }

  /**
   * Delete an article
   */
  async deleteArticle(articleId: number): Promise<DeleteArticleResponseDTO> {
    const response = await this.delete<DeleteArticleResponseDTO>(`/v1/article/${articleId}`);
    
    // 清除相关缓存
    this.invalidateArticleCache(articleId);
    
    return response;
  }

  /**
   * List articles with pagination and filters
   */
  async listArticles(params?: ListArticlesQueryDTO): Promise<ListArticlesResponseDTO> {
    const cacheKey = generateCacheKey('articles', params);
    
    return withCache(
      async (queryParams?: ListArticlesQueryDTO) => {
        const queryString = queryParams ? this.buildQueryString(queryParams) : '';
        return await this.get<ListArticlesResponseDTO>(`/v1/article/list${queryString}`);
      },
      (queryParams?: ListArticlesQueryDTO) => generateCacheKey('articles', queryParams),
      {
        ttl: 2 * 60 * 1000, // 2分钟
        priority: 7,
        enablePreload: false,
      }
    )(params);
  }

  /**
   * List articles by category
   */
  async listArticlesByCategory(
    categoryId: number,
    params?: ListArticlesQueryDTO
  ): Promise<ListChildrenArticlesResponseDTO> {
    const cacheKey = generateCacheKey(`articles:category:${categoryId}`, params);
    
    return withCache(
      async (catId: number, queryParams?: ListArticlesQueryDTO) => {
        const queryString = queryParams ? this.buildQueryString(queryParams) : '';
        return await this.get<ListChildrenArticlesResponseDTO>(
          `/v1/category/${catId}/articles${queryString}`
        );
      },
      (catId: number, queryParams?: ListArticlesQueryDTO) => 
        generateCacheKey(`articles:category:${catId}`, queryParams),
      {
        ttl: 3 * 60 * 1000, // 3分钟
        priority: 6,
        enablePreload: false,
      }
    )(categoryId, params);
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

  /**
   * 清除文章相关缓存
   */
  private invalidateArticleCache(articleId?: number): void {
    if (articleId) {
      // 清除特定文章的缓存
      cacheManager.delete(generateCacheKey(`article:${articleId}`));
      cacheManager.delete(generateCacheKey(`article:${articleId}:versions`));
      cacheManager.delete(generateCacheKey(`article:${articleId}:version:latest`));
    }
    
    // 清除文章列表缓存
    const keysToDelete: string[] = [];
    for (const key of cacheManager['cache'].keys()) {
      if (key.startsWith('articles:') || key.startsWith('article:')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => cacheManager.delete(key));
  }
}

// Export singleton instance
export default new ArticleService();