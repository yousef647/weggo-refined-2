"use client";

import { useEffect, useState } from "react";

type UserRow = {
  _id: string;
  email: string;
  name: string;
  role: string;
  banned: boolean;
};

type ListingRow = {
  _id: string;
  title: string;
  status: string;
  seller?: { email?: string; name?: string };
};

type AuditRow = {
  _id: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  admin?: { name?: string; email?: string };
  meta?: Record<string, unknown>;
};

export default function AdminPage() {
  const [tab, setTab] = useState<"users" | "listings" | "audit">("users");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed");
    setUsers(data.items ?? []);
  }

  async function loadListings() {
    const res = await fetch("/api/admin/listings?status=all");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed");
    setListings(data.items ?? []);
  }

  async function loadAudit() {
    const res = await fetch("/api/admin/audit");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed");
    setAudit(data.items ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErr(null);
      try {
        if (tab === "users") await loadUsers();
        if (tab === "listings") await loadListings();
        if (tab === "audit") await loadAudit();
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  async function patchUser(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json();
      setErr(data.error ?? "Update failed");
      return;
    }
    await loadUsers();
  }

  async function patchListing(id: string, status: string) {
    const res = await fetch(`/api/admin/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json();
      setErr(data.error ?? "Update failed");
      return;
    }
    await loadListings();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground">Moderate users and listings. Actions are written to the audit log.</p>
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="flex flex-wrap gap-2">
        {(["users", "listings", "audit"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              tab === t ? "border-foreground bg-muted" : "border-border bg-card"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Banned</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="h-9 rounded-md border border-border bg-transparent px-2 text-xs"
                      value={u.role}
                      onChange={(e) => patchUser(u._id, { role: e.target.value })}
                    >
                      <option value="buyer">buyer</option>
                      <option value="seller">seller</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">{u.banned ? "yes" : "no"}</td>
                  <td className="space-x-2 px-3 py-2">
                    <button
                      type="button"
                      className="text-xs underline"
                      onClick={() => patchUser(u._id, { banned: !u.banned, bannedReason: u.banned ? null : "moderation" })}
                    >
                      {u.banned ? "Unban" : "Ban"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "listings" && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Listing</th>
                <th className="px-3 py-2">Seller</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l._id} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{l.title}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{l.seller?.email}</td>
                  <td className="px-3 py-2 text-xs">{l.status}</td>
                  <td className="space-x-2 px-3 py-2 text-xs">
                    {l.status !== "active" && (
                      <button type="button" className="underline" onClick={() => patchListing(l._id, "active")}>
                        Restore
                      </button>
                    )}
                    {l.status !== "hidden" && (
                      <button type="button" className="underline" onClick={() => patchListing(l._id, "hidden")}>
                        Hide
                      </button>
                    )}
                    {l.status !== "removed" && (
                      <button type="button" className="underline" onClick={() => patchListing(l._id, "removed")}>
                        Remove
                      </button>
                    )}
                    {l.status !== "sold" && (
                      <button type="button" className="underline" onClick={() => patchListing(l._id, "sold")}>
                        Mark sold
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "audit" && (
        <ul className="space-y-2 rounded-lg border border-border bg-card p-3 text-sm">
          {audit.map((a) => (
            <li key={a._id} className="border-b border-border pb-2 last:border-0">
              <p className="font-medium">
                {a.action} · {a.targetType} {a.targetId}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(a.createdAt).toLocaleString()} · admin {a.admin?.email}
              </p>
              {a.meta && (
                <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted/40 p-2 text-[11px]">
                  {JSON.stringify(a.meta, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
