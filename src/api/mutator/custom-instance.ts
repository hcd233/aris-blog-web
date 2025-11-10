import Axios, { AxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearAuth } from '@/lib/auth';
import { env } from '@/config/env';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: env.apiBaseUrl,
});

// 请求拦截器：添加 Authorization header
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理 401 错误和 token 刷新
AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果是 401 错误且还没有重试过
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          // 尝试刷新 token
          const response = await Axios.post(`${env.apiBaseUrl}/v1/token/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = response.data;
          
          // 保存新的 token
          saveTokens({
            access_token,
            refresh_token: newRefreshToken || refreshToken,
          });

          // 重试原请求
          originalRequest.headers.Authorization = `${access_token}`;
          return AXIOS_INSTANCE(originalRequest);
        }
      } catch (refreshError) {
        // 刷新失败，清除认证信息
        clearAuth();
        
        // 重定向到登录页
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - Adding cancel method to promise
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default customInstance;
