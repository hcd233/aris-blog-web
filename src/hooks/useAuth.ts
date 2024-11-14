import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { useAppDispatch, useAppSelector } from './store'
import { setTokens, setUserInfo, logout as logoutAction } from '@/store/slices/userSlice'
import AuthService from '@/services/auth'
import { ROUTE_PATHS } from '@/constants'
import { setStoredTokens, clearAuth, getStoredTokens } from '@/utils/auth'

export const useAuth = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const userInfo = useAppSelector((state) => state.user.userInfo)

  useEffect(() => {
    const initializeAuth = async () => {
      if (userInfo) return
      
      const { accessToken, refreshToken } = getStoredTokens()
      if (!accessToken || !refreshToken) return
      
      dispatch(setTokens({ accessToken, refreshToken }))
      
      try {
        const response = await AuthService.getCurrentUser()
        if (response.data?.user) {
          const { user } = response.data
          dispatch(setUserInfo({
            id: user.id,
            userName: user.name,
            avatar: user.avatar,
            email: user.email,
            permission: user.permission,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          }))
          navigate(ROUTE_PATHS.HOME, { replace: true })
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        clearAuth()
        dispatch(logoutAction())
        message.error('登录已过期，请重新登录')
        navigate(ROUTE_PATHS.AUTH, { replace: true })
      }
    }

    initializeAuth()
  }, [dispatch, navigate, userInfo])

  const handleOAuthLogin = useCallback(async (provider: 'GITHUB') => {
    try {
      const res = await AuthService.getOAuthLoginUrl(provider)
      if (res.data.redirect_url) {
        window.location.href = res.data.redirect_url
      }
    } catch (error) {
      message.error(`获取Github登录链接失败`)
    }
  }, [])

  const handleOAuthCallback = useCallback(async (provider: string, params: Record<string, string>) => {
    try {
      const response = await AuthService.handleOAuthCallback(provider, params)
      
      if (!response.data) {
        throw new Error('No data received from OAuth callback')
      }

      const { accessToken, refreshToken } = response.data
      
      if (!accessToken || !refreshToken) {
        throw new Error('Missing required data from OAuth callback')
      }

      setStoredTokens(accessToken, refreshToken)
      dispatch(setTokens({ accessToken, refreshToken }))
      
      try {
        const userResponse = await AuthService.getCurrentUser()
        if (userResponse.data?.user) {
          const { user } = userResponse.data
          dispatch(setUserInfo({
            id: user.id,
            userName: user.name,
            avatar: user.avatar,
            email: user.email,
            permission: user.permission,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          }))
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        throw new Error('Failed to fetch user info')
      }
      
      message.success('登录成功')
      navigate(ROUTE_PATHS.HOME, { replace: true })
    } catch (error) {
      console.error('OAuth callback error:', error)
      if (error instanceof Error) {
        message.error(`Github登录失败: ${error.message}`)
      } else {
        message.error(`Github登录失败`)
      }
      navigate(ROUTE_PATHS.AUTH, { replace: true })
    }
  }, [dispatch, navigate])

  const logout = useCallback(() => {
    clearAuth()
    dispatch(logoutAction())
    message.success('已退出登录')
    navigate('/', { replace: true })
  }, [dispatch, navigate])

  return {
    handleOAuthLogin,
    handleOAuthCallback,
    logout,
  }
} 