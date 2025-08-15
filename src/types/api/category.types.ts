import { PageInfo } from './common.types'

// 基础分类接口 - 对应 protocol.Category
export interface Category {
  categoryID: number
  name: string
  parentID: number
  createdAt: string
  updatedAt: string
}

// 扩展的分类接口 - 用于树形结构展示
export interface CategoryTreeNode extends Category {
  // 懒加载状态
  isExpanded: boolean
  isLoading: boolean
  hasChildren: boolean
  hasLoadedChildren: boolean
  hasMoreChildren: boolean
  hasMoreArticles: boolean
  
  // 子节点数据
  children: CategoryTreeNode[]
  childrenPageInfo?: PageInfo
  
  // 文章数据（如果需要展示）
  articles?: CategoryArticle[]
  articlesPageInfo?: PageInfo
  hasLoadedArticles: boolean
}

// 分类下的文章简化信息
export interface CategoryArticle {
  articleID: number
  title: string
  slug: string
  status: string
  publishedAt: string
  updatedAt: string
  userID: number
  views: number
  likes: number
  comments: number
}

// API 请求和响应类型

// 获取分类列表
export interface GetCategoryListParams {
  page?: number
  pageSize?: number
}

export interface GetCategoryListResponse {
  categories: Category[]
  pageInfo: PageInfo
}

// 获取分类详情
export interface GetCategoryInfoResponse {
  category: Category
}

// 获取根分类
export interface GetRootCategoryResponse {
  category: Category
}

// 获取子分类列表
export interface GetCategoryChildrenParams {
  categoryID: number
  page?: number
  pageSize?: number
}

export interface GetCategoryChildrenResponse {
  categories: Category[]
  pageInfo: PageInfo
}

// 获取分类下的文章列表
export interface GetCategoryArticlesParams {
  categoryID: number
  page?: number
  pageSize?: number
}

export interface GetCategoryArticlesResponse {
  articles: CategoryArticle[]
  pageInfo: PageInfo
}

// 创建分类
export interface CreateCategoryRequest {
  name: string
  parentID?: number
}

export interface CreateCategoryResponse {
  category: Category
}

// 更新分类
export interface UpdateCategoryRequest {
  name?: string
  parentID?: number
}

export interface UpdateCategoryResponse {
  category: Category
}

// 删除分类
export type DeleteCategoryResponse = Record<string, never>;

// 树形结构操作类型
export interface CategoryTreeAction {
  type: 'EXPAND' | 'COLLAPSE' | 'LOAD_CHILDREN' | 'LOAD_ARTICLES' | 'SET_LOADING' | 'ADD_CHILD' | 'UPDATE_NODE' | 'DELETE_NODE'
  categoryID: number
  payload?: unknown
}

// 分类树状态类型
export interface CategoryTreeState {
  rootCategories: CategoryTreeNode[]
  loading: boolean
  error: string | null
  totalCount: number
} 