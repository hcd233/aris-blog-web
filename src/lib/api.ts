const API_BASE_URL = 'http://9.134.115.68:8170'

interface UserInfo {
  userID: number
  name: string
  email: string
  avatar: string
  lastLogin: string
}

interface Article {
  articleID: number
  title: string
  slug: string
  tags: string[]
  createdAt: string
  views: number
  likes: number
  comments: number
  userID: number
  user?: {
    name: string
    avatar: string
  }
}

interface ArticleDetail extends Article {
  content: string
  version: number
  updatedAt: string
}

interface ArticleVersion {
  version: number
  content: string
  createdAt: string
}

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
    const articles = await Promise.all(
      data.data.articles.map(async (article: Article) => {
        if (!article.user) {
          try {
            const userData = await ApiService.getUserInfo(article.userID)
            article.user = {
              name: userData.name,
              avatar: userData.avatar
            }
          } catch (error) {
            console.error(`获取用户 ${article.userID} 信息失败:`, error)
            article.user = {
              name: 'anonymous',
              avatar: ''
            }
          }
        }
        return article
      })
    )
    
    return { ...data.data, articles }
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

  static async getUserInfo(userID: number) {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(
      `${API_BASE_URL}/v1/user/${userID}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
        },
      }
    )
    
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
    return data.data.user as UserInfo
  }

  static async getArticleBySlug(authorName: string, articleSlug: string) {
    const token = localStorage.getItem('accessToken')
    const response = await fetch(
      `${API_BASE_URL}/v1/article/slug/${authorName}/${articleSlug}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || '',
        },
        credentials: 'include'
      }
    )
    
    const data = await response.json()
    
    if (!data.data || !data.data.article) {
      throw new Error(data.error || '文章不存在')
    }
    
    return data.data.article as ArticleDetail
  }

  static async getArticleContent(articleID: number, version?: number) {
    const token = localStorage.getItem('accessToken')
    const url = version 
      ? `${API_BASE_URL}/v1/article/${articleID}/version/v${version}`
      : `${API_BASE_URL}/v1/article/${articleID}/version/latest`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('获取文章内容失败:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(errorData.error || '获取文章内容失败')
    }
    
    const data = await response.json()
    return data.data.version as ArticleVersion
  }
} 