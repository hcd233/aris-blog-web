"use client";

import { useNotification } from "@/lib/notification-context";

export function useUnreadNotifications() {
  const { unreadCount, refreshUnreadCount } = useNotification();

  return {
    unreadCount,
    loading: false,
    refresh: refreshUnreadCount,
  };
}
