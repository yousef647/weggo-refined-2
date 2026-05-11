import Link from "next/link";
import { browseListings } from "@/lib/browse-listings";
import { getCategoryTree } from "@/lib/category-tree";
import BrowseToolbar from "./browse-toolbar";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const result = await browseListings(sp);
  const categories = await getCategoryTree();

  if ("error" in result) {
    return <p className="text-sm text-destructive">{result.error}</p>;
  }

  const { items, page, totalPages } = result;

  const buildPageLink = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string" && v) params.set(k, v);
      else if (Array.isArray(v) && v[0]) params.set(k, v[0]);
    }
    params.set("page", String(p));
    return `/browse?${params.toString()}`;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Browse listings</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Filter by category, condition, and price — or search titles and descriptions. Newest listings show first unless
          you change sort.
        </p>
      </div>
      <BrowseToolbar categories={categories} />
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No listings match your filters.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ListingCard
              key={item._id.toString()}
              listing={{
                _id: item._id.toString(),
                title: item.title,
                price: item.price,
                condition: item.condition,
                images: item.images,
                location: item.location,
              }}
            />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Page {page} of {Math.max(1, totalPages)}
        </p>
        <div className="flex gap-2">
          {page <= 1 ? (
            <span className="inline-flex h-9 items-center rounded-md border border-transparent px-3 text-xs text-muted-foreground">
              Previous
            </span>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildPageLink(page - 1)}>Previous</Link>
            </Button>
          )}
          {page >= totalPages ? (
            <span className="inline-flex h-9 items-center rounded-md border border-transparent px-3 text-xs text-muted-foreground">
              Next
            </span>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href={buildPageLink(page + 1)}>Next</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
