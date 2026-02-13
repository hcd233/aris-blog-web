"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, Bell, User, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useUnreadNotifications } from "@/hooks/use-unread-notifications";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "主页", href: "/" },
  { icon: ShoppingBag, label: "商城", href: "/shop", disabled: true },
  { icon: null, label: "发布", href: "/publish", isCenter: true },
  { icon: Bell, label: "通知", href: "/notifications" },
  { icon: User, label: "我", href: "/profile" },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useUnreadNotifications();

  const handleClick = (item: typeof navItems[0]) => {
    if (item.disabled) {
      toast.info("敬请期待", {
        description: "该功能正在开发中",
      });
      return;
    }

    if (item.href === "/profile" && !isAuthenticated) {
      toast.error("请先登录", {
        description: "登录后即可查看个人资料",
      });
      return;
    }

    if (item.href === "/publish" && !isAuthenticated) {
      toast.error("请先登录", {
        description: "登录后即可发布内容",
      });
      return;
    }

    if (item.href === "/notifications" && !isAuthenticated) {
      toast.error("请先登录", {
        description: "登录后即可查看通知",
      });
      return;
    }

    router.push(item.href);
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-[#1a1a1a] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <button
                key={item.label}
                onClick={() => handleClick(item)}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full",
                  "bg-red-500 text-white",
                  "active:scale-95 transition-transform"
                )}
              >
                <Plus className="w-6 h-6" />
              </button>
            );
          }

          const Icon = item.icon!;
          const active = isActive(item.href);

          const isNotification = item.label === "通知";

          return (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full relative",
                "active:scale-95 transition-transform",
                active
                  ? "text-red-500"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {/* 移动端未读通知 badge */}
                {isNotification && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
