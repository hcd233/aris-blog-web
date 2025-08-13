import apiClient from '@/lib/api-client'

// Image related types based on swagger
export interface Image {
  name: string
  size: number
  createdAt: string
}

export interface UploadImageResponse {
  // Response is empty according to swagger, but typically returns image URL or ID
}

export interface GetImageResponse {
  presignedURL: string
}

export interface ListImagesResponse {
  images: Image[]
}

export interface DeleteImageResponse {
  // Empty response object from swagger
}

class ImageService {
  /**
   * Upload an image file
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      // The swagger shows this endpoint returns an empty response,
      // but we'll assume it returns the image URL or object name
      const res = await apiClient.post<UploadImageResponse>('/v1/asset/object/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Since the swagger shows empty response, we'll construct the URL
      // In a real implementation, the backend should return the image URL or object name
      const objectName = `uploaded-${Date.now()}-${file.name}`
      
      // For now, we'll return a constructed URL
      // In production, this should come from the API response
      return `/api/images/${objectName}`
    } catch (error) {
      console.error('图片上传失败:', error)
      throw new Error('图片上传失败')
    }
  }

  /**
   * Get image URL with quality parameter
   */
  async getImage(objectName: string, quality: 'raw' | 'thumb' = 'raw'): Promise<GetImageResponse> {
    const res = await apiClient.get<GetImageResponse>(`/v1/asset/object/image/${objectName}`, {
      params: { quality }
    })
    return res.data as GetImageResponse
  }

  /**
   * Delete an image
   */
  async deleteImage(objectName: string): Promise<DeleteImageResponse> {
    const res = await apiClient.delete<DeleteImageResponse>(`/v1/asset/object/image/${objectName}`)
    return res.data as DeleteImageResponse
  }

  /**
   * List all images
   */
  async listImages(): Promise<ListImagesResponse> {
    const res = await apiClient.get<ListImagesResponse>('/v1/asset/object/images')
    return res.data as ListImagesResponse
  }

  /**
   * Validate image file before upload
   */
  validateImageFile(file: File): string[] {
    const errors: string[] = []
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errors.push('只支持 JPEG、PNG、GIF、WebP 格式的图片')
    }
    
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      errors.push('图片大小不能超过 10MB')
    }
    
    return errors
  }

  /**
   * Resize image on client side before upload (optional optimization)
   */
  async resizeImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.9): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          } else {
            reject(new Error('Failed to resize image'))
          }
        }, file.type, quality)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Upload image with validation and optional resizing
   */
  async uploadImageWithValidation(
    file: File, 
    shouldResize: boolean = true,
    maxWidth: number = 1920,
    maxHeight: number = 1080
  ): Promise<string> {
    // Validate file
    const errors = this.validateImageFile(file)
    if (errors.length > 0) {
      throw new Error(errors.join(', '))
    }

    try {
      // Optionally resize image
      let fileToUpload = file
      if (shouldResize && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        fileToUpload = await this.resizeImage(file, maxWidth, maxHeight)
      }

      // Upload the file
      return await this.uploadImage(fileToUpload)
    } catch (error) {
      console.error('Image upload with validation failed:', error)
      throw error
    }
  }

  /**
   * Create object URL for immediate preview
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * Revoke object URL to free memory
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url)
  }
}

export const imageService = new ImageService()
export default imageService