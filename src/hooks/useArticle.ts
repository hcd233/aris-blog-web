import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { articleService } from '@/services';
import {
  Article,
  ArticleVersion,
  CreateArticleRequestDTO,
  UpdateArticleRequestDTO,
  UpdateArticleStatusRequestDTO,
  ListArticlesQueryDTO,
  ListArticlesResponseDTO,
  CreateArticleVersionRequestDTO,
  ArticleStatus,
} from '@/types/dto';
import { toast } from 'sonner';

/**
 * Hook to fetch a single article
 */
export function useArticle(articleId: number) {
  return useQuery<Article>(
    ['article', articleId],
    () => articleService.getArticle(articleId),
    {
      enabled: !!articleId,
      staleTime: 30 * 1000, // 30 seconds
    }
  );
}

/**
 * Hook to fetch articles list
 */
export function useArticles(params?: ListArticlesQueryDTO) {
  return useQuery<ListArticlesResponseDTO>(
    ['articles', params],
    () => articleService.listArticles(params),
    {
      staleTime: 60 * 1000, // 1 minute
    }
  );
}

/**
 * Hook to create an article
 */
export function useCreateArticle() {
  return useMutation<Article, any, CreateArticleRequestDTO>(
    (data) => articleService.createArticle(data),
    {
      onSuccess: (article) => {
        toast.success('Article created successfully');
      },
      onError: (error) => {
        toast.error('Failed to create article');
      },
    }
  );
}

/**
 * Hook to update an article
 */
export function useUpdateArticle(articleId: number) {
  return useMutation<void, any, UpdateArticleRequestDTO>(
    (data) => articleService.updateArticle(articleId, data),
    {
      onSuccess: () => {
        toast.success('Article updated successfully');
      },
      onError: (error) => {
        toast.error('Failed to update article');
      },
    }
  );
}

/**
 * Hook to update article status
 */
export function useUpdateArticleStatus(articleId: number) {
  return useMutation<void, any, ArticleStatus>(
    (status) => articleService.updateArticleStatus(articleId, { status }),
    {
      onSuccess: (_, status) => {
        const message = status === ArticleStatus.PUBLISH 
          ? 'Article published successfully' 
          : 'Article saved as draft';
        toast.success(message);
      },
      onError: (error) => {
        toast.error('Failed to update article status');
      },
    }
  );
}

/**
 * Hook to delete an article
 */
export function useDeleteArticle() {
  return useMutation<void, any, number>(
    (articleId) => articleService.deleteArticle(articleId),
    {
      onSuccess: () => {
        toast.success('Article deleted successfully');
      },
      onError: (error) => {
        toast.error('Failed to delete article');
      },
    }
  );
}

/**
 * Hook to fetch article version
 */
export function useArticleVersion(articleId: number, version: number) {
  return useQuery<ArticleVersion>(
    ['article', articleId, 'version', version],
    () => articleService.getArticleVersion(articleId, version),
    {
      enabled: !!articleId && !!version,
    }
  );
}

/**
 * Hook to fetch latest article version
 */
export function useLatestArticleVersion(articleId: number) {
  return useQuery<ArticleVersion>(
    ['article', articleId, 'version', 'latest'],
    () => articleService.getLatestArticleVersion(articleId),
    {
      enabled: !!articleId,
    }
  );
}

/**
 * Hook to create article version
 */
export function useCreateArticleVersion(articleId: number) {
  return useMutation<ArticleVersion, any, CreateArticleVersionRequestDTO>(
    (data) => articleService.createArticleVersion(articleId, data),
    {
      onSuccess: () => {
        toast.success('Article version saved successfully');
      },
      onError: (error) => {
        toast.error('Failed to save article version');
      },
    }
  );
}

/**
 * Hook to toggle article like
 */
export function useToggleArticleLike() {
  return useMutation<void, any, { articleId: number; undo?: boolean }>(
    ({ articleId, undo }) => articleService.toggleArticleLike(articleId, undo),
    {
      onSuccess: (_, { undo }) => {
        toast.success(undo ? 'Article unliked' : 'Article liked');
      },
      onError: (error) => {
        toast.error('Failed to update like status');
      },
    }
  );
}