import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import WishlistItem from "@/models/WishlistItem";
import { ListingCard } from "@/components/listing-card";
import { redirect } from "next/navigation";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await connectDB();
  const rows = await WishlistItem.find({ user: session.user.id })
    .populate("listing")
    .sort({ createdAt: -1 })
    .lean();

  const items = rows
    .map((r) => r.listing as Record<string, unknown> | null)
    .filter((l): l is Record<string, unknown> => !!l && typeof l === "object");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
        <p className="text-sm text-muted-foreground">Listings you have saved.</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((listing) => (
            <ListingCard
              key={String(listing._id)}
              listing={{
                _id: String(listing._id),
                title: String(listing.title),
                price: Number(listing.price),
                condition: String(listing.condition),
                images: (listing.images as string[]) ?? [],
                location: String(listing.location ?? ""),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
