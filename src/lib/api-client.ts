import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/config/api';

// 生成唯一的Trace ID
function generateTraceId(): string {
  return crypto.randomUUID();
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 生成并添加 X-Trace-Id 头部
    const traceId = generateTraceId();
    config.headers['X-Trace-Id'] = traceId;
    
    // 将traceId存储在config中，用于错误处理
    (config as InternalAxiosRequestConfig & { traceId?: string }).traceId = traceId;
    
    // DEBUG LOG: Log the URL being requested
    console.log(`[APIClient] Requesting URL: ${config.baseURL}${config.url} | Trace-ID: ${traceId}`);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    // DEBUG LOG: Log token retrieval attempt
    console.log('[APIClient] Token from localStorage (accessToken):', token);

    if (token) {
      config.headers.Authorization = token;
      // DEBUG LOG: Log Authorization header being set
      console.log('[APIClient] Authorization header set:', config.headers.Authorization);
    } else {
      console.warn('[APIClient] No accessToken found in localStorage. Authorization header not set.');
    }
    return config;
  },
  (error) => {
    console.error('[APIClient] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // 后端API返回的数据结构在 response.data 中
    // 成功的业务数据在 response.data.data
    // 错误信息在 response.data.error
    const responseData = response.data as { data?: unknown; error?: string };
    const traceId = (response.config as InternalAxiosRequestConfig & { traceId?: string }).traceId || (response.config.headers as Record<string, string> | undefined)?.['X-Trace-Id'] || 'unknown';
    
    if (responseData && responseData.error) {
      // 如果后端返回了 error 字段，视为业务错误
      console.error(`API Business Error (Trace-ID: ${traceId}):`, responseData.error);
      throw new Error(`${responseData.error} (Trace-ID: ${traceId})`);
    }

    if (responseData && typeof responseData.data !== 'undefined') {
        // 将实际数据覆盖到 response.data 以满足 AxiosResponse 类型
        (response as AxiosResponse).data = responseData.data as unknown;
        return response as AxiosResponse;
    }
    
    // 没有 data 包裹时，将原始 responseData 作为 data 返回
    (response as AxiosResponse).data = responseData as unknown;
    return response as AxiosResponse; 
  },
  (error) => {
    // 从请求配置中获取 Trace-ID
    const traceId = (error.config as (InternalAxiosRequestConfig & { traceId?: string }) | undefined)?.traceId || (error.response?.config as (InternalAxiosRequestConfig & { traceId?: string }) | undefined)?.traceId || 'unknown';
    
    // 对 Axios 错误进行处理
    if (error.response) {
      // 请求已发出，但服务器响应的状态码不在 2xx 范围内
      console.error(
        `API HTTP Error (Trace-ID: ${traceId}):`,
        error.response.status,
        error.response.data
      );
      // 尝试从 error.response.data.error 获取错误信息
      const apiError = error.response.data?.error;
      if (apiError) {
        return Promise.reject(new Error(`${apiError} (Trace-ID: ${traceId})`));
      }
      // 如果没有特定的业务错误信息，则根据状态码生成通用错误
      return Promise.reject(new Error(`Request failed with status code ${error.response.status} (Trace-ID: ${traceId})`));
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error(`API No Response Error (Trace-ID: ${traceId}):`, error.request);
      return Promise.reject(new Error(`No response received from server. (Trace-ID: ${traceId})`));
    } else {
      // 在设置请求时触发了一个错误
      console.error(`API Request Setup Error (Trace-ID: ${traceId}):`, error.message);
      return Promise.reject(new Error(`${error.message} (Trace-ID: ${traceId})`));
    }
  }
);

export default apiClient; 