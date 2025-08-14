import { BaseService } from './base.service';
import {
  Prompt,
  Template,
  CreatePromptRequestDTO,
  CreatePromptResponseDTO,
  GetLatestPromptResponseDTO,
  ListPromptResponseDTO,
  ListPromptsQueryDTO,
  GenerateArticleQARequestDTO,
  GenerateArticleSummaryRequestDTO,
  GenerateContentCompletionRequestDTO,
  GenerateTermExplanationRequestDTO,
  SSEResponse,
} from '@/types/dto';

/**
 * AI service for content generation and prompts
 */
class AIService extends BaseService {
  /**
   * Create a new prompt template
   */
  async createPrompt(templates: Template[]): Promise<CreatePromptResponseDTO> {
    const data: CreatePromptRequestDTO = { templates };
    return await this.post<CreatePromptRequestDTO, CreatePromptResponseDTO>(
      '/v1/prompt',
      data
    );
  }

  /**
   * Get the latest prompt
   */
  async getLatestPrompt(): Promise<Prompt> {
    const response = await this.get<GetLatestPromptResponseDTO>('/v1/prompt/latest');
    return response.prompt;
  }

  /**
   * List all prompts with pagination
   */
  async listPrompts(params?: ListPromptsQueryDTO): Promise<ListPromptResponseDTO> {
    const queryString = params ? this.buildQueryString(params) : '';
    return await this.get<ListPromptResponseDTO>(`/v1/prompts${queryString}`);
  }

  /**
   * Generate Q&A for an article
   * @param data Request data
   * @param onChunk Callback for streaming responses
   */
  async generateArticleQA(
    data: GenerateArticleQARequestDTO,
    onChunk?: (chunk: SSEResponse) => void
  ): Promise<string> {
    if (data.stream && onChunk) {
      return this.streamGeneration('/v1/generate/article/qa', data, onChunk);
    }
    
    const response = await this.post<GenerateArticleQARequestDTO, { content: string }>(
      '/v1/generate/article/qa',
      data
    );
    return response.content;
  }

  /**
   * Generate summary for an article
   * @param data Request data
   * @param onChunk Callback for streaming responses
   */
  async generateArticleSummary(
    data: GenerateArticleSummaryRequestDTO,
    onChunk?: (chunk: SSEResponse) => void
  ): Promise<string> {
    if (data.stream && onChunk) {
      return this.streamGeneration('/v1/generate/article/summary', data, onChunk);
    }
    
    const response = await this.post<GenerateArticleSummaryRequestDTO, { content: string }>(
      '/v1/generate/article/summary',
      data
    );
    return response.content;
  }

  /**
   * Generate content completion
   * @param data Request data
   * @param onChunk Callback for streaming responses
   */
  async generateContentCompletion(
    data: GenerateContentCompletionRequestDTO,
    onChunk?: (chunk: SSEResponse) => void
  ): Promise<string> {
    if (data.stream && onChunk) {
      return this.streamGeneration('/v1/generate/content/completion', data, onChunk);
    }
    
    const response = await this.post<GenerateContentCompletionRequestDTO, { content: string }>(
      '/v1/generate/content/completion',
      data
    );
    return response.content;
  }

  /**
   * Generate term explanation
   * @param data Request data
   * @param onChunk Callback for streaming responses
   */
  async generateTermExplanation(
    data: GenerateTermExplanationRequestDTO,
    onChunk?: (chunk: SSEResponse) => void
  ): Promise<string> {
    if (data.stream && onChunk) {
      return this.streamGeneration('/v1/generate/term/explanation', data, onChunk);
    }
    
    const response = await this.post<GenerateTermExplanationRequestDTO, { content: string }>(
      '/v1/generate/term/explanation',
      data
    );
    return response.content;
  }

  /**
   * Handle streaming generation requests
   */
  private async streamGeneration<T>(
    url: string,
    data: T,
    onChunk: (chunk: SSEResponse) => void
  ): Promise<string> {
    // Note: This is a simplified implementation
    // In a real implementation, you would use EventSource or fetch with streaming
    const response = await fetch(`${this.apiClient.defaults.baseURL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.apiClient.defaults.headers.common,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6)) as SSEResponse;
                onChunk(data);
                if (data.delta) {
                  fullContent += data.delta;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }

    return fullContent;
  }
}

// Export singleton instance
export default new AIService();