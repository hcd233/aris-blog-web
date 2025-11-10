/**
 * OAuth2 认证工具函数
 */

import { env } from '@/config/env';

const TOKEN_KEY = 'aris_blog_token';
const REFRESH_TOKEN_KEY = 'aris_blog_refresh_token';
const USER_KEY = 'aris_blog_user';

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface StoredUser {
  id: number;
  name: string;
  email?: string;
  avatar_url?: string;
  userID?: number;
  avatar?: string;
}

/**
 * 保存认证 Token
 */
export function saveTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(TOKEN_KEY, tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }
}

/**
 * 获取访问 Token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 获取刷新 Token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * 清除所有认证信息
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * 保存用户信息
 */
export function saveUser(user: StoredUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * 获取用户信息
 */
export function getUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * 获取 OAuth2 登录 URL
 */
export function getOAuth2LoginUrl(provider: string = 'github'): string {
  const redirectUri = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback`
    : '';
  
  return `${env.apiBaseUrl}/v1/oauth2/${provider}/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

