'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUserInfo, type User } from '@/api';
import { isAuthenticated, clearAuth, getUser, saveUser } from '@/lib/auth';
import { CalendarDays, Mail, LogOut } from 'lucide-react';

export function UserHeader() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        // 先尝试从本地存储获取
        const cachedUser = getUser();
        if (cachedUser && cachedUser.userID) {
          setUser({
            userID: cachedUser.userID || cachedUser.id,
            name: cachedUser.name,
            email: cachedUser.email,
            avatar: cachedUser.avatar || cachedUser.avatar_url || '',
          });
        }

        // 然后从服务器获取最新数据
        const response = await getCurrentUserInfo();
        setUser(response.user);
        saveUser({
          id: response.user.userID,
          name: response.user.name,
          email: response.user.email,
          avatar_url: response.user.avatar,
        });
      } catch (error) {
        console.error('获取用户信息失败:', error);
        clearAuth();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm dark:bg-black/80">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">Aris Blog</h1>
          <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </header>
    );
  }

  if (!user) return null;

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm dark:bg-black/80 transition-all">
      <div className="container flex h-16 items-center justify-between px-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
          Aris Blog
        </h1>

        <HoverCard>
          <HoverCardTrigger asChild>
            <button className="flex items-center gap-3 rounded-full px-3 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900">
              <Avatar className="h-10 w-10 border-2 border-zinc-200 dark:border-zinc-800">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
              </Avatar>
              <span className="font-medium hidden sm:inline">{user.name}</span>
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-zinc-200 dark:border-zinc-800">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <h4 className="text-lg font-semibold">{user.name}</h4>
                </div>
              </div>

              <div className="space-y-2">
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <CalendarDays className="h-4 w-4" />
                    <span>
                      加入于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                )}
              </div>

              {user.permission && (
                <div>
                  <Badge variant="secondary">{user.permission}</Badge>
                </div>
              )}

              <div className="border-t pt-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </Button>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </header>
  );
}

