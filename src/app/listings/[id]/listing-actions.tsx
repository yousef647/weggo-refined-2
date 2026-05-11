"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

type Props = {
  listingId: string;
  inWishlistInitially: boolean;
  isOwner: boolean;
  isAdmin: boolean;
};

export function ListingActions({
  listingId,
  inWishlistInitially,
  isOwner,
  isAdmin,
}: Props) {
  const { status } = useSession();
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(inWishlistInitially);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const authed = status === "authenticated";

  async function toggleWishlist() {
    setErr(null);
    setBusy(true);
    try {
      if (!inWishlist) {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId }),
        });
        if (!res.ok) throw new Error("Could not add to wishlist");
        setInWishlist(true);
      } else {
        const res = await fetch(`/api/wishlist/${listingId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Could not remove from wishlist");
        setInWishlist(false);
      }
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function startConversation() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start conversation");
      router.push(`/messages/${data.conversationId}`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="flex flex-wrap gap-2">
        {authed && !isOwner && (
          <Button type="button" disabled={busy} onClick={startConversation}>
            Message seller
          </Button>
        )}
        {authed && (
          <Button type="button" variant="outline" disabled={busy} onClick={toggleWishlist}>
            {inWishlist ? "Remove from wishlist" : "Save to wishlist"}
          </Button>
        )}
        {(isOwner || isAdmin) && (
          <Button variant="outline" asChild>
            <Link href={`/sell/${listingId}/edit`}>Edit listing</Link>
          </Button>
        )}
      </div>
      {!authed && (
        <p className="text-xs text-muted-foreground">
          <Link href="/login" className="underline">
            Log in
          </Link>{" "}
          to message the seller or save this listing.
        </p>
      )}
    </div>
  );
}
