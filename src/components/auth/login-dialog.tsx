"use client"

import { Button } from "@/components/ui/button"
import { Github, Chrome, MessageCircle } from "lucide-react"
import { ApiService } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { usePopover } from "@/hooks/use-popover"

interface LoginOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  disabled?: boolean
}

const loginOptions: LoginOption[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: '使用 GitHub 账号登录',
    icon: <Github className="h-5 w-5" />
  },
  {
    id: 'google',
    name: 'Google',
    description: '使用 Google 账号登录（即将推出）',
    icon: <Chrome className="h-5 w-5" />,
    disabled: true
  },
  {
    id: 'qq',
    name: 'QQ',
    description: '使用 QQ 账号登录（即将推出）',
    icon: <MessageCircle className="h-5 w-5" />,
    disabled: true
  }
]

export function LoginPopover() {
  const { open, closePopover } = usePopover()
  
  const handleLogin = async (provider: string) => {
    try {
      const { redirectURL } = await ApiService.login()
      window.location.href = redirectURL
    } catch (error) {
      console.error(`登录失败: ${provider}`, error)
    }
  }

  return (
    <Popover open={open === 'login'} onOpenChange={(isOpen) => !isOpen && closePopover()}>
      <PopoverTrigger asChild>
        <Button variant="outline">登录</Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <Card className="glass-effect border-none">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold">欢迎回来</CardTitle>
            <CardDescription>
              选择你喜欢的方式登录
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {loginOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className={`
                  w-full h-auto p-4 justify-start gap-4 
                  hover:bg-muted/50 group relative overflow-hidden
                  ${option.disabled ? 'opacity-60' : ''}
                `}
                onClick={() => !option.disabled && handleLogin(option.id)}
                disabled={option.disabled}
              >
                <div className="relative z-10 flex items-center gap-4 w-full">
                  <div className="group-hover:text-primary transition-colors">
                    {option.icon}
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.025] to-transparent group-hover:via-foreground/[0.075] -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Button>
            ))}
          </CardContent>
          <Separator className="my-4 bg-border/40" />
          <CardFooter className="flex flex-col space-y-4 pt-0 pb-4">
            <p className="text-xs text-center text-muted-foreground px-6">
              登录即表示同意我们的
              <Button variant="link" className="px-1 h-auto text-xs">
                服务条款
              </Button>
              和
              <Button variant="link" className="px-1 h-auto text-xs">
                隐私政策
              </Button>
            </p>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  )
} 