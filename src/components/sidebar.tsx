"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Compass,
  PlusSquare,
  Bell,
  User,
  LogOut,
  Menu,
  PenLine,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: Compass, label: "发现", href: "/" },
  { icon: PlusSquare, label: "发布", href: "/publish" },
  { icon: Bell, label: "通知", href: "/notifications" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const themeLabel = {
    light: "浅色模式",
    dark: "深色模式",
    system: "跟随系统",
  }[theme];

  // 判断是否是当前路径
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full w-[72px] lg:w-[220px] flex flex-col z-50 transition-all duration-300",
        "bg-white dark:bg-[#0a0a0a]",
        "border-r border-gray-200 dark:border-[#1a1a1a]"
      )}
    >
      {/* Logo */}
      <div className="p-4 lg:p-6">
        <Link href="/" className="flex items-center justify-center lg:justify-start gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <PenLine className="w-5 h-5 text-white" />
          </div>
          <span className="hidden lg:block text-xl font-bold text-gray-900 dark:text-white">Aris</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 lg:px-4 py-4">
        <div className="space-y-1">
          {/* 常规导航项：发现、发布、通知 */}
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                isActive(item.href)
                  ? "bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-[#999] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </Link>
          ))}

          {/* "我" - 显示用户头像和名字 */}
          {isAuthenticated ? (
            <Link
              href="/profile"
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                isActive("/profile")
                  ? "bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-[#999] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:block font-medium">{user?.name || "我"}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                isActive("/login")
                  ? "bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-[#999] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <User className="w-6 h-6 flex-shrink-0" />
              <span className="hidden lg:block font-medium">我</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Bottom Section: 更多按钮 */}
      <div className="p-4">
        <DropdownMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button 
              className={cn(
                "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors",
                "text-gray-600 dark:text-[#999] hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Menu className="w-6 h-6 flex-shrink-0" />
              <span className="hidden lg:block font-medium">更多</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="right" 
            align="end" 
            className={cn(
              "w-56",
              "bg-white dark:bg-[#1a1a1a]",
              "border-gray-200 dark:border-[#2a2a2a]",
              "text-gray-900 dark:text-white"
            )}
          >
            <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-[#2a2a2a] focus:bg-gray-100 dark:focus:bg-[#2a2a2a] cursor-pointer">
              <Link href="/about">
                <span className="flex-1">关于 Aris</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-[#2a2a2a] focus:bg-gray-100 dark:focus:bg-[#2a2a2a] cursor-pointer">
              <Link href="/privacy">
                <span className="flex-1">隐私、协议</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-[#2a2a2a] focus:bg-gray-100 dark:focus:bg-[#2a2a2a] cursor-pointer">
              <Link href="/help">
                <span className="flex-1">帮助与客服</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#2a2a2a]" />
            
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="hover:bg-gray-100 dark:hover:bg-[#2a2a2a] focus:bg-gray-100 dark:focus:bg-[#2a2a2a] cursor-pointer">
                <div className="flex items-center gap-2 flex-1">
                  {theme === "light" && <Sun className="w-4 h-4" />}
                  {theme === "dark" && <Moon className="w-4 h-4" />}
                  {theme === "system" && <Monitor className="w-4 h-4" />}
                  <span>深色模式</span>
                </div>
                <span className="text-xs text-gray-400">{themeLabel}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent 
                  className={cn(
                    "bg-white dark:bg-[#1a1a1a]",
                    "border-gray-200 dark:border-[#2a2a2a]",
                    "text-gray-900 dark:text-white"
                  )}
                >
                  <DropdownMenuItem 
                    onClick={() => setTheme("light")}
                    className={cn(
                      "cursor-pointer",
                      theme === "light" && "bg-gray-100 dark:bg-[#2a2a2a]"
                    )}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    浅色模式
                    {theme === "light" && <span className="ml-auto text-xs">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "cursor-pointer",
                      theme === "dark" && "bg-gray-100 dark:bg-[#2a2a2a]"
                    )}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    深色模式
                    {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTheme("system")}
                    className={cn(
                      "cursor-pointer",
                      theme === "system" && "bg-gray-100 dark:bg-[#2a2a2a]"
                    )}
                  >
                    <Monitor className="mr-2 h-4 w-4" />
                    跟随系统
                    {theme === "system" && <span className="ml-auto text-xs">✓</span>}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            {isAuthenticated && (
              <>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#2a2a2a]" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="hover:bg-gray-100 dark:hover:bg-[#2a2a2a] focus:bg-gray-100 dark:focus:bg-[#2a2a2a] cursor-pointer text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
