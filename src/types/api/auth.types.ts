/**
 * GET /v1/user/current - Based on swagger protocol.GetCurUserInfoResponse
 */
export interface GetCurrentUserResponse {
  user: CurrentUser;
}

/**
 * GET /v1/oauth2/github/login
 * POST /v1/auth/login/{type} (for username/password, if used)
 * Both return a redirect URL.
 */
export interface LoginRedirectResponse {
  redirectURL: string;
}

/**
 * GET /v1/oauth2/github/callback
 * POST /v1/auth/callback/{provider}
 * Both return access and refresh tokens.
 */
export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * POST /v1/auth/logout
 */
export interface LogoutResponse { 
  message?: string; 
}

/**
 * GET /v1/user/current
 */
export interface CurrentUser {
  avatar?: string;
  createdAt?: string; 
  email?: string;
  lastLogin?: string;
  name?: string;
  permission?: string;
  userID?: number;
}

/**
 * PATCH /v1/user
 */
export interface UpdateUserBody {
  userName?: string;
  avatar?: string; 
}

export interface UpdateUserInfoResponse {
  user?: CurrentUser;
  message?: string;
}

/**
 * POST /v1/auth/callback/{provider} - Generic callback, might be used by non-GitHub OAuth
 */
export interface ProviderCallbackBody {
  code: string;
  // provider is a path param, not in body here
}

/**
 * POST /v1/token/refresh
 */
export interface RefreshTokenBody {
  refreshToken: string;
}

// General PageInfo structure from Swagger
export interface PageInfo {
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
} 