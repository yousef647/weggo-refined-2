"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function BannedPage() {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-lg border border-destructive/40 bg-card p-6">
      <h1 className="text-xl font-semibold">Account suspended</h1>
      <p className="text-sm text-muted-foreground">
        This account can no longer buy, sell, or message on weggo. If you think this is a mistake, contact support.
      </p>
      <Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
        Sign out
      </Button>
    </div>
  );
}
