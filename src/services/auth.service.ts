import apiClient from '@/lib/api-client';
import type {
  GetCurrentUserResponse,
  LoginRedirectResponse,
  AuthTokensResponse,
  LogoutResponse,
  CurrentUser,
  UpdateUserBody,
  UpdateUserInfoResponse,
  ProviderCallbackBody, // For generic POST callback
  RefreshTokenBody,
} from '@/types/api/auth.types';

const authService = {
  /**
   * Initiates GitHub OAuth2 login. 
   * Returns a URL to redirect the user to for GitHub authentication.
   */
  redirectToGitHubOAuth: async (): Promise<LoginRedirectResponse> => {
    // GET /v1/oauth2/github/login
    // Response interceptor will extract { redirectURL: string } from response.data.data
    return apiClient.get<LoginRedirectResponse>('/v1/oauth2/github/login');
  },

  /**
   * Handles the callback from GitHub OAuth2.
   * Exchanges the authorization code and state for an access token and refresh token.
   * @param code - The authorization code returned by GitHub.
   * @param state - The state parameter returned by GitHub for CSRF protection.
   */
  handleGitHubOAuthCallback: async (code: string, state: string): Promise<AuthTokensResponse> => {
    // GET /v1/oauth2/github/callback?code={code}&state={state}
    // Response interceptor will extract { accessToken, refreshToken } from response.data.data
    return apiClient.get<AuthTokensResponse>(`/v1/oauth2/github/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
  },
  
  /**
   * Generic OAuth provider callback handler using POST.
   * @param provider - The OAuth provider name (e.g., 'google').
   * @param code - The authorization code.
   */
  handleProviderCallback: async (provider: string, code: string): Promise<AuthTokensResponse> => {
    // POST /v1/auth/callback/{provider}
    // Request body is { code: string }
    const body: ProviderCallbackBody = { code };
    return apiClient.post<AuthTokensResponse>(`/v1/auth/callback/${provider}`, body);
  },

  logout: async (): Promise<LogoutResponse> => {
    await apiClient.post('/v1/auth/logout');
    return { message: 'Logout successful' }; 
  },

  getCurrentUser: async (): Promise<CurrentUser> => {
    // GET /v1/user/current returns { user: CurrentUser } after interceptor processing
    const response = await apiClient.get('/v1/user/current') as GetCurrentUserResponse;
    console.log('[AuthService] getCurrentUser raw response:', response);
    
    // Extract the user object from the response
    if (response && typeof response === 'object' && 'user' in response) {
      return response.user;
    }
    
    // Fallback: if the response structure is different, return as-is
    return response as CurrentUser;
  },

  updateCurrentUser: async (data: UpdateUserBody): Promise<UpdateUserInfoResponse> => {
    return apiClient.patch<UpdateUserInfoResponse>('/v1/user', data);
  },

  refreshToken: async (data: RefreshTokenBody): Promise<AuthTokensResponse> => {
    return apiClient.post<AuthTokensResponse>('/v1/token/refresh', data);
  },
};

export default authService; 