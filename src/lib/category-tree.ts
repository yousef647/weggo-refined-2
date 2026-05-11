import Category from "@/models/Category";
import { connectDB } from "@/lib/db";

export type CategoryTree = {
  slug: string;
  name: string;
  subcategories: { slug: string; name: string }[];
}[];

export async function getCategoryTree(): Promise<CategoryTree> {
  await connectDB();
  const all = await Category.find().sort({ parentSlug: 1, sortOrder: 1, name: 1 }).lean();
  const parents = all.filter((c) => c.parentSlug === null);
  const children = all.filter((c) => c.parentSlug !== null);
  return parents.map((p) => ({
    slug: p.slug,
    name: p.name,
    subcategories: children
      .filter((c) => c.parentSlug === p.slug)
      .map((c) => ({ slug: c.slug, name: c.name })),
  }));
}
