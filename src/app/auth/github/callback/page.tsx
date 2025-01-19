"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ApiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

export default function GithubCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const formatLastLogin = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
    } catch {
      return '未知时间'
    }
  }

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code")
        const state = searchParams.get("state")

        if (!code || !state) {
          throw new Error("无效的回调参数")
        }

        const { accessToken, refreshToken } = await ApiService.handleCallback(code, state, 'github')
        
        if (!accessToken || !refreshToken) {
          throw new Error("获取令牌失败")
        }

        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)

        try {
          const user = await ApiService.getCurrentUser(accessToken)
          
          // 存储用户信息
          localStorage.setItem("user", JSON.stringify(user))
          
          // 触发自定义事件通知 Header 组件
          window.dispatchEvent(new CustomEvent('userLogin', { detail: user }))

          toast({
            title: "登录成功",
            description: (
              <div className="flex flex-col gap-1">
                <p>欢迎回来，{user.name}！</p>
                <p className="text-xs text-muted-foreground">
                  上次登录时间：{formatLastLogin(user.lastLogin)}
                </p>
              </div>
            )
          })

          router.push("/")
        } catch (error) {
          console.error("获取用户信息失败:", error)
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          throw new Error(error instanceof Error ? error.message : "获取用户信息失败")
        }
      } catch (error) {
        console.error("登录失败:", error)
        toast({
          variant: "destructive",
          title: "登录失败",
          description: error instanceof Error ? error.message : "请稍后重试",
        })
        router.push("/")
      }
    }

    handleCallback()
  }, [router, searchParams, toast])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">登录中...</h2>
        <p className="text-muted-foreground">请稍候，正在处理您的登录请求</p>
      </div>
    </div>
  )
} 