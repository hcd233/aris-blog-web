import { PageInfo, TimestampFields } from './common.dto';

/**
 * Tag DTOs
 */

// Base tag entity
export interface Tag extends TimestampFields {
  tagID: number;
  name: string;
  description?: string;
  likes: number;
}

// Request DTOs
export interface CreateTagRequestDTO {
  name: string;
  description?: string;
}

export interface UpdateTagRequestDTO {
  name?: string;
  description?: string;
}

export interface LikeTagRequestDTO {
  tagID: number;
  undo?: boolean;
}

// Response DTOs
export interface CreateTagResponseDTO {
  tag: Tag;
}

export interface GetTagInfoResponseDTO {
  tag: Tag;
}

export interface UpdateTagResponseDTO {
  // Empty response
}

export interface DeleteTagResponseDTO {
  // Empty response
}

export interface LikeTagResponseDTO {
  // Empty response
}

export interface ListTagsResponseDTO {
  tags: Tag[];
  pageInfo: PageInfo;
}

export interface ListUserLikeTagsResponseDTO {
  tags: Tag[];
  pageInfo: PageInfo;
}

// Query parameters DTOs
export interface ListTagsQueryDTO {
  page?: number;
  pageSize?: number;
  keyword?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'likes' | 'name';
  sortOrder?: 'asc' | 'desc';
}