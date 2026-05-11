import { Types } from "mongoose";
import Listing from "@/models/Listing";
import { connectDB } from "@/lib/db";
import { listingCreateSchema } from "@/lib/validators";
import { assertValidCategoryPair } from "@/lib/categories";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";
import { browseListings } from "@/lib/browse-listings";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw = Object.fromEntries(url.searchParams.entries());
    const result = await browseListings(raw);
    if ("error" in result) return jsonError(result.error);
    return jsonOk(result);
  } catch (e) {
    const err = e as Error;
    return jsonError(err.message, 500);
  }
}

export async function POST(req: Request) {
  try {
    const me = await requireAuth();
    if (me.role !== "seller" && me.role !== "admin") {
      return jsonError("Seller role required", 403);
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON");
    }
    const parsed = listingCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed", 422);
    }
    await connectDB();
    await assertValidCategoryPair(parsed.data.categorySlug, parsed.data.subcategorySlug);
    const listing = await Listing.create({
      seller: new Types.ObjectId(me.id),
      title: parsed.data.title,
      description: parsed.data.description,
      condition: parsed.data.condition,
      categorySlug: parsed.data.categorySlug,
      subcategorySlug: parsed.data.subcategorySlug,
      location: parsed.data.location,
      price: parsed.data.price,
      images: parsed.data.images,
      status: "active",
    });
    return jsonOk({ id: listing._id.toString() }, 201);
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
