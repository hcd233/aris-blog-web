import apiClient from '@/lib/api-client'
import type {
  Category,
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
    
    const res = await apiClient.get<GetCategoryListResponse>('/v1/category/list', {
      params: { page, pageSize }
    })
    return res.data as GetCategoryListResponse
  }

  // 获取根分类
  async getRootCategory(): Promise<GetRootCategoryResponse> {
    const res = await apiClient.get<GetRootCategoryResponse>('/v1/category/root')
    return res.data as GetRootCategoryResponse
  }

  // 获取分类详情
  async getCategoryInfo(categoryID: number): Promise<GetCategoryInfoResponse> {
    const res = await apiClient.get<GetCategoryInfoResponse>(`/v1/category/${categoryID}`)
    return res.data as GetCategoryInfoResponse
  }

  // 获取子分类列表
  async getCategoryChildren(params: GetCategoryChildrenParams): Promise<GetCategoryChildrenResponse> {
    const { categoryID, page = 1, pageSize = 10 } = params
    
    const res = await apiClient.get<GetCategoryChildrenResponse>(`/v1/category/${categoryID}/subCategories`, {
      params: { page, pageSize }
    })
    return res.data as GetCategoryChildrenResponse
  }

  // 获取分类下的文章列表
  async getCategoryArticles(params: GetCategoryArticlesParams): Promise<GetCategoryArticlesResponse> {
    const { categoryID, page = 1, pageSize = 10 } = params
    
    const res = await apiClient.get<GetCategoryArticlesResponse>(`/v1/category/${categoryID}/subArticles`, {
      params: { page, pageSize }
    })
    return res.data as GetCategoryArticlesResponse
  }

  // 创建分类
  async createCategory(data: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    const res = await apiClient.post<CreateCategoryResponse>('/v1/category', data)
    return res.data as CreateCategoryResponse
  }

  // 更新分类
  async updateCategory(categoryID: number, data: UpdateCategoryRequest): Promise<UpdateCategoryResponse> {
    const res = await apiClient.patch<UpdateCategoryResponse>(`/v1/category/${categoryID}`, data)
    return res.data as UpdateCategoryResponse
  }

  // 删除分类
  async deleteCategory(categoryID: number): Promise<DeleteCategoryResponse> {
    const res = await apiClient.delete<DeleteCategoryResponse>(`/v1/category/${categoryID}`)
    return res.data as DeleteCategoryResponse
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

  // 优化方法：检查分类是否有子分类并返回子分类数据（避免重复请求）
  async checkAndGetChildren(categoryID: number, pageSize: number = 10): Promise<{
    hasChildren: boolean;
    children?: GetCategoryChildrenResponse;
  }> {
    try {
      const response = await this.getCategoryChildren({
        categoryID,
        page: 1,
        pageSize
      })
      
      return {
        hasChildren: response.categories.length > 0,
        children: response
      }
    } catch (error) {
      console.error('检查并获取子分类失败:', error)
      return { hasChildren: false }
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