import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const me = await requireAuth();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("Missing file");
    if (!ALLOWED.has(file.type)) return jsonError("Unsupported file type");
    if (file.size > MAX_BYTES) return jsonError("File too large");
    const ext =
      file.type === "image/jpeg"
        ? ".jpg"
        : file.type === "image/png"
          ? ".png"
          : file.type === "image/webp"
            ? ".webp"
            : ".gif";
    const relDir = path.join("public", "uploads", me.id);
    const absDir = path.join(process.cwd(), relDir);
    await mkdir(absDir, { recursive: true });
    const name = `${randomUUID()}${ext}`;
    const absPath = path.join(absDir, name);
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(absPath, buf);
    const url = `/uploads/${me.id}/${name}`;
    return jsonOk({ url });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
