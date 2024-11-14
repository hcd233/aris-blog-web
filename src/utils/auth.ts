import { store } from '@/store'
import { logout } from '@/store/slices/userSlice'

const USER_INFO_KEY = 'userInfo'

export const clearAuth = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem(USER_INFO_KEY)
}

export const getStoredTokens = () => {
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }
}

export const setStoredTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

export const setStoredUserInfo = (userInfo: any) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

export const getStoredUserInfo = () => {
  const userInfo = localStorage.getItem(USER_INFO_KEY)
  return userInfo ? JSON.parse(userInfo) : null
} 