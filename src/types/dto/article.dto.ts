import { PageInfo, TimestampFields } from './common.dto';

/**
 * Article DTOs
 */

// Article status enum
export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISH = 'publish'
}

// Base article entity
export interface Article extends TimestampFields {
  articleID: number;
  userID: number;
  title: string;
  slug: string;
  status: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  publishedAt?: string;
}

// Article version entity
export interface ArticleVersion extends TimestampFields {
  versionID: number;
  articleID: number;
  version: number;
  content: string;
}

// Request DTOs
export interface CreateArticleRequestDTO {
  title: string;
  slug: string;
  categoryID: number;
  tags?: string[];
}

export interface UpdateArticleRequestDTO {
  categoryID?: number;
  slug?: string;
  tags?: string[];
}

export interface UpdateArticleStatusRequestDTO {
  status: ArticleStatus;
}

export interface CreateArticleVersionRequestDTO {
  content: string;
}

export interface LikeArticleRequestDTO {
  articleID: number;
  undo?: boolean;
}

export interface LogArticleViewRequestDTO {
  articleID: number;
  progress: number; // 0-100
}

// Response DTOs
export interface CreateArticleResponseDTO {
  article: Article;
}

export interface GetArticleInfoResponseDTO {
  article: Article;
}

export interface UpdateArticleResponseDTO {
  // Empty response
}

export interface UpdateArticleStatusResponseDTO {
  // Empty response
}

export interface DeleteArticleResponseDTO {
  // Empty response
}

export interface CreateArticleVersionResponseDTO {
  articleVersion: ArticleVersion;
}

export interface GetArticleVersionInfoResponseDTO {
  version: ArticleVersion;
}

export interface GetLatestArticleVersionInfoResponseDTO {
  version: ArticleVersion;
}

export interface ListArticleVersionsResponseDTO {
  versions: ArticleVersion[];
  pageInfo: PageInfo;
}

export interface ListArticlesResponseDTO {
  articles: Article[];
  pageInfo: PageInfo;
}

export interface ListChildrenArticlesResponseDTO {
  articles: Article[];
  pageInfo: PageInfo;
}

export interface ListUserLikeArticlesResponseDTO {
  articles: Article[];
  pageInfo: PageInfo;
}

export interface LogArticleViewResponseDTO {
  // Empty response
}

// Query parameters DTOs
export interface ListArticlesQueryDTO {
  page?: number;
  pageSize?: number;
  categoryID?: number;
  tagID?: number;
  status?: ArticleStatus;
  userID?: number;
  keyword?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

export interface ListArticleVersionsQueryDTO {
  page?: number;
  pageSize?: number;
}