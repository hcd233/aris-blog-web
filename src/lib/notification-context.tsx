"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { countNotifications, listNotifications } from "@/lib/api-config";

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      // 使用 countNotifications 获取未读通知数
      const { data: countData, error: countError } = await countNotifications({
        query: {
          status: "unread",
        },
      });

      if (!countError && countData) {
        setUnreadCount(countData.count);
      } else {
        // 如果失败，回退到使用 listNotifications 获取未读数
        const { data, error } = await listNotifications({
          query: {
            page: 1,
            pageSize: 1,
            status: "unread",
          },
        });

        if (error) {
          console.error("获取未读通知数失败:", error);
          return;
        }

        if (data?.pageInfo) {
          setUnreadCount(data.pageInfo.total);
        }
      }
    } catch (error) {
      console.error("获取未读通知数失败:", error);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // 定期刷新（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
