import { BaseService } from './base.service';
import {
  User,
  CurrentUser,
  UserView,
  GetUserInfoResponseDTO,
  GetCurrentUserResponseDTO,
  UpdateUserRequestDTO,
  UpdateUserInfoResponseDTO,
  LogUserViewArticleRequestDTO,
  DeleteUserViewResponseDTO,
  ListUserViewArticlesResponseDTO,
  ListUserViewsQueryDTO,
} from '@/types/dto';

/**
 * User service for managing user data and activities
 */
class UserService extends BaseService {
  /**
   * Get user information by ID
   */
  async getUserInfo(userId: number): Promise<User> {
    const response = await this.get<GetUserInfoResponseDTO>(`/v1/user/${userId}`);
    return response.user;
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<CurrentUser> {
    const response = await this.get<GetCurrentUserResponseDTO>('/v1/user/current');
    return response.user;
  }

  /**
   * Update current user information
   */
  async updateCurrentUser(data: UpdateUserRequestDTO): Promise<UpdateUserInfoResponseDTO> {
    return await this.patch<UpdateUserRequestDTO, UpdateUserInfoResponseDTO>(
      '/v1/user',
      data
    );
  }

  /**
   * Log user's article view with progress
   */
  async logArticleView(
    articleId: number,
    progress: number
  ): Promise<void> {
    const data: LogUserViewArticleRequestDTO = { articleID: articleId, progress };
    await this.post('/v1/user/view/article', data);
  }

  /**
   * Delete a user view record
   */
  async deleteUserView(viewId: number): Promise<DeleteUserViewResponseDTO> {
    return await this.delete<DeleteUserViewResponseDTO>(`/v1/user/view/${viewId}`);
  }

  /**
   * List user's viewed articles
   */
  async listUserViewArticles(
    userId?: number,
    params?: ListUserViewsQueryDTO
  ): Promise<ListUserViewArticlesResponseDTO> {
    const queryString = params ? this.buildQueryString(params) : '';
    const url = userId
      ? `/v1/user/${userId}/view/articles${queryString}`
      : `/v1/user/view/articles${queryString}`;
    return await this.get<ListUserViewArticlesResponseDTO>(url);
  }

  /**
   * Get user's view history
   */
  async getUserViewHistory(params?: ListUserViewsQueryDTO): Promise<UserView[]> {
    const response = await this.listUserViewArticles(undefined, params);
    return response.userViews;
  }
}

// Export singleton instance
export default new UserService();