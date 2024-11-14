import request from '@/utils/request'
import { API_ROUTES } from '@/constants'
import { LoginResponse } from '@/types/auth'

interface UserInfo {
  avatar: string
  createdAt: string
  email: string
  id: number
  lastLogin: string
  name: string
  permission: string
}

interface OAuthCallbackResponse {
  accessToken: string
  refreshToken: string
}

interface GetCurrentUserResponse {
  user: UserInfo
}

interface ApiResponse<T> {
  message: string
  code: number
  data: T
}

class AuthService {
  static async getOAuthLoginUrl(provider: string) {
    const providerKey = `${provider.toLowerCase()}_LOGIN` as keyof typeof API_ROUTES.AUTH
    return request.get<any, ApiResponse<{ redirect_url: string }>>(API_ROUTES.AUTH[providerKey])
  }

  static async handleOAuthCallback(provider: string, params: Record<string, string>) {
    const normalizedProvider = provider.toLowerCase()
    return request.get<any, ApiResponse<OAuthCallbackResponse>>(
      `/v1/oauth2/${normalizedProvider}/callback`,
      { params }
    )
  }

  static async refreshToken(refreshToken: string) {
    return request.post<any, ApiResponse<{ accessToken: string; refreshToken: string }>>(
      API_ROUTES.AUTH.REFRESH_TOKEN,
      { refreshToken }
    )
  }

  static async getCurrentUser() {
    return request.get<any, ApiResponse<GetCurrentUserResponse>>('/v1/user/me')
  }
}

export default AuthService 