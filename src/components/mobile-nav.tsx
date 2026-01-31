"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, Bell, User, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "主页", href: "/" },
  { icon: ShoppingBag, label: "商城", href: "/shop", disabled: true },
  { icon: null, label: "发布", href: "/publish", isCenter: true },
  { icon: Bell, label: "通知", href: "/notifications", disabled: true },
  { icon: User, label: "我", href: "/profile" },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

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

          return (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full",
                "active:scale-95 transition-transform",
                active
                  ? "text-red-500"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
