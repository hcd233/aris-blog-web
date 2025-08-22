import { AxiosInstance } from 'axios';
import apiClient from './api-client';
import {
  articleService,
  authService,
  categoryService,
  commentService,
  tagService,
  userService,
  aiService,
  imageService,
  oAuthService
} from '@/services';

/**
 * Aris Blog SDK - Unified API client for all backend services
 */
export class ArisSDK {
  private client: AxiosInstance;

  constructor(client?: AxiosInstance) {
    this.client = client || apiClient;
  }

  // Article operations
  get articles() {
    return {
      create: articleService.createArticle.bind(articleService),
      get: articleService.getArticle.bind(articleService),
      update: articleService.updateArticle.bind(articleService),
      updateStatus: articleService.updateArticleStatus.bind(articleService),
      delete: articleService.deleteArticle.bind(articleService),
      list: articleService.listArticles.bind(articleService),
      listByCategory: articleService.listArticlesByCategory.bind(articleService),
      
      // Version operations
      createVersion: articleService.createArticleVersion.bind(articleService),
      getVersion: articleService.getArticleVersion.bind(articleService),
      getLatestVersion: articleService.getLatestArticleVersion.bind(articleService),
      listVersions: articleService.listArticleVersions.bind(articleService),
      
      // User interactions
      toggleLike: articleService.toggleArticleLike.bind(articleService),
      logView: articleService.logArticleView.bind(articleService),
      getUserLiked: articleService.getUserLikedArticles.bind(articleService)
    };
  }

  // Category operations
  get categories() {
    return {
      list: categoryService.getCategoryList.bind(categoryService),
      getRoot: categoryService.getRootCategory.bind(categoryService),
      get: categoryService.getCategoryInfo.bind(categoryService),
      getChildren: categoryService.getCategoryChildren.bind(categoryService),
      getArticles: categoryService.getCategoryArticles.bind(categoryService),
      create: categoryService.createCategory.bind(categoryService),
      update: categoryService.updateCategory.bind(categoryService),
      delete: categoryService.deleteCategory.bind(categoryService),
      
      // Utility methods
      getTree: categoryService.getCategoryTree.bind(categoryService),
      hasChildren: categoryService.hasChildren.bind(categoryService),
      hasArticles: categoryService.hasArticles.bind(categoryService),
      checkAndGetChildren: categoryService.checkAndGetChildren.bind(categoryService)
    };
  }

  // Tag operations
  get tags() {
    return {
      list: tagService.getTagList.bind(tagService),
      get: tagService.getTagInfo.bind(tagService),
      create: tagService.createTag.bind(tagService),
      update: tagService.updateTag.bind(tagService),
      delete: tagService.deleteTag.bind(tagService)
    };
  }

  // Authentication operations
  get auth() {
    return {
      initiateOAuth: authService.initiateOAuth.bind(authService),
      handleOAuthCallback: authService.handleOAuthCallback.bind(authService),
      handleProviderCallback: authService.handleProviderCallback.bind(authService),
      redirectToGitHubOAuth: authService.redirectToGitHubOAuth.bind(authService),
      handleGitHubOAuthCallback: authService.handleGitHubOAuthCallback.bind(authService),
      logout: authService.logout.bind(authService),
      getCurrentUser: authService.getCurrentUser.bind(authService),
      updateCurrentUser: authService.updateCurrentUser.bind(authService),
      refreshToken: authService.refreshToken.bind(authService)
    };
  }

  // User operations
  get users() {
    return {
      getInfo: userService.getUserInfo.bind(userService),
      getCurrent: userService.getCurrentUser.bind(userService),
      updateCurrent: userService.updateCurrentUser.bind(userService),
      logArticleView: userService.logArticleView.bind(userService),
      deleteView: userService.deleteUserView.bind(userService),
      listViewArticles: userService.listUserViewArticles.bind(userService),
      getViewHistory: userService.getUserViewHistory.bind(userService)
    };
  }

  // AI operations
  get ai() {
    return {
      createPrompt: aiService.createPrompt.bind(aiService),
      getLatestPrompt: aiService.getLatestPrompt.bind(aiService),
      listPrompts: aiService.listPrompts.bind(aiService),
      generateArticleQA: aiService.generateArticleQA.bind(aiService),
      generateArticleSummary: aiService.generateArticleSummary.bind(aiService),
      generateContentCompletion: aiService.generateContentCompletion.bind(aiService),
      generateTermExplanation: aiService.generateTermExplanation.bind(aiService)
    };
  }

  // Image operations
  get images() {
    return {
      getUrl: imageService.getImageUrl.bind(imageService),
      upload: imageService.uploadImage.bind(imageService),
      delete: imageService.deleteImage.bind(imageService),
      list: imageService.listImages.bind(imageService),
      getMultipleUrls: imageService.getMultipleImageUrls.bind(imageService)
    };
  }

  // OAuth operations
  get oauth() {
    return {
      getProviderConfig: oAuthService.getProviderConfig.bind(oAuthService),
      initiateLogin: oAuthService.initiateLogin.bind(oAuthService),
      handleCallback: oAuthService.handleCallback.bind(oAuthService),
      getSupportedProviders: oAuthService.getSupportedProviders.bind(oAuthService),
      isSupportedProvider: oAuthService.isSupportedProvider.bind(oAuthService)
    };
  }

  // Comment operations
  get comments() {
    return {
      create: commentService.createComment.bind(commentService),
      delete: commentService.deleteComment.bind(commentService),
      toggleLike: commentService.toggleCommentLike.bind(commentService),
      listArticleComments: commentService.listArticleComments.bind(commentService),
      listChildComments: commentService.listChildComments.bind(commentService),
      getUserLiked: commentService.getUserLikedComments.bind(commentService)
    };
  }

  /**
   * Set custom axios instance
   */
  setClient(client: AxiosInstance): void {
    this.client = client;
  }

  /**
   * Get current axios instance
   */
  getClient(): AxiosInstance {
    return this.client;
  }
}

// Export both class and singleton instance
export const arisSDK = new ArisSDK();

export default arisSDK;