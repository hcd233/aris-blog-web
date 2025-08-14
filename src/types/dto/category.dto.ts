import { TimestampFields } from './common.dto';

/**
 * Category DTOs
 */

// Base category entity
export interface Category extends TimestampFields {
  categoryID: number;
  name: string;
  parentID?: number;
}

// Request DTOs
export interface CreateCategoryRequestDTO {
  name: string;
  parentID?: number;
}

export interface UpdateCategoryRequestDTO {
  name?: string;
  parentID?: number;
}

// Response DTOs
export interface CreateCategoryResponseDTO {
  category: Category;
}

export interface GetCategoryInfoResponseDTO {
  category: Category;
}

export interface GetRootCategoryResponseDTO {
  category: Category;
}

export interface UpdateCategoryResponseDTO {
  category: Category;
}

export interface DeleteCategoryResponseDTO {
  // Empty response
}

export interface ListChildrenCategoriesResponseDTO {
  categories: Category[];
}

// Query parameters DTOs
export interface ListCategoriesQueryDTO {
  parentID?: number;
}