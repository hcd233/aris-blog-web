import { PageInfo } from './common.types'

// Article Status - maps to model.ArticleStatus from swagger
export type ArticleStatus = 'draft' | 'publish'

// Core Article interface - maps to protocol.Article from swagger
export interface Article {
  articleID: number
  title: string
  slug: string
  status: ArticleStatus
  userID: number
  views: number
  likes: number
  comments: number
  tags: string[]
  createdAt: string
  updatedAt: string
  publishedAt: string
}

// Article Version interface - maps to protocol.ArticleVersion from swagger
export interface ArticleVersion {
  versionID: number
  articleID: number
  version: number
  content: string
  createdAt: string
  updatedAt: string
}

// Enhanced Article interface with additional data for UI
export interface ArticleWithVersion extends Article {
  currentVersion?: ArticleVersion
  categoryID?: number
  authorName?: string
}

// API Request and Response Types

// Create Article
export interface CreateArticleRequest {
  title: string
  slug: string
  categoryID: number
  tags: string[]
}

export interface CreateArticleResponse {
  article: Article
}

// Get Article Info
export interface GetArticleInfoResponse {
  article: Article
}

// Update Article
export interface UpdateArticleRequest {
  title?: string
  slug?: string
  categoryID?: number
}

export interface UpdateArticleResponse {
  // Empty response object from swagger
}

// Update Article Status
export interface UpdateArticleStatusRequest {
  status: ArticleStatus
}

export interface UpdateArticleStatusResponse {
  // Empty response object from swagger
}

// Delete Article
export interface DeleteArticleResponse {
  // Empty response object from swagger
}

// List Articles
export interface ListArticlesParams {
  page: number
  pageSize?: number
}

export interface ListArticlesResponse {
  articles: Article[]
  pageInfo: PageInfo
}

// Article Version APIs

// Create Article Version
export interface CreateArticleVersionRequest {
  content: string
}

export interface CreateArticleVersionResponse {
  articleVersion: ArticleVersion
}

// Get Article Version Info
export interface GetArticleVersionInfoResponse {
  version: ArticleVersion
}

// Get Latest Article Version Info
export interface GetLatestArticleVersionInfoResponse {
  version: ArticleVersion
}

// List Article Versions
export interface ListArticleVersionsParams {
  articleID: number
  page: number
  pageSize?: number
}

export interface ListArticleVersionsResponse {
  versions: ArticleVersion[]
  pageInfo: PageInfo
}

// Article Comments (simplified - detailed comment types would be in comment.types.ts)
export interface ArticleComment {
  commentID: number
  content: string
  userID: number
  articleID: number
  replyTo: number
  likes: number
  createdAt: string
}

export interface ListArticleCommentsParams {
  articleID: number
  page: number
  pageSize?: number
}

export interface ListArticleCommentsResponse {
  comments: ArticleComment[]
  pageInfo: PageInfo
}

// Article Operations

// Like Article
export interface LikeArticleRequest {
  articleID: number
  undo?: boolean
}

export interface LikeArticleResponse {
  // Empty response object from swagger
}

// View Article
export interface LogUserViewArticleRequest {
  articleID: number
  progress?: number // 0-100
}

export interface LogArticleViewResponse {
  // Empty response object from swagger
}

// User Assets - Articles liked/viewed by user
export interface ListUserLikeArticlesParams {
  page: number
  pageSize?: number
}

export interface ListUserLikeArticlesResponse {
  articles: Article[]
  pageInfo: PageInfo
}

export interface UserView {
  viewID: number
  userID: number
  articleID: number
  progress: number
  lastViewedAt: string
}

export interface ListUserViewArticlesParams {
  page: number
  pageSize?: number
}

export interface ListUserViewArticlesResponse {
  userViews: UserView[]
  pageInfo: PageInfo
}

// Editor specific types
export interface ArticleEditState {
  article: Article | null
  currentVersion: ArticleVersion | null
  isEditing: boolean
  isDirty: boolean
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

export interface ArticleFormData {
  title: string
  slug: string
  categoryID: number
  tags: string[]
  content: string
  status: ArticleStatus
}

// Search and filtering
export interface ArticleSearchParams {
  keyword?: string
  categoryID?: number
  tags?: string[]
  status?: ArticleStatus
  authorID?: number
  page: number
  pageSize?: number
}

// Article Management State
export interface ArticleManagementState {
  articles: Article[]
  currentArticle: ArticleWithVersion | null
  versions: ArticleVersion[]
  loading: boolean
  error: string | null
  pageInfo: PageInfo
}