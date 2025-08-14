import { BaseService } from './base.service';
import {
  Image,
  GetImageResponseDTO,
  UploadImageResponseDTO,
  DeleteImageResponseDTO,
  ListImagesResponseDTO,
} from '@/types/dto';

/**
 * Image service for managing image uploads and retrieval
 */
class ImageService extends BaseService {
  /**
   * Get presigned URL for an image
   */
  async getImageUrl(imageId: number): Promise<string> {
    const response = await this.get<GetImageResponseDTO>(`/v1/image/${imageId}`);
    return response.presignedURL;
  }

  /**
   * Upload an image
   * @param file The image file to upload
   */
  async uploadImage(file: File): Promise<UploadImageResponseDTO> {
    const formData = new FormData();
    formData.append('image', file);

    return await this.post<FormData, UploadImageResponseDTO>(
      '/v1/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  /**
   * Delete an image
   */
  async deleteImage(imageId: number): Promise<DeleteImageResponseDTO> {
    return await this.delete<DeleteImageResponseDTO>(`/v1/image/${imageId}`);
  }

  /**
   * List user's images
   */
  async listImages(userId?: number): Promise<Image[]> {
    const url = userId ? `/v1/user/${userId}/images` : '/v1/images';
    const response = await this.get<ListImagesResponseDTO>(url);
    return response.images;
  }

  /**
   * Get multiple image URLs
   */
  async getMultipleImageUrls(imageIds: number[]): Promise<Record<number, string>> {
    const urls: Record<number, string> = {};
    
    // Fetch URLs in parallel
    await Promise.all(
      imageIds.map(async (id) => {
        try {
          urls[id] = await this.getImageUrl(id);
        } catch (error) {
          console.error(`Failed to get URL for image ${id}:`, error);
          urls[id] = ''; // Set empty string for failed requests
        }
      })
    );

    return urls;
  }
}

// Export singleton instance
export default new ImageService();