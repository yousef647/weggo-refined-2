"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = {
  _id: string;
  body: string;
  sender: string | { _id?: string; name?: string };
  createdAt: string;
};

export default function MessageThreadPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    const res = await fetch(`/api/conversations/${id}/messages`);
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error ?? "Could not load thread");
      return;
    }
    setMessages(data.messages ?? []);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    void load();
    
    // Mark all messages as read when conversation is opened
    async function markAsRead() {
      try {
        await fetch(`/api/conversations/${id}/messages`, {
          method: "PATCH",
        });
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    }
    void markAsRead();
    
    const t = setInterval(() => {
      void load();
    }, 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch(`/api/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error ?? "Could not send");
      return;
    }
    setBody("");
    await load();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="text-sm text-muted-foreground">
        <button type="button" className="hover:underline" onClick={() => router.push("/messages")}>
          ← Inbox
        </button>
      </div>
      <h1 className="text-xl font-semibold">Conversation</h1>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="min-h-[320px] space-y-2 rounded-lg border border-border bg-card p-3">
        {messages.map((m) => (
          <div key={m._id} className="rounded-md bg-muted/40 px-3 py-2 text-sm">
            <p className="text-xs text-muted-foreground">
              {new Date(m.createdAt).toLocaleString()} ·{" "}
              {typeof m.sender === "object"
                ? m.sender?.name ?? m.sender?._id?.toString() ?? "User"
                : m.sender}
            </p>
            <p className="whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2">
        <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message" required />
        <Button type="submit">Send</Button>
      </form>
      <p className="text-xs text-muted-foreground">
        Tip: open the{" "}
        <Link href="/browse" className="underline">
          listing
        </Link>{" "}
        from browse if you need more context.
      </p>
    </div>
  );
}
