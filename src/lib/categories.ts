import Category from "@/models/Category";
import { connectDB } from "@/lib/db";

export async function assertValidCategoryPair(categorySlug: string, subcategorySlug: string) {
  await connectDB();
  const parent = await Category.findOne({ parentSlug: null, slug: categorySlug });
  const sub = await Category.findOne({ parentSlug: categorySlug, slug: subcategorySlug });
  if (!parent || !sub) {
    const err = new Error("Invalid category or subcategory");
    (err as Error & { status: number }).status = 400;
    throw err;
  }
}
