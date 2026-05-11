"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function BanCheck() {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || pathname === "/banned" || pathname === "/login") return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/me");
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { banned?: boolean };
      if (data.banned) router.replace("/banned");
    })();
    return () => {
      cancelled = true;
    };
  }, [status, pathname, router]);

  return null;
}
