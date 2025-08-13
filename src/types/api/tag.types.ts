import type { PageInfo } from './common.types';

// 标签相关类型定义
export interface Tag {
  tagID: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  authorID: number;
}

export interface ListTagsRequest {
  page: number;
  pageSize?: number; // 默认10，最大50
}

export interface ListTagsResponse {
  tags: Tag[];
  pageInfo: PageInfo;
}

export interface GetTagInfoResponse {
  tag: Tag;
}

export interface CreateTagBody {
  name: string;
  slug: string;
  description?: string;
}

export interface CreateTagResponse {
  tag: Tag;
}

export interface UpdateTagBody {
  name: string;
  slug: string;
  description?: string;
}

export type UpdateTagResponse = Record<string, never>;

export type DeleteTagResponse = Record<string, never>; 