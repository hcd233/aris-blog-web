import { BaseService } from './base.service';
import {
  Comment,
  CreateArticleCommentRequestDTO,
  CreateArticleCommentResponseDTO,
  DeleteCommentResponseDTO,
  LikeCommentRequestDTO,
  LikeCommentResponseDTO,
  ListArticleCommentsResponseDTO,
  ListChildrenCommentsResponseDTO,
  ListUserLikeCommentsResponseDTO,
  ListCommentsQueryDTO,
} from '@/types/dto';

/**
 * Comment service for managing article comments
 */
class CommentService extends BaseService {
  /**
   * Create a new comment on an article
   */
  async createComment(data: CreateArticleCommentRequestDTO): Promise<Comment> {
    const response = await this.post<CreateArticleCommentRequestDTO, CreateArticleCommentResponseDTO>(
      '/v1/article/comment',
      data
    );
    return response.comment;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number): Promise<DeleteCommentResponseDTO> {
    return await this.delete<DeleteCommentResponseDTO>(`/v1/comment/${commentId}`);
  }

  /**
   * Like or unlike a comment
   */
  async toggleCommentLike(
    commentId: number,
    undo = false
  ): Promise<LikeCommentResponseDTO> {
    const data: LikeCommentRequestDTO = { commentID: commentId, undo };
    return await this.post<LikeCommentRequestDTO, LikeCommentResponseDTO>(
      '/v1/user/like/comment',
      data
    );
  }

  /**
   * List comments for an article
   */
  async listArticleComments(
    articleId: number,
    params?: ListCommentsQueryDTO
  ): Promise<Comment[]> {
    const queryString = params ? this.buildQueryString(params) : '';
    const response = await this.get<ListArticleCommentsResponseDTO>(
      `/v1/article/${articleId}/comments${queryString}`
    );
    return response.comments;
  }

  /**
   * List child comments (replies) for a comment
   */
  async listChildComments(
    commentId: number,
    params?: ListCommentsQueryDTO
  ): Promise<Comment[]> {
    const queryString = params ? this.buildQueryString(params) : '';
    const response = await this.get<ListChildrenCommentsResponseDTO>(
      `/v1/comment/${commentId}/comments${queryString}`
    );
    return response.comments;
  }

  /**
   * Get user's liked comments
   */
  async getUserLikedComments(userId?: number): Promise<Comment[]> {
    const url = userId 
      ? `/v1/user/${userId}/like/comments`
      : '/v1/user/like/comments';
    const response = await this.get<ListUserLikeCommentsResponseDTO>(url);
    return response.comments;
  }
}

// Export singleton instance
export default new CommentService();