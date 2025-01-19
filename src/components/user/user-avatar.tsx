"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ApiService } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

interface UserInfo {
  name: string
  avatar: string
}

interface UserAvatarProps {
  userID: number
  showName?: boolean
  className?: string
  initialData?: UserInfo
}

export function UserAvatar({ userID, showName = true, className = "", initialData }: UserAvatarProps) {
  const [user, setUser] = useState<UserInfo | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)

  useEffect(() => {
    if (initialData) return

    const fetchUser = async () => {
      try {
        const data = await ApiService.getUserInfo(userID)
        setUser({
          name: data.name,
          avatar: data.avatar
        })
      } catch (error) {
        console.error('获取用户信息失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userID, initialData])

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className="h-6 w-6 rounded-full" />
        {showName && <Skeleton className="h-4 w-20" />}
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className="h-6 w-6">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      {showName && (
        <span className="text-sm font-medium">{user.name}</span>
      )}
    </div>
  )
} 