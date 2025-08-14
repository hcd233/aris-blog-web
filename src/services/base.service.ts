import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import apiClient from '@/lib/api-client';
import { BaseResponse, ErrorResponse } from '@/types/dto';

/**
 * Base service class with generic request/response handling
 */
export abstract class BaseService {
  protected apiClient: AxiosInstance;

  constructor(apiClient?: AxiosInstance) {
    this.apiClient = apiClient || this.getDefaultApiClient();
  }

  protected getDefaultApiClient(): AxiosInstance {
    return apiClient;
  }

  /**
   * Generic GET request
   */
  protected async get<TResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    try {
      const response = await this.apiClient.get<TResponse>(url, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic POST request
   */
  protected async post<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    try {
      const response = await this.apiClient.post<TResponse>(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic PUT request
   */
  protected async put<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    try {
      const response = await this.apiClient.put<TResponse>(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic PATCH request
   */
  protected async patch<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    try {
      const response = await this.apiClient.patch<TResponse>(url, data, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic DELETE request
   */
  protected async delete<TResponse>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    try {
      const response = await this.apiClient.delete<TResponse>(url, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle successful response
   */
  private handleResponse<T>(response: AxiosResponse<T>): T {
    // Check if response has BaseResponse structure
    const data = response.data as unknown;
    if (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      !('error' in data)
    ) {
      // Return the data field if it exists and no error
      return (data as BaseResponse<T>).data as T;
    }
    // Otherwise return the entire response data
    return response.data;
  }

  /**
   * Handle error response
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with an error
      const errorData = error.response.data as ErrorResponse;
      const message = errorData.message || errorData.error || 'An error occurred';
      const customError = new Error(message);
      (customError as any).statusCode = error.response.status;
      (customError as any).response = error.response;
      return customError;
    } else if (error.request) {
      // Request was made but no response
      return new Error('No response from server');
    } else {
      // Something else happened
      return new Error(error.message || 'An unknown error occurred');
    }
  }

  /**
   * Build query string from parameters
   */
  protected buildQueryString(params: Record<string, any>): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
  }
}

/**
 * Service factory function
 */
export function createService<T extends BaseService>(
  ServiceClass: new (apiClient?: AxiosInstance) => T,
  apiClient?: AxiosInstance
): T {
  return new ServiceClass(apiClient);
}