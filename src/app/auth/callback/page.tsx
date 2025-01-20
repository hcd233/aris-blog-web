"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ApiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code")
        const state = searchParams.get("state")

        if (!code || !state) {
          throw new Error("无效的回调参数")
        }

        const { accessToken, refreshToken } = await ApiService.handleCallback(code, state)
        
        // 存储令牌
        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)

        // 获取用户信息
        const user = await ApiService.getCurrentUser(accessToken)
        
        // 存储用户信息
        localStorage.setItem("user", JSON.stringify(user))

        // 触发自定义事件来更新用户状态
        window.dispatchEvent(new CustomEvent('userLogin', { detail: user }))

        toast({
          title: "登录成功",
          description: `欢迎回来，${user.name}！`,
        })

        // 重定向到首页
        router.push("/")
      } catch (error) {
        console.error("登录失败:", error)
        toast({
          variant: "destructive",
          title: "登录失败",
          description: "请稍后重试",
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
        <p className="text-muted-foreground">稍等一下，马上就好～</p>
      </div>
    </div>
  )
} 