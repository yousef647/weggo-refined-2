"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Conv = {
  _id: string;
  lastMessageAt: string;
  listing?: { title?: string; images?: string[]; status?: string };
  buyer?: { name?: string; email?: string };
  seller?: { name?: string; email?: string };
};

export default function MessagesInboxPage() {
  const [rows, setRows] = useState<Conv[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (!res.ok) {
        if (!cancelled) setErr(data.error ?? "Could not load inbox");
        return;
      }
      if (!cancelled) setRows(data.conversations ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) return <p className="text-sm text-destructive">{err}</p>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Conversations about specific listings.</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No conversations yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {rows.map((c) => (
            <li key={c._id}>
              <Link href={`/messages/${c._id}`} className="block px-4 py-3 hover:bg-muted/60">
                <p className="font-medium">{c.listing?.title ?? "Listing"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.lastMessageAt).toLocaleString()} · Listing status: {c.listing?.status ?? "unknown"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
