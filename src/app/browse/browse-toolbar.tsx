"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import type { CategoryTree } from "@/lib/category-tree";
import { CONDITION_LABELS } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CONDITIONS = ["new", "like_new", "good", "fair", "for_parts"] as const;

type Props = { categories: CategoryTree };

export default function BrowseToolbar({ categories }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  const current = useMemo(
    () => ({
      q: sp.get("q") ?? "",
      categorySlug: sp.get("categorySlug") ?? "",
      subcategorySlug: sp.get("subcategorySlug") ?? "",
      condition: sp.get("condition") ?? "",
      priceMin: sp.get("priceMin") ?? "",
      priceMax: sp.get("priceMax") ?? "",
      sort: sp.get("sort") ?? "newest",
      page: sp.get("page") ?? "1",
    }),
    [sp]
  );

  const subs = useMemo(() => {
    const p = categories.find((c) => c.slug === current.categorySlug);
    return p?.subcategories ?? [];
  }, [categories, current.categorySlug]);

  function push(next: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v) params.delete(k);
      else params.set(k, v);
    }
    if (!("page" in next)) params.set("page", "1");
    start(() => router.push(`/browse?${params.toString()}`));
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Search</label>
          <Input
            placeholder="Search title and description"
            defaultValue={current.q}
            name="q"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                push({ q: (e.target as HTMLInputElement).value });
              }
            }}
          />
        </div>
        <Button type="button" disabled={pending} onClick={() => {
          const el = document.querySelector<HTMLInputElement>('input[name="q"]');
          push({ q: el?.value ?? "" });
        }}>
          Search
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <select
            className="h-10 w-full rounded-md border border-border bg-transparent px-2 text-sm"
            value={current.categorySlug}
            onChange={(e) => {
              push({ categorySlug: e.target.value, subcategorySlug: "" });
            }}
          >
            <option value="">Any</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Subcategory</label>
          <select
            className="h-10 w-full rounded-md border border-border bg-transparent px-2 text-sm"
            value={current.subcategorySlug}
            disabled={!current.categorySlug}
            onChange={(e) => push({ subcategorySlug: e.target.value })}
          >
            <option value="">Any</option>
            {subs.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Condition</label>
          <select
            className="h-10 w-full rounded-md border border-border bg-transparent px-2 text-sm"
            value={current.condition}
            onChange={(e) => push({ condition: e.target.value })}
          >
            <option value="">Any</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {CONDITION_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Sort</label>
          <select
            className="h-10 w-full rounded-md border border-border bg-transparent px-2 text-sm"
            value={current.sort}
            onChange={(e) => push({ sort: e.target.value })}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="relevance">Relevance (with search)</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Min price</label>
          <Input
            type="number"
            min={0}
            defaultValue={current.priceMin}
            name="priceMin"
            className="w-32"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Max price</label>
          <Input
            type="number"
            min={0}
            defaultValue={current.priceMax}
            name="priceMax"
            className="w-32"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              const min = document.querySelector<HTMLInputElement>('input[name="priceMin"]')?.value ?? "";
              const max = document.querySelector<HTMLInputElement>('input[name="priceMax"]')?.value ?? "";
              push({ priceMin: min, priceMax: max });
            }}
          >
            Apply price
          </Button>
        </div>
      </div>
    </div>
  );
}
