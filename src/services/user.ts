import request from '@/utils/request'
import { API_ROUTES } from '@/constants'
import { UserInfo } from '@/types/auth'
import { ApiResponse } from '@/types/common'

class UserService {
  static async getUserProfile(userName: string) {
    return request.get<any, ApiResponse<UserInfo>>(`${API_ROUTES.USER.PROFILE}/${userName}`)
  }

  static async updateUserProfile(userName: string, data: Partial<UserInfo>) {
    return request.put<any, ApiResponse<UserInfo>>(`${API_ROUTES.USER.PROFILE}/${userName}`, data)
  }
}

export default UserService 