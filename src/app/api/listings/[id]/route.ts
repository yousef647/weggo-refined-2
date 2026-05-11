import { Types } from "mongoose";
import Listing from "@/models/Listing";
import { connectDB } from "@/lib/db";
import { listingUpdateSchema } from "@/lib/validators";
import { assertValidCategoryPair } from "@/lib/categories";
import { getCurrentUser, requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  if (!Types.ObjectId.isValid(id)) return jsonError("Not found", 404);
  await connectDB();
  const me = await getCurrentUser();
  const listing = await Listing.findById(id).populate("seller", "name email").lean();
  if (!listing) return jsonError("Not found", 404);
  const isOwner = me && listing.seller && listing.seller._id?.toString() === me.id;
  const isAdmin = me?.role === "admin";
  if (listing.status !== "active" && !isOwner && !isAdmin) {
    return jsonError("Not found", 404);
  }
  return jsonOk({ listing });
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const me = await requireAuth();
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return jsonError("Not found", 404);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON");
    }
    const parsed = listingUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonError("Validation failed", 422);
    await connectDB();
    const listing = await Listing.findById(id);
    if (!listing) return jsonError("Not found", 404);
    const isOwner = listing.seller.toString() === me.id;
    const isAdmin = me.role === "admin";
    if (!isOwner && !isAdmin) return jsonError("Forbidden", 403);
    if (!isAdmin && (listing.status === "hidden" || listing.status === "removed")) {
      return jsonError("Listing is moderated; only an admin can edit it now.", 403);
    }
    if (parsed.data.status && !isAdmin) {
      const allowedOwner = ["sold", "active"];
      if (!allowedOwner.includes(parsed.data.status)) {
        return jsonError("Forbidden status change", 403);
      }
    }
    const { categorySlug, subcategorySlug } = parsed.data;
    if (categorySlug && subcategorySlug) {
      await assertValidCategoryPair(categorySlug, subcategorySlug);
    } else if (categorySlug || subcategorySlug) {
      return jsonError("Provide both category and subcategory", 400);
    }
    Object.assign(listing, parsed.data);
    await listing.save();
    return jsonOk({ ok: true });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const me = await requireAuth();
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return jsonError("Not found", 404);
    await connectDB();
    const listing = await Listing.findById(id);
    if (!listing) return jsonError("Not found", 404);
    const isOwner = listing.seller.toString() === me.id;
    const isAdmin = me.role === "admin";
    if (!isOwner && !isAdmin) return jsonError("Forbidden", 403);
    listing.status = "removed";
    await listing.save();
    return jsonOk({ ok: true });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
