/**
 * Example usage of ArisSDK
 * This file demonstrates how to use the unified SDK for all API operations
 */

import { arisSDK } from './sdk';

// Example: Article operations
async function exampleArticleOperations() {
  try {
    // Create a new article
    const newArticle = await arisSDK.articles.create({
      title: 'My New Article',
      content: 'Article content here...',
      categoryID: 1,
      tags: ['javascript', 'typescript']
    });

    // Get article by ID
    const article = await arisSDK.articles.get(newArticle.articleID);

    // List articles with pagination
    const articles = await arisSDK.articles.list({
      page: 1,
      pageSize: 10,
      status: 'published'
    });

    // Like an article
    await arisSDK.articles.toggleLike(article.articleID);

  } catch (error) {
    console.error('Article operation failed:', error);
  }
}

// Example: Category operations
async function exampleCategoryOperations() {
  try {
    // Get category tree
    const categories = await arisSDK.categories.getTree();

    // Get articles in a category
    const categoryArticles = await arisSDK.categories.getArticles({
      categoryID: 1,
      page: 1,
      pageSize: 10
    });

  } catch (error) {
    console.error('Category operation failed:', error);
  }
}

// Example: Authentication operations
async function exampleAuthOperations() {
  try {
    // Get current user
    const currentUser = await arisSDK.auth.getCurrentUser();

    // Update user profile
    await arisSDK.auth.updateCurrentUser({
      displayName: 'Updated Name',
      bio: 'Updated bio...'
    });

    // Initiate OAuth login
    const redirect = await arisSDK.auth.initiateOAuth('github');
    // Redirect user to redirect.url

  } catch (error) {
    console.error('Auth operation failed:', error);
  }
}

// Example: AI operations with streaming
async function exampleAIOperations() {
  try {
    // Generate article summary with streaming
    const summary = await arisSDK.ai.generateArticleSummary(
      {
        articleID: 123,
        stream: true
      },
      (chunk) => {
        console.log('Received chunk:', chunk.delta);
      }
    );

  } catch (error) {
    console.error('AI operation failed:', error);
  }
}

// Example: Image operations
async function exampleImageOperations() {
  try {
    // Upload image
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const result = await arisSDK.images.upload(file);
        console.log('Image uploaded:', result);
      }
    };
    fileInput.click();

  } catch (error) {
    console.error('Image operation failed:', error);
  }
}

// Example: Using custom axios instance
function exampleCustomClient() {
  import axios from 'axios';
  
  // Create custom axios instance
  const customClient = axios.create({
    baseURL: 'https://custom-api.example.com',
    timeout: 30000
  });

  // Create SDK with custom client
  const customSDK = new ArisSDK(customClient);

  return customSDK;
}

// Export examples for testing
export {
  exampleArticleOperations,
  exampleCategoryOperations,
  exampleAuthOperations,
  exampleAIOperations,
  exampleImageOperations,
  exampleCustomClient
};