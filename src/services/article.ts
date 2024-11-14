import request from '@/utils/request'

interface Tag {
  id: number
  name: string
  slug: string
}

interface Author {
  id: number
  name: string
  avatar: string
}

export interface Article {
  id: number
  title: string
  slug: string
  status: string
  publishedAt: string
  likes: number
  comments: number
  views: number
  tags: Tag[]
  user: Author
}

export interface ArticleVersion {
  id: number
  content: string
  version: number
  createdAt: string
}

class ArticleService {
  static async getArticles(page: number = 1, pageSize: number = 10) {
    return request.get<any, ApiResponse<{ articles: Article[]; pageInfo: any }>>('/v1/articles', {
      params: { page, pageSize }
    })
  }

  static async getArticle(userName: string, articleSlug: string) {
    return request.get<any, ApiResponse<Article>>(`/v1/user/${userName}/article/${articleSlug}`)
  }

  static async getLatestVersion(userName: string, articleSlug: string) {
    return request.get<any, ApiResponse<ArticleVersion>>(
      `/v1/user/${userName}/article/${articleSlug}/version/latest`
    )
  }
}

export default ArticleService 