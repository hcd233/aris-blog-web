import type { PageInfo } from './common.types'

export type ArticleStatus = 'draft' | 'publish'

export interface Article {
  articleID: number
  title: string
  slug: string
  status: ArticleStatus | string
  tags: string[]
  userID: number
  views: number
  likes: number
  comments: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface ArticleVersion {
  versionID: number
  articleID: number
  version: number
  content: string
  createdAt: string
  updatedAt: string
}

// Create Article
export interface CreateArticleBody {
  categoryID: number
  slug: string
  tags: string[]
  title: string
}

export interface CreateArticleResponse {
  article: Article
}

// Update Article
export interface UpdateArticleBody {
  categoryID?: number
  slug?: string
  tags?: string[]
  title?: string
}

export type UpdateArticleResponse = Record<string, never>

// Update Article Status
export interface UpdateArticleStatusBody {
  status: ArticleStatus
}

export type UpdateArticleStatusResponse = Record<string, never>

// Get Article
export interface GetArticleInfoResponse {
  article: Article
}

// List Articles
export interface ListArticlesRequest {
  page: number
  pageSize?: number
}

export interface ListArticlesResponse {
  articles: Article[]
  pageInfo: PageInfo
}

// Article Versions
export interface CreateArticleVersionBody {
  content: string // 100-20000 chars
}

export interface CreateArticleVersionResponse {
  articleVersion: ArticleVersion
}

export interface GetArticleVersionInfoResponse {
  version: ArticleVersion
}

export interface GetLatestArticleVersionInfoResponse {
  version: ArticleVersion
}

export interface ListArticleVersionsRequest {
  articleID: number
  page: number
  pageSize?: number
}

export interface ListArticleVersionsResponse {
  versions: ArticleVersion[]
  pageInfo: PageInfo
}

export interface GetArticleBySlugParams {
  authorName: string
  articleSlug: string
}