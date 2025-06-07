import apiClient from '@/lib/api-client';
import type {
  OAuthProvider,
  OAuthProviderConfig,
  LoginRedirectResponse,
  AuthTokensResponse,
} from '@/types/api/auth.types';

/**
 * OAuth提供商配置
 */
export const OAUTH_PROVIDERS: Record<OAuthProvider, OAuthProviderConfig> = {
  github: {
    name: 'github',
    displayName: 'GitHub',
    icon: 'gitHub',
    color: 'bg-gray-900 hover:bg-gray-800',
  },
  google: {
    name: 'google',
    displayName: 'Google',
    icon: 'google',
    color: 'bg-red-600 hover:bg-red-700',
  },
};

/**
 * 通用OAuth服务
 */
const oAuthService = {
  /**
   * 获取OAuth提供商配置
   * @param provider OAuth提供商
   */
  getProviderConfig: (provider: OAuthProvider): OAuthProviderConfig => {
    return OAUTH_PROVIDERS[provider];
  },

  /**
   * 发起OAuth登录
   * @param provider OAuth提供商（github, google等）
   */
  initiateLogin: async (provider: OAuthProvider): Promise<LoginRedirectResponse> => {
    // GET /v1/oauth2/{provider}/login
    return apiClient.get<LoginRedirectResponse>(`/v1/oauth2/${provider}/login`);
  },

  /**
   * 处理OAuth回调
   * @param provider OAuth提供商
   * @param code 授权码
   * @param state 状态参数（用于CSRF保护）
   */
  handleCallback: async (
    provider: OAuthProvider,
    code: string,
    state: string
  ): Promise<AuthTokensResponse> => {
    // GET /v1/oauth2/{provider}/callback?code={code}&state={state}
    // 注意：不要对code和state进行额外编码，因为它们从URL参数中获取时可能已经被解码
    // 使用URLSearchParams会自动处理必要的编码
    const params = new URLSearchParams({
      code: code,
      state: state,
    });
    
    return apiClient.get<AuthTokensResponse>(
      `/v1/oauth2/${provider}/callback?${params.toString()}`
    );
  },

  /**
   * 获取所有支持的OAuth提供商
   */
  getSupportedProviders: (): OAuthProvider[] => {
    return Object.keys(OAUTH_PROVIDERS) as OAuthProvider[];
  },

  /**
   * 检查是否为支持的OAuth提供商
   * @param provider 提供商名称
   */
  isSupportedProvider: (provider: string): provider is OAuthProvider => {
    return provider in OAUTH_PROVIDERS;
  },
};

export default oAuthService; 