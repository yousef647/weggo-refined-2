"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BecomeSellerPage() {
  const router = useRouter();
  const { update } = useSession();
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function become() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/user/become-seller", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Could not update account");
        return;
      }
      // Trigger session update in NextAuth
      await update();
      // Navigate to the create listing page after a longer delay
      // This gives time for the session to be fully updated in all cookies
      setTimeout(() => router.push("/sell/new"), 300);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-lg border-border/80 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Become a seller</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          Anyone can browse and buy on weggo. To create listings, switch your account to the seller role. You can still
          buy items as a seller.
        </p>
        {err && <p className="rounded-md bg-destructive/10 px-3 py-2 text-destructive">{err}</p>}
        <Button type="button" onClick={become} disabled={busy} className="w-full sm:w-auto">
          {busy ? "Updating…" : "Enable selling on my account"}
        </Button>
      </CardContent>
    </Card>
  );
}
