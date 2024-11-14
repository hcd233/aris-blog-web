import request from '@/utils/request'

export interface Article {
  id: number
  title: string
  slug: string
  status: string
  publishedAt: string
  likes: number
  comments: number
  views: number
  tags: Tag[]
  user: Author
}

export interface ArticleVersion {
  id: number
  content: string
  version: number
  createdAt: string
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface Author {
  id: number
  name: string
  avatar: string
}

export interface SearchArticle {
  id: number
  title: string
  content: string
  slug: string
  author: string
  tags: string[]
}

export interface SearchResponse {
  articles: SearchArticle[]
  queryInfo: {
    filter: string[]
    page: number
    pageSize: number
    query: string
    total: number
  }
}

export interface ApiResponse<T> {
  message: string
  code: number
  data: T
}

export interface ArticlesResponse {
  articles: Article[]
  pageInfo: {
    page: number
    pageSize: number
    total: number
  }
}

class ArticleService {
  static async getArticles(page: number = 1, pageSize: number = 10) {
    return request.get<ArticlesResponse>('/v1/articles', {
      params: { page, pageSize }
    })
  }

  static async getArticle(userName: string, articleSlug: string) {
    return request.get<ApiResponse<Article>>(`/v1/user/${userName}/article/${articleSlug}`)
  }

  static async getLatestVersion(userName: string, articleSlug: string) {
    return request.get<ApiResponse<ArticleVersion>>(
      `/v1/user/${userName}/article/${articleSlug}/version/latest`
    )
  }

  static async searchArticles(query: string, page: number = 1, pageSize: number = 10, filter: string = '') {
    return request.get<SearchResponse>('/v1/article', {
      params: {
        query,
        page,
        pageSize,
        filter
      }
    })
  }
}

export default ArticleService 