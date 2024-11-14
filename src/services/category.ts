import request from '@/utils/request'

export interface Category {
  id: number
  name: string
  parentID: number
}

export interface SubArticle {
  id: number
  slug: string
  status: string
  title: string
}

export interface CategoryResponse {
  categories: Category[]
  pageInfo: {
    page: number
    pageSize: number
    total: number
  }
}

export interface ArticlesResponse {
  articles: SubArticle[]
  pageInfo: {
    page: number
    pageSize: number
    total: number
  }
}

class CategoryService {
  static async getRootCategory(userName: string) {
    return request.get<{ data: Category }>(`/v1/user/${userName}/rootCategory`)
  }

  static async getSubCategories(userName: string, categoryId: number, page: number = 1, pageSize: number = 10) {
    return request.get<CategoryResponse>(`/v1/user/${userName}/category/${categoryId}/subCategories`, {
      params: {
        page,
        pageSize
      }
    })
  }

  static async getSubArticles(userName: string, categoryId: number, page: number = 1, pageSize: number = 10) {
    return request.get<ArticlesResponse>(`/v1/user/${userName}/category/${categoryId}/subArticles`, {
      params: {
        page,
        pageSize
      }
    })
  }
}

export default CategoryService 