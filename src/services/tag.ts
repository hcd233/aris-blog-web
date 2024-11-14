import request from '@/utils/request'

export interface TagType {
  id: number
  name: string
  slug: string
}

export interface SearchTagsResponse {
  tags: TagType[]
  queryInfo: {
    filter: string[]
    page: number
    pageSize: number
    query: string
    total: number
  }
}

class TagService {
  static async getTags(page: number = 1, pageSize: number = 10) {
    return request.get<SearchTagsResponse>('/v1/tags', {
      params: {
        page,
        pageSize
      }
    })
  }

  static async searchTags(query: string, page: number = 1, pageSize: number = 10, filter: string = '') {
    return request.get<SearchTagsResponse>('/v1/tag', {
      params: {
        query,
        page,
        pageSize,
        filter
      }
    })
  }
}

export default TagService 