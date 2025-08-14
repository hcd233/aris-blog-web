import { PageInfo } from './common.dto';

/**
 * Comment DTOs
 */

// Base comment entity
export interface Comment {
  commentID: number;
  userID: number;
  content: string;
  likes: number;
  replyTo?: number;
  createdAt: string;
}

// Request DTOs
export interface CreateArticleCommentRequestDTO {
  articleID: number;
  content: string;
  replyTo?: number;
}

export interface LikeCommentRequestDTO {
  commentID: number;
  undo?: boolean;
}

// Response DTOs
export interface CreateArticleCommentResponseDTO {
  comment: Comment;
}

export interface DeleteCommentResponseDTO {
  // Empty response
}

export interface LikeCommentResponseDTO {
  // Empty response
}

export interface ListArticleCommentsResponseDTO {
  comments: Comment[];
  pageInfo: PageInfo;
}

export interface ListChildrenCommentsResponseDTO {
  comments: Comment[];
  pageInfo: PageInfo;
}

export interface ListUserLikeCommentsResponseDTO {
  comments: Comment[];
  pageInfo: PageInfo;
}

// Query parameters DTOs
export interface ListCommentsQueryDTO {
  page?: number;
  pageSize?: number;
  articleID?: number;
  userID?: number;
  parentID?: number;
}