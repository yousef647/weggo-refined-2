"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function UnreadMessagesBadge() {
  const { status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/me/unread-messages");
        const data = await res.json();
        if (!cancelled && res.ok) {
          setUnreadCount(data.unreadCount ?? 0);
        }
      } catch (err) {
        console.error("Failed to fetch unread messages count:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUnreadCount();

    // Refresh unread count every 5 seconds
    const interval = setInterval(fetchUnreadCount, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [status]);

  if (!loading && unreadCount > 0) {
    return (
      <span className="inline-flex items-center justify-center rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    );
  }

  return null;
}
