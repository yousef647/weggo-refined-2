import Listing from "@/models/Listing";
import { connectDB } from "@/lib/db";
import { browseQuerySchema } from "@/lib/validators";

export async function browseListings(searchParams: Record<string, string | string[] | undefined>) {
  const raw: Record<string, string> = {};
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") raw[k] = v;
    else if (Array.isArray(v) && v[0]) raw[k] = v[0];
  }
  const parsed = browseQuerySchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid query parameters" as const };
  await connectDB();
  const { page, limit, categorySlug, subcategorySlug, condition, priceMin, priceMax, sort, q } =
    parsed.data;

  const filter: Record<string, unknown> = { status: "active" };
  if (categorySlug) filter.categorySlug = categorySlug;
  if (subcategorySlug) filter.subcategorySlug = subcategorySlug;
  if (condition) filter.condition = condition;
  if (priceMin !== undefined || priceMax !== undefined) {
    const p: Record<string, number> = {};
    if (priceMin !== undefined) p.$gte = priceMin;
    if (priceMax !== undefined) p.$lte = priceMax;
    filter.price = p;
  }

  const hasQ = !!(q && q.trim());
  if (hasQ) {
    filter.$text = { $search: q!.trim() };
  }

  const skip = (page - 1) * limit;

  let query = Listing.find(filter).populate("seller", "name email");

  if (hasQ && sort === "relevance") {
    query = query.select({ score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });
  } else if (sort === "price_asc") {
    query = query.sort({ price: 1, createdAt: -1 });
  } else if (sort === "price_desc") {
    query = query.sort({ price: -1, createdAt: -1 });
  } else {
    query = query.sort({ createdAt: -1 });
  }

  const [items, total] = await Promise.all([
    query.skip(skip).limit(limit).lean(),
    Listing.countDocuments(filter),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
