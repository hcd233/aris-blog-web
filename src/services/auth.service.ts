import apiClient from '@/lib/api-client';
import oAuthService from './oauth.service';
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
  OAuthProvider,
} from '@/types/api/auth.types';

const authService = {
  /**
   * 发起OAuth登录（通用方法）
   * @param provider OAuth提供商
   */
  initiateOAuth: async (provider: OAuthProvider): Promise<LoginRedirectResponse> => {
    return oAuthService.initiateLogin(provider);
  },

  /**
   * 处理OAuth回调（通用方法）
   * @param provider OAuth提供商
   * @param code 授权码
   * @param state 状态参数
   */
  handleOAuthCallback: async (
    provider: OAuthProvider,
    code: string,
    state: string
  ): Promise<AuthTokensResponse> => {
    return oAuthService.handleCallback(provider, code, state);
  },

  // 向后兼容的GitHub方法
  /**
   * @deprecated 使用 initiateOAuth('github') 替代
   */
  redirectToGitHubOAuth: async (): Promise<LoginRedirectResponse> => {
    return authService.initiateOAuth('github');
  },

  /**
   * @deprecated 使用 handleOAuthCallback('github', code, state) 替代
   */
  handleGitHubOAuthCallback: async (code: string, state: string): Promise<AuthTokensResponse> => {
    return authService.handleOAuthCallback('github', code, state);
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
    const res = await apiClient.post<AuthTokensResponse>(`/v1/auth/callback/${provider}`, body);
    return res.data as AuthTokensResponse;
  },

  logout: async (): Promise<LogoutResponse> => {
    // 2. 清理客户端存储
    // 确保只在浏览器环境中执行
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // 3. 重定向到登录页
      // 使用 replace 防止用户通过后退按钮回到需要登录的页面
      window.location.replace('/login');
    }
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
    const res = await apiClient.patch<UpdateUserInfoResponse>('/v1/user', data);
    return res.data as UpdateUserInfoResponse;
  },

  refreshToken: async (data: RefreshTokenBody): Promise<AuthTokensResponse> => {
    const res = await apiClient.post<AuthTokensResponse>('/v1/token/refresh', data);
    return res.data as AuthTokensResponse;
  },
};

export default authService; 