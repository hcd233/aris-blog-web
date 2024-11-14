export interface OAuthProvider {
  name: string
  icon: string
  enabled: boolean
}

export interface LoginResponse {
  message: string
  code: number
  data: {
    redirect_url?: string
    accessToken?: string
    refreshToken?: string
  }
}

export interface UserInfo {
  id: number
  userName: string
  avatar: string
  email: string
  permission: string
  lastLogin: string
  createdAt: string
} 