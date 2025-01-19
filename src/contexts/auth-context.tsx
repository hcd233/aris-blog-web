"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface User {
  name: string
  email: string
  avatar: string
  lastLogin: string
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // 初始化时从localStorage获取用户信息
    const userStr = localStorage.getItem("user")
    if (userStr) {
      setUser(JSON.parse(userStr))
    }

    // 监听登录事件
    const handleLogin = (event: StorageEvent) => {
      if (event.key === 'user' && event.newValue) {
        setUser(JSON.parse(event.newValue))
      }
    }
    
    window.addEventListener('storage', handleLogin)
    
    // 监听自定义登录事件
    const handleCustomLogin = (e: CustomEvent<User>) => {
      setUser(e.detail)
    }
    
    window.addEventListener('userLogin', handleCustomLogin as EventListener)

    return () => {
      window.removeEventListener('storage', handleLogin)
      window.removeEventListener('userLogin', handleCustomLogin as EventListener)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
  }

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated: !!user,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 