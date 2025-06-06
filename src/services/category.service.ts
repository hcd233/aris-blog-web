import apiClient from '@/lib/api-client'
import type {
  Category,
  CategoryArticle,
  GetCategoryListParams,
  GetCategoryListResponse,
  GetCategoryInfoResponse,
  GetRootCategoryResponse,
  GetCategoryChildrenParams,
  GetCategoryChildrenResponse,
  GetCategoryArticlesParams,
  GetCategoryArticlesResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
} from '@/types/api/category.types'

class CategoryService {
  // 获取分类列表
  async getCategoryList(params: GetCategoryListParams = {}): Promise<GetCategoryListResponse> {
    const { page = 1, pageSize = 10 } = params
    
    return await apiClient.get('/v1/category/list', {
      params: { page, pageSize }
    })
  }

  // 获取根分类
  async getRootCategory(): Promise<GetRootCategoryResponse> {
    return await apiClient.get('/v1/category/root')
  }

  // 获取分类详情
  async getCategoryInfo(categoryID: number): Promise<GetCategoryInfoResponse> {
    return await apiClient.get(`/v1/category/${categoryID}`)
  }

  // 获取子分类列表
  async getCategoryChildren(params: GetCategoryChildrenParams): Promise<GetCategoryChildrenResponse> {
    const { categoryID, page = 1, pageSize = 10 } = params
    
    return await apiClient.get(`/v1/category/${categoryID}/subCategories`, {
      params: { page, pageSize }
    })
  }

  // 获取分类下的文章列表
  async getCategoryArticles(params: GetCategoryArticlesParams): Promise<GetCategoryArticlesResponse> {
    const { categoryID, page = 1, pageSize = 10 } = params
    
    return await apiClient.get(`/v1/category/${categoryID}/subArticles`, {
      params: { page, pageSize }
    })
  }

  // 创建分类
  async createCategory(data: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    return await apiClient.post('/v1/category', data)
  }

  // 更新分类
  async updateCategory(categoryID: number, data: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    return await apiClient.patch(`/v1/category/${categoryID}`, data)
  }

  // 删除分类
  async deleteCategory(categoryID: number): Promise<DeleteCategoryResponse> {
    return await apiClient.delete(`/v1/category/${categoryID}`)
  }

  // 工具方法：获取分类树（从二级目录开始）
  async getCategoryTree(): Promise<Category[]> {
    try {
      // 先获取根分类
      const rootResponse = await this.getRootCategory()
      const rootCategory = rootResponse.category
      
      // 获取根分类的子分类（二级目录）
      const childrenResponse = await this.getCategoryChildren({ 
        categoryID: rootCategory.categoryID 
      })
      
      return childrenResponse.categories
    } catch (error) {
      console.error('获取分类树失败:', error)
      throw error
    }
  }

  // 工具方法：检查分类是否有子分类
  async hasChildren(categoryID: number): Promise<boolean> {
    try {
      const response = await this.getCategoryChildren({ 
        categoryID, 
        page: 1, 
        pageSize: 1 
      })
      
      return response.categories.length > 0
    } catch (error) {
      console.error('检查子分类失败:', error)
      return false
    }
  }

  // 工具方法：检查分类是否有文章
  async hasArticles(categoryID: number): Promise<boolean> {
    try {
      const response = await this.getCategoryArticles({ 
        categoryID, 
        page: 1, 
        pageSize: 1 
      })
      
      return response.articles.length > 0
    } catch (error) {
      console.error('检查分类文章失败:', error)
      return false
    }
  }
}

export const categoryService = new CategoryService() 