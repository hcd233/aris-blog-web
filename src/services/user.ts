import request from '@/utils/request'

export interface SearchUser {
  id: number
  userName: string
  avatar: string
}

export interface SearchUsersResponse {
  users: SearchUser[]
  queryInfo: {
    filter: string[]
    page: number
    pageSize: number
    query: string
    total: number
  }
}

class UserService {
  static async searchUsers(query: string, page: number = 1, pageSize: number = 10) {
    return request.get<SearchUsersResponse>('/v1/user', {
      params: {
        query,
        page,
        pageSize
      }
    })
  }
}

export default UserService 