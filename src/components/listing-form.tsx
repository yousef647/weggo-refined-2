"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryTree } from "@/lib/category-tree";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CONDITION_LABELS } from "@/lib/format";

const CONDITIONS = ["new", "like_new", "good", "fair", "for_parts"] as const;

type Initial = {
  title: string;
  description: string;
  condition: string;
  categorySlug: string;
  subcategorySlug: string;
  location: string;
  price: number;
  images: string[];
  status?: string;
};

export function ListingForm({
  mode,
  listingId,
  initial,
}: {
  mode: "create" | "edit";
  listingId?: string;
  initial?: Initial;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryTree>([]);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [condition, setCondition] = useState(initial?.condition ?? "good");
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? "");
  const [subcategorySlug, setSubcategorySlug] = useState(initial?.subcategorySlug ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    })();
  }, []);

  const subs = useMemo(() => {
    const p = categories.find((c) => c.slug === categorySlug);
    return p?.subcategories ?? [];
  }, [categories, categorySlug]);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setErr(null);
    setBusy(true);
    try {
      const next = [...images];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Upload failed");
        next.push(data.url as string);
      }
      setImages(next);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const payload = {
        title,
        description,
        condition,
        categorySlug,
        subcategorySlug,
        location,
        price: Number(price),
        images,
        ...(mode === "edit" ? { status } : {}),
      };
      const url = mode === "create" ? "/api/listings" : `/api/listings/${listingId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      if (mode === "create") router.push(`/listings/${data.id}`);
      else router.push(`/listings/${listingId}`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-4">
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Condition</Label>
          <select
            className="h-10 w-full rounded-md border border-border bg-transparent px-2 text-sm"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {CONDITION_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input id="price" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <select
            className="h-10 w-full rounded-md border border-border bg-transparent px-2 text-sm"
            value={categorySlug}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              setSubcategorySlug("");
            }}
            required
          >
            <option value="" disabled>
              Select…
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Subcategory</Label>
          <select
            className="h-10 w-full rounded-md border border-border bg-transparent px-2 text-sm"
            value={subcategorySlug}
            onChange={(e) => setSubcategorySlug(e.target.value)}
            required
            disabled={!categorySlug}
          >
            <option value="" disabled>
              Select…
            </option>
            {subs.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
      </div>
      {mode === "edit" && (
        <div className="space-y-2">
          <Label>Listing status</Label>
          <select
            className="h-10 w-full rounded-md border border-border bg-transparent px-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="sold">Sold</option>
          </select>
          <p className="text-xs text-muted-foreground">Admins can also set hidden or removed via the admin panel.</p>
        </div>
      )}
      <div className="space-y-2">
        <Label>Images</Label>
        <Input type="file" accept="image/*" multiple onChange={(e) => uploadFiles(e.target.files)} disabled={busy} />
        <div className="grid grid-cols-3 gap-2">
          {images.map((src) => (
            <div key={src} className="space-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-24 w-full rounded-md object-cover" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setImages((prev) => prev.filter((x) => x !== src))}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={busy}>
        {mode === "create" ? "Publish listing" : "Save changes"}
      </Button>
    </form>
  );
}
