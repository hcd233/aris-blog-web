import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import articleService from '@/services/article.service';
import { mockArticles, mockArticleVersions, mockPageInfo } from '@/lib/mock-data';
import {
  Article,
  ArticleVersion,
  CreateArticleRequestDTO,
  UpdateArticleRequestDTO,
  UpdateArticleStatusRequestDTO,
  ListArticlesQueryDTO,
  ArticleStatus,
} from '@/types/dto';
import { CreateArticleFormData, UpdateArticleFormData } from '@/types/schemas/article.schema';

export const useArticles = (queryParams?: ListArticlesQueryDTO) => {
  const queryClient = useQueryClient();

  // 文章列表查询
  const {
    data: articlesData,
    isLoading: isLoadingArticles,
    error: articlesError,
    refetch: refetchArticles,
  } = useQuery({
    queryKey: ['articles', queryParams],
    queryFn: async () => {
      try {
        return await articleService.listArticles(queryParams);
      } catch (error) {
        // 如果API调用失败，返回模拟数据
        console.warn('API call failed, using mock data:', error);
        return {
          articles: mockArticles,
          pageInfo: mockPageInfo,
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2分钟
  });

  // 创建文章
  const createArticleMutation = useMutation({
    mutationFn: (data: CreateArticleFormData) => {
      const requestData: CreateArticleRequestDTO = {
        title: data.title,
        slug: data.slug,
        categoryID: data.categoryID,
        tags: data.tags,
      };
      return articleService.createArticle(requestData);
    },
    onSuccess: (article) => {
      toast.success('文章创建成功');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.setQueryData(['article', article.articleID], article);
    },
    onError: (error) => {
      toast.error('创建文章失败');
      console.error('Create article error:', error);
    },
  });

  // 更新文章
  const updateArticleMutation = useMutation({
    mutationFn: ({ articleId, data }: { articleId: number; data: UpdateArticleFormData }) => {
      const requestData: UpdateArticleRequestDTO = {
        title: data.title,
        slug: data.slug,
        categoryID: data.categoryID,
        tags: data.tags,
      };
      return articleService.updateArticle(articleId, requestData);
    },
    onSuccess: (_, { articleId }) => {
      toast.success('文章更新成功');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
    },
    onError: (error) => {
      toast.error('更新文章失败');
      console.error('Update article error:', error);
    },
  });

  // 更新文章状态
  const updateArticleStatusMutation = useMutation({
    mutationFn: ({ articleId, status }: { articleId: number; status: ArticleStatus }) => {
      const requestData: UpdateArticleStatusRequestDTO = { status };
      return articleService.updateArticleStatus(articleId, requestData);
    },
    onSuccess: (_, { articleId }) => {
      toast.success('文章状态更新成功');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
    },
    onError: (error) => {
      toast.error('更新文章状态失败');
      console.error('Update article status error:', error);
    },
  });

  // 删除文章
  const deleteArticleMutation = useMutation({
    mutationFn: (articleId: number) => articleService.deleteArticle(articleId),
    onSuccess: (_, articleId) => {
      toast.success('文章删除成功');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.removeQueries({ queryKey: ['article', articleId] });
    },
    onError: (error) => {
      toast.error('删除文章失败');
      console.error('Delete article error:', error);
    },
  });

  return {
    // 数据
    articles: articlesData?.articles || [],
    pageInfo: articlesData?.pageInfo,
    isLoadingArticles,
    articlesError,
    
    // 操作
    refetchArticles,
    createArticle: createArticleMutation.mutate,
    updateArticle: updateArticleMutation.mutate,
    updateArticleStatus: updateArticleStatusMutation.mutate,
    deleteArticle: deleteArticleMutation.mutate,
    
    // 状态
    isCreating: createArticleMutation.isPending,
    isUpdating: updateArticleMutation.isPending,
    isUpdatingStatus: updateArticleStatusMutation.isPending,
    isDeleting: deleteArticleMutation.isPending,
  };
};

export const useArticle = (articleId: number) => {
  const queryClient = useQueryClient();

  // 获取单个文章
  const {
    data: article,
    isLoading: isLoadingArticle,
    error: articleError,
    refetch: refetchArticle,
  } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      try {
        return await articleService.getArticle(articleId);
      } catch (error) {
        // 如果API调用失败，返回模拟数据
        console.warn('API call failed, using mock data:', error);
        return mockArticles.find(a => a.articleID === articleId);
      }
    },
    enabled: !!articleId,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  // 获取最新版本
  const {
    data: latestVersion,
    isLoading: isLoadingVersion,
    error: versionError,
  } = useQuery({
    queryKey: ['article', articleId, 'latest-version'],
    queryFn: async () => {
      try {
        return await articleService.getLatestArticleVersion(articleId);
      } catch (error) {
        // 如果API调用失败，返回模拟数据
        console.warn('API call failed, using mock data:', error);
        const versions = mockArticleVersions[articleId];
        return versions ? versions[versions.length - 1] : null;
      }
    },
    enabled: !!articleId,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  // 获取文章版本列表
  const {
    data: versionsData,
    isLoading: isLoadingVersions,
    error: versionsError,
  } = useQuery({
    queryKey: ['article', articleId, 'versions'],
    queryFn: async () => {
      try {
        return await articleService.listArticleVersions(articleId);
      } catch (error) {
        // 如果API调用失败，返回模拟数据
        console.warn('API call failed, using mock data:', error);
        const versions = mockArticleVersions[articleId] || [];
        return {
          versions,
          pageInfo: {
            currentPage: 1,
            pageSize: 20,
            total: versions.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        };
      }
    },
    enabled: !!articleId,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  // 创建文章版本
  const createVersionMutation = useMutation({
    mutationFn: ({ articleId, content }: { articleId: number; content: string }) => {
      return articleService.createArticleVersion(articleId, { content });
    },
    onSuccess: (_, { articleId }) => {
      toast.success('版本创建成功');
      queryClient.invalidateQueries({ queryKey: ['article', articleId, 'versions'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId, 'latest-version'] });
    },
    onError: (error) => {
      toast.error('创建版本失败');
      console.error('Create version error:', error);
    },
  });

  // 点赞/取消点赞
  const toggleLikeMutation = useMutation({
    mutationFn: ({ articleId, undo }: { articleId: number; undo?: boolean }) => {
      return articleService.toggleArticleLike(articleId, undo);
    },
    onSuccess: (_, { articleId }) => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (error) => {
      toast.error('操作失败');
      console.error('Toggle like error:', error);
    },
  });

  // 记录阅读进度
  const logViewMutation = useMutation({
    mutationFn: ({ articleId, progress }: { articleId: number; progress: number }) => {
      return articleService.logArticleView(articleId, progress);
    },
    onError: (error) => {
      console.error('Log view error:', error);
    },
  });

  return {
    // 数据
    article,
    latestVersion,
    versions: versionsData?.versions || [],
    pageInfo: versionsData?.pageInfo,
    
    // 加载状态
    isLoadingArticle,
    isLoadingVersion,
    isLoadingVersions,
    articleError,
    versionError,
    versionsError,
    
    // 操作
    refetchArticle,
    createVersion: createVersionMutation.mutate,
    toggleLike: toggleLikeMutation.mutate,
    logView: logViewMutation.mutate,
    
    // 状态
    isCreatingVersion: createVersionMutation.isPending,
    isTogglingLike: toggleLikeMutation.isPending,
  };
};

export const useArticleCategories = (categoryId?: number) => {
  const queryClient = useQueryClient();

  // 获取分类下的文章
  const {
    data: categoryArticlesData,
    isLoading: isLoadingCategoryArticles,
    error: categoryArticlesError,
    refetch: refetchCategoryArticles,
  } = useQuery({
    queryKey: ['articles', 'category', categoryId],
    queryFn: () => articleService.listArticlesByCategory(categoryId!),
    enabled: !!categoryId,
    staleTime: 3 * 60 * 1000, // 3分钟
  });

  return {
    articles: categoryArticlesData?.articles || [],
    pageInfo: categoryArticlesData?.pageInfo,
    isLoadingCategoryArticles,
    categoryArticlesError,
    refetchCategoryArticles,
  };
};

export const useUserLikedArticles = (userId?: number) => {
  const queryClient = useQueryClient();

  // 获取用户点赞的文章
  const {
    data: likedArticles,
    isLoading: isLoadingLikedArticles,
    error: likedArticlesError,
    refetch: refetchLikedArticles,
  } = useQuery({
    queryKey: ['articles', 'liked', userId],
    queryFn: () => articleService.getUserLikedArticles(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  return {
    articles: likedArticles || [],
    isLoadingLikedArticles,
    likedArticlesError,
    refetchLikedArticles,
  };
};