/**
 * Auth DTOs
 */

// OAuth provider types
export type OAuthProvider = 'github' | 'google' | 'microsoft';

// Request DTOs
export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface ProviderCallbackRequestDTO {
  code: string;
  state?: string;
}

// Response DTOs
export interface LoginResponseDTO {
  redirectURL: string;
}

export interface CallbackResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponseDTO {
  message: string;
}

// Auth token interfaces
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// OAuth callback parameters
export interface OAuthCallbackParams {
  code: string;
  state: string;
}