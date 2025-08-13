import apiClient from '@/lib/api-client';
import type {
  ListTagsRequest,
  ListTagsResponse,
  GetTagInfoResponse,
  CreateTagBody,
  CreateTagResponse,
  UpdateTagBody,
  UpdateTagResponse,
  DeleteTagResponse,
} from '@/types/api/tag.types';

class TagService {
  /**
   * 获取标签列表
   */
  async getTagList(params: ListTagsRequest): Promise<ListTagsResponse> {
    const response = await apiClient.get<ListTagsResponse>('/v1/tag/list', { params });
    return response.data as ListTagsResponse;
  }

  /**
   * 获取标签详情
   */
  async getTagInfo(tagID: number): Promise<GetTagInfoResponse> {
    const response = await apiClient.get<GetTagInfoResponse>(`/v1/tag/${tagID}`);
    return response.data as GetTagInfoResponse;
  }

  /**
   * 创建标签
   */
  async createTag(data: CreateTagBody): Promise<CreateTagResponse> {
    const response = await apiClient.post<CreateTagResponse>('/v1/tag', data);
    return response.data as CreateTagResponse;
  }

  /**
   * 更新标签
   */
  async updateTag(tagID: number, data: UpdateTagBody): Promise<UpdateTagResponse> {
    const response = await apiClient.patch<UpdateTagResponse>(`/v1/tag/${tagID}`, data);
    return response.data as UpdateTagResponse;
  }

  /**
   * 删除标签
   */
  async deleteTag(tagID: number): Promise<DeleteTagResponse> {
    const response = await apiClient.delete<DeleteTagResponse>(`/v1/tag/${tagID}`);
    return response.data as DeleteTagResponse;
  }
}

export const tagService = new TagService(); 