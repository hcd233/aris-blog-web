import { PageInfo } from './common.dto';

/**
 * AI/Generation DTOs
 */

// Template entity
export interface Template {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Prompt entity
export interface Prompt {
  promptID: number;
  templates: Template[];
  createdAt: string;
  updatedAt: string;
}

// Request DTOs
export interface CreatePromptRequestDTO {
  templates: Template[];
}

export interface GenerateArticleQARequestDTO {
  articleID: number;
  question: string;
  stream?: boolean;
}

export interface GenerateArticleSummaryRequestDTO {
  articleID: number;
  instruction?: string;
  stream?: boolean;
}

export interface GenerateContentCompletionRequestDTO {
  instruction: string;
  context?: string;
  stream?: boolean;
}

export interface GenerateTermExplanationRequestDTO {
  articleID: number;
  position: number;
  term: string;
  stream?: boolean;
}

// Response DTOs
export interface CreatePromptResponseDTO {
  // Empty response
}

export interface GetLatestPromptResponseDTO {
  prompt: Prompt;
}

export interface ListPromptResponseDTO {
  prompts: Prompt[];
  pageInfo: PageInfo;
}

// Query parameters DTOs
export interface ListPromptsQueryDTO {
  page?: number;
  pageSize?: number;
}