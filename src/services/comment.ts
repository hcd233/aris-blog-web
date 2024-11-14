import request from '@/utils/request'

interface Commenter {
  id: number
  name: string
  avatar: string
}

interface ParentComment {
  id: number
  content: string
  likes: number
  commenter: Commenter
}

export interface Comment {
  id: number
  content: string
  createdAt: string
  likes: number
  parent: ParentComment | null
  commenter: Commenter
}

interface PageInfo {
  page: number
  pageSize: number
  total: number
}

interface CommentResponse {
  comments: Comment[]
  pageInfo: PageInfo
}

class CommentService {
  static async getArticleComments(userName: string, articleSlug: string, page: number = 1, pageSize: number = 10) {
    return request.get<any, ApiResponse<CommentResponse>>(
      `/v1/user/${userName}/article/${articleSlug}/comments`,
      { params: { page, pageSize } }
    )
  }

  static async getSubComments(userName: string, articleSlug: string, commentId: number, page: number = 1, pageSize: number = 10) {
    return request.get<any, ApiResponse<CommentResponse>>(
      `/v1/user/${userName}/article/${articleSlug}/comment/${commentId}/subComments`,
      { params: { page, pageSize } }
    )
  }

  static async createComment(
    userName: string, 
    articleSlug: string, 
    content: string, 
    replyTo?: number | undefined
  ) {
    return request.post<any, ApiResponse<Comment>>(
      `/v1/user/${userName}/article/${articleSlug}/comment`,
      replyTo ? { content, replyTo } : { content }
    )
  }

  static async likeComment(userName: string, commentId: number, undo: boolean = false) {
    return request.post<any, ApiResponse<null>>(
      `/v1/user/${userName}/operation/like/comment`,
      { commentId, undo }
    )
  }

  static async likeArticle(userName: string, articleSlug: string, undo: boolean = false) {
    return request.post<any, ApiResponse<null>>(
      `/v1/user/${userName}/operation/like/article`,
      { articleSlug, author: userName, undo }
    )
  }
}

export default CommentService 