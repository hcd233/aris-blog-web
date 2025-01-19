"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { ApiService } from "@/lib/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { ThemeDialog } from "@/components/theme-dialog"
import { toast } from "@/components/ui/use-toast"
import { GlassCard } from "@/components/ui/glass-card"
import { LoginPopover } from "@/components/auth/login-popover"
import { useAuth } from "@/contexts/auth-context"

interface User {
  name: string
  email: string
  avatar: string
  lastLogin: string
}

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast({
      title: "退出成功",
      description: "期待您的再次访问！",
    })
    router.push("/")
  }

  const formatLastLogin = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
    } catch {
      return '未知时间'
    }
  }

  return (
    <header className="border-b glass-effect bg-background/80">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <nav className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold">
            Aris Blog
          </Link>
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className={`${pathname === "/" ? "text-primary" : "text-muted-foreground"}`}
            >
              首页
            </Link>
            <Link 
              href="/categories"
              className={`${pathname === "/categories" ? "text-primary" : "text-muted-foreground"}`}
            >
              分类
            </Link>
            <Link 
              href="/tags"
              className={`${pathname === "/tags" ? "text-primary" : "text-muted-foreground"}`}
            >
              标签
            </Link>
          </div>
        </nav>
        <div className="flex items-center space-x-4">
          <ThemeDialog />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-effect">
                <GlassCard className="p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </GlassCard>
                <DropdownMenuSeparator className="bg-muted/20" />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-red-600 focus:text-red-600 focus:bg-red-100/10"
                >
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginPopover />
          )}
        </div>
      </div>
    </header>
  )
} 