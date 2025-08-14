import { TimestampFields } from './common.dto';

/**
 * Image DTOs
 */

// Base image entity
export interface Image extends TimestampFields {
  imageID: number;
  path: string;
  userID: number;
}

// Response DTOs
export interface GetImageResponseDTO {
  presignedURL: string;
}

export interface UploadImageResponseDTO {
  // Empty response
}

export interface DeleteImageResponseDTO {
  // Empty response
}

export interface ListImagesResponseDTO {
  images: Image[];
}