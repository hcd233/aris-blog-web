export interface Article {
  articleID: number;
  title: string;
  slug: string;
  status: 'draft' | 'publish';
  categoryID: number;
  tags: string[];
  userID: number;
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ArticleVersion {
  versionID: number;
  articleID: number;
  version: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleBody {
  title: string;
  slug: string;
  categoryID: number;
  tags: string[];
}

export interface UpdateArticleBody {
  title?: string;
  slug?: string;
  categoryID?: number;
  tags?: string[];
}

export interface UpdateArticleStatusBody {
  status: 'draft' | 'publish';
}

export interface CreateArticleVersionBody {
  content: string;
}

export interface CreateArticleResponse {
  article: Article;
}

export type UpdateArticleResponse = Record<string, never>;

export type UpdateArticleStatusResponse = Record<string, never>;

export interface CreateArticleVersionResponse {
  articleVersion: ArticleVersion;
}

export interface GetArticleInfoResponse {
  article: Article;
}

export interface GetArticleVersionInfoResponse {
  articleVersion: ArticleVersion;
}

export interface GetLatestArticleVersionInfoResponse {
  articleVersion: ArticleVersion;
}

export interface ListArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListArticleVersionsResponse {
  articleVersions: ArticleVersion[];
  total: number;
  page: number;
  pageSize: number;
}

export type DeleteArticleResponse = Record<string, never>;

// 分类相关类型
export interface Category {
  categoryID: number;
  name: string;
  parentID?: number;
  createdAt: string;
  updatedAt: string;
}

// 评论相关类型
export interface Comment {
  commentID: number;
  articleID: number;
  content: string;
  userID: number;
  replyTo?: number;
  likes: number;
  createdAt: string;
}

export interface CreateArticleCommentBody {
  articleID: number;
  content: string;
  replyTo?: number;
}

export interface CreateArticleCommentResponse {
  comment: Comment;
}

export interface ListArticleCommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  pageSize: number;
}

// 点赞相关类型
export interface LikeArticleBody {
  articleID: number;
}

// 浏览记录相关类型
export interface LogUserViewArticleBody {
  articleID: number;
}

export type LogArticleViewResponse = Record<string, never>;