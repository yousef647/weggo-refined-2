import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import WishlistItem from "@/models/WishlistItem";
import { formatPrice, CONDITION_LABELS } from "@/lib/format";
import { ListingActions } from "./listing-actions";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const session = await auth();
  const listing = await Listing.findById(id).populate("seller", "name email").lean();
  if (!listing) notFound();

  const sellerId =
    typeof listing.seller === "object" && listing.seller && "_id" in listing.seller
      ? (listing.seller._id as Types.ObjectId).toString()
      : String(listing.seller);

  const isOwner = session?.user?.id === sellerId;
  const isAdmin = session?.user?.role === "admin";
  if (listing.status !== "active" && !isOwner && !isAdmin) notFound();

  let inWishlist = false;
  if (session?.user?.id) {
    const w = await WishlistItem.findOne({
      user: session.user.id,
      listing: id,
    }).lean();
    inWishlist = !!w;
  }

  const sellerName =
    typeof listing.seller === "object" && listing.seller && "name" in listing.seller
      ? String((listing.seller as { name?: string }).name ?? "Seller")
      : "Seller";

  const displayTitle = listing.title.replace(/^\[demo\]\s*/i, "");

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <Link href="/browse" className="hover:underline">
          ← Back to browse
        </Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
            {listing.images?.[0] ? (
              <Image
                src={listing.images[0]}
                alt=""
                fill
                className="object-cover"
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No photos
              </div>
            )}
          </div>
          {listing.images && listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.images.slice(1, 9).map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-md border border-border">
                  <Image src={src} alt="" fill className="object-cover" sizes="120px" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{displayTitle}</h1>
            <p className="mt-2 text-2xl font-semibold">{formatPrice(listing.price)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {CONDITION_LABELS[listing.condition] ?? listing.condition} · {listing.location}
              {listing.createdAt && (
                <>
                  {" "}
                  · Listed {new Date(listing.createdAt as Date).toLocaleDateString()}
                </>
              )}
            </p>
            {listing.status !== "active" && (
              <p className="mt-2 text-xs uppercase text-destructive">Status: {listing.status}</p>
            )}
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <p className="font-medium">Seller</p>
            <p className="text-muted-foreground">{sellerName}</p>
          </div>
          <ListingActions
            listingId={id}
            inWishlistInitially={inWishlist}
            isOwner={isOwner}
            isAdmin={isAdmin}
          />
          <div>
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Category: {listing.categorySlug} / {listing.subcategorySlug}
          </p>
        </div>
      </div>
    </div>
  );
}
