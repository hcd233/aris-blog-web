"use client";

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { getCurrentUser, setAuthToken } from "@/lib/api-config";
import type { DetailedUser } from "@/lib/api/types.gen";

interface AuthContextType {
  user: DetailedUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DetailedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  const permissionToastShown = useRef(false);

  // 初始化时检查登录状态
  useEffect(() => {
    if (initialized.current) return;
    
    const initAuth = async () => {
      initialized.current = true;
      const token = localStorage.getItem("accessToken");
      if (token) {
        // 设置 token 到 API 客户端
        setAuthToken(token);
        try {
          const { data } = await getCurrentUser();
          if (data?.user) {
            setUser(data.user);
            if (data.user.permission === "pending" && !permissionToastShown.current) {
              permissionToastShown.current = true;
              toast.warning("账号权限待审核", {
                description: "您的账号权限处于待审核状态，请联系管理员开通权限",
              });
            }
          }
        } catch (error) {
          console.error("获取用户信息失败:", error);
          // Token 可能已过期，清除它
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setAuthToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    // 设置 token 到 API 客户端
    setAuthToken(accessToken);
    refreshUser();
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // 清除 API 客户端的 token
    setAuthToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await getCurrentUser();
      if (data?.user) {
        setUser(data.user);
        if (data.user.permission === "pending" && !permissionToastShown.current) {
          permissionToastShown.current = true;
          toast.warning("账号权限待审核", {
            description: "您的账号权限处于待审核状态，请联系管理员开通权限",
          });
        }
      }
    } catch (error) {
      console.error("刷新用户信息失败:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
