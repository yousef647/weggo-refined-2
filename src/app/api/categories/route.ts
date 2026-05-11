import { getCategoryTree } from "@/lib/category-tree";
import { jsonOk } from "@/lib/api-response";

export async function GET() {
  const categories = await getCategoryTree();
  return jsonOk({ categories });
}
