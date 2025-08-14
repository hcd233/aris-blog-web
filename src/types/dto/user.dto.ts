import { PageInfo, TimestampFields } from './common.dto';

/**
 * User DTOs
 */

// Base user entity
export interface User extends TimestampFields {
  userID: number;
  userName: string;
  avatar?: string;
}

// Current user entity (includes email)
export interface CurrentUser extends User {
  email: string;
}

// User view entity
export interface UserView {
  userViewID: number;
  userID: number;
  articleID: number;
  lastViewedAt: string;
  progress: number; // 0-100
}

// Request DTOs
export interface UpdateUserRequestDTO {
  userName: string;
}

export interface LogUserViewArticleRequestDTO {
  articleID: number;
  progress: number; // 0-100
}

// Response DTOs
export interface GetUserInfoResponseDTO {
  user: User;
}

export interface GetCurrentUserResponseDTO {
  user: CurrentUser;
}

export interface UpdateUserInfoResponseDTO {
  // Empty response
}

export interface DeleteUserViewResponseDTO {
  // Empty response
}

export interface ListUserViewArticlesResponseDTO {
  userViews: UserView[];
  pageInfo: PageInfo;
}

// Query parameters DTOs
export interface ListUserViewsQueryDTO {
  page?: number;
  pageSize?: number;
  userID?: number;
}