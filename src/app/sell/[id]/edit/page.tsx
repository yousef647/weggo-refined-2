import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import Listing from "@/models/Listing";
import { ListingForm } from "@/components/listing-form";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) notFound();
  const session = await auth();
  if (!session?.user) notFound();
  await connectDB();
  const listing = await Listing.findById(id).lean();
  if (!listing) notFound();
  const sellerId = listing.seller.toString();
  const isOwner = session.user.id === sellerId;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) notFound();

  const initial = {
    title: listing.title,
    description: listing.description,
    condition: listing.condition,
    categorySlug: listing.categorySlug,
    subcategorySlug: listing.subcategorySlug,
    location: listing.location,
    price: listing.price,
    images: listing.images ?? [],
    status: listing.status,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit listing</h1>
        <p className="text-sm text-muted-foreground">Update details or mark the item as sold.</p>
      </div>
      <ListingForm mode="edit" listingId={id} initial={initial} />
    </div>
  );
}
