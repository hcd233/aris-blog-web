import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { tagService } from '@/services';
import type { Tag, CreateTagRequestDTO, UpdateTagRequestDTO } from '@/types/dto';
import { toast } from 'sonner';

/**
 * Hook to fetch tags list
 */
export function useTags(params?: { page?: number; pageSize?: number }) {
  return useQuery<Tag[]>(
    ['tags', params],
    async () => {
      const response = await tagService.getTagList({
        page: params?.page || 1,
        pageSize: params?.pageSize || 100,
      });
      return response?.tags || [];
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to fetch a single tag
 */
export function useTag(tagId: number) {
  return useQuery<Tag>(
    ['tag', tagId],
    () => tagService.getTagInfo(tagId),
    {
      enabled: !!tagId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

/**
 * Hook to create a tag
 */
export function useCreateTag() {
  return useMutation<Tag, any, CreateTagRequestDTO>(
    (data) => tagService.createTag(data),
    {
      onSuccess: (tag) => {
        toast.success('Tag created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create tag');
      },
    }
  );
}

/**
 * Hook to update a tag
 */
export function useUpdateTag(tagId: number) {
  return useMutation<Tag, any, UpdateTagRequestDTO>(
    (data) => tagService.updateTag(tagId, data),
    {
      onSuccess: () => {
        toast.success('Tag updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update tag');
      },
    }
  );
}

/**
 * Hook to delete a tag
 */
export function useDeleteTag() {
  return useMutation<void, any, number>(
    (tagId) => tagService.deleteTag(tagId),
    {
      onSuccess: () => {
        toast.success('Tag deleted successfully');
      },
      onError: (error) => {
        toast.error('Failed to delete tag');
      },
    }
  );
}