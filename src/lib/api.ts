const API_BASE_URL = 'http://9.134.115.68:8170'

export class ApiService {
  static async login(provider: 'github' | 'google' | 'qq' = 'github') {
    const response = await fetch(`${API_BASE_URL}/v1/oauth2/${provider}/login`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('登录请求失败')
    }
    
    const data = await response.json()
    const redirectURL = data.data.redirectURL.replace(
      'http://9.134.115.68:3000/auth/callback',
      `http://9.134.115.68:3000/auth/${provider}/callback`
    )
    return { redirectURL }
  }

  static async handleCallback(code: string, state: string, provider: string = 'github') {
    const response = await fetch(
      `${API_BASE_URL}/v1/oauth2/${provider}/callback?code=${code}&state=${state}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      throw new Error('回调请求失败')
    }
    
    const data = await response.json()
    if (data.error) {
      throw new Error(data.error)
    }
    return data.data as { accessToken: string; refreshToken: string }
  }

  static async getCurrentUser(token: string) {
    const response = await fetch(`${API_BASE_URL}/v1/user/current`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('获取用户信息失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(errorData.error || '获取用户信息失败')
    }
    
    const data = await response.json()
    return data.data.user
  }

  static async getArticles(page: number = 1, pageSize: number = 10) {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(
      `${API_BASE_URL}/v1/article/list?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
        },
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('获取文章列表失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(errorData.error || '获取文章列表失败')
    }
    
    const data = await response.json()
    return data.data
  }

  static async getTags(page: number = 1, pageSize: number = 20) {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(
      `${API_BASE_URL}/v1/tag/list?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
        },
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('获取标签列表失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(errorData.error || '获取标签列表失败')
    }
    
    const data = await response.json()
    return data.data
  }
} 