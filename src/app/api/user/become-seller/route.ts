import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function POST() {
  try {
    const me = await requireAuth();
    if (me.role === "admin" || me.role === "seller") {
      return jsonOk({ role: me.role });
    }
    await connectDB();
    me.dbUser!.role = "seller";
    await me.dbUser!.save();
    return jsonOk({ role: "seller" });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
