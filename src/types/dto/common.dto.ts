/**
 * Common DTO interfaces and types
 */

// Base response interface
export interface BaseResponse<T = any> {
  data?: T;
  error?: string;
}

// Page info for paginated responses
export interface PageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Common paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pageInfo: PageInfo;
}

// Common error response
export interface ErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

// SSE response for streaming
export interface SSEResponse {
  delta?: string;
  error?: string;
  finish?: boolean;
}

// Common timestamp fields
export interface TimestampFields {
  createdAt: string;
  updatedAt: string;
}

// Common ID field
export interface IdField {
  id: number;
}