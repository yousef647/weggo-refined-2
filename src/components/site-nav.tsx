"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { UnreadMessagesBadge } from "@/components/unread-messages-badge";
import { Store } from "lucide-react";

export function SiteNav() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition group-hover:opacity-90">
            <Store className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">weggo</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Link
            href="/browse"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Browse
          </Link>
          {status === "authenticated" && user && (
            <>
              <Link
                href="/wishlist"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Wishlist
              </Link>
              <Link
                href="/messages"
                className="relative rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Messages
                <span className="absolute -right-1 -top-1">
                  <UnreadMessagesBadge />
                </span>
              </Link>
              {(user.role === "seller" || user.role === "admin") && (
                <Link
                  href="/sell/new"
                  className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  Sell
                </Link>
              )}
              {user.role === "buyer" && (
                <Link
                  href="/account/become-seller"
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
                >
                  Become a seller
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {status === "authenticated" && user ? (
            <ProfileDropdown userName={user.name || "User"} email={user.email || ""} />
          ) : status === "loading" ? (
            <span className="text-xs text-muted-foreground">…</span>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
