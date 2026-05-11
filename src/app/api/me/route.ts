import { getCurrentUser } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Unauthorized", 401);
  return jsonOk({
    id: me.id,
    name: me.name,
    email: me.email,
    role: me.role,
    banned: me.banned,
  });
}
