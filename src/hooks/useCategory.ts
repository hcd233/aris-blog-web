import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { categoryService } from '@/services';
import {
  Category,
  CreateCategoryRequestDTO,
  UpdateCategoryRequestDTO,
  ListChildrenCategoriesResponseDTO,
} from '@/types/dto';
import { toast } from 'sonner';

/**
 * Hook to fetch a single category
 */
export function useCategory(categoryId: number) {
  return useQuery<Category>(
    ['category', categoryId],
    () => categoryService.getCategory(categoryId),
    {
      enabled: !!categoryId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch root category
 */
export function useRootCategory() {
  return useQuery<Category>(
    ['category', 'root'],
    () => categoryService.getRootCategory(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

/**
 * Hook to fetch category children
 */
export function useCategoryChildren(categoryId?: number) {
  return useQuery<Category[]>(
    ['category', categoryId || 'root', 'children'],
    async () => {
      if (categoryId) {
        const response = await categoryService.getCategoryChildren(categoryId);
        return response.categories;
      } else {
        // Get root category children
        const root = await categoryService.getRootCategory();
        const response = await categoryService.getCategoryChildren(root.categoryID);
        return response.categories;
      }
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to create a category
 */
export function useCreateCategory() {
  return useMutation<Category, any, CreateCategoryRequestDTO>(
    (data) => categoryService.createCategory(data),
    {
      onSuccess: (category) => {
        toast.success('Category created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create category');
      },
    }
  );
}

/**
 * Hook to update a category
 */
export function useUpdateCategory(categoryId: number) {
  return useMutation<Category, any, UpdateCategoryRequestDTO>(
    (data) => categoryService.updateCategory(categoryId, data),
    {
      onSuccess: () => {
        toast.success('Category updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update category');
      },
    }
  );
}

/**
 * Hook to delete a category
 */
export function useDeleteCategory() {
  return useMutation<void, any, number>(
    (categoryId) => categoryService.deleteCategory(categoryId),
    {
      onSuccess: () => {
        toast.success('Category deleted successfully');
      },
      onError: (error) => {
        toast.error('Failed to delete category');
      },
    }
  );
}

/**
 * Hook to build category tree
 */
export function useCategoryTree() {
  const { data: rootCategory } = useRootCategory();
  
  const buildTree = async (parentId: number): Promise<Category[]> => {
    const response = await categoryService.getCategoryChildren(parentId);
    const categories = response.categories;
    
    // Recursively fetch children for each category
    const categoriesWithChildren = await Promise.all(
      categories.map(async (category) => {
        const children = await buildTree(category.categoryID);
        return {
          ...category,
          children,
        };
      })
    );
    
    return categoriesWithChildren;
  };

  return useQuery<Category[]>(
    ['categoryTree'],
    async () => {
      if (!rootCategory) return [];
      return buildTree(rootCategory.categoryID);
    },
    {
      enabled: !!rootCategory,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}