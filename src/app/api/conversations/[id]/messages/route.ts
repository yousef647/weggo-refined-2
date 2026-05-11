import { Types } from "mongoose";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { messageBodySchema } from "@/lib/validators";
import { jsonError, jsonOk } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

async function assertParticipant(conversationId: string, userId: string) {
  await connectDB();
  if (!Types.ObjectId.isValid(conversationId)) {
    const err = new Error("Not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  const conv = await Conversation.findById(conversationId);
  if (!conv) {
    const err = new Error("Not found");
    (err as Error & { status: number }).status = 404;
    throw err;
  }
  const uid = userId;
  if (conv.buyer.toString() !== uid && conv.seller.toString() !== uid) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return conv;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const me = await requireAuth();
    const { id } = await params;
    await assertParticipant(id, me.id);
    const url = new URL(req.url);
    const since = url.searchParams.get("since");
    const filter: Record<string, unknown> = { conversation: id };
    if (since && !Number.isNaN(Date.parse(since))) {
      filter.createdAt = { $gt: new Date(since) };
    }
    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .limit(200)
      .populate("sender", "name email")
      .lean();
    return jsonOk({ messages });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const me = await requireAuth();
    const { id } = await params;
    const conv = await assertParticipant(id, me.id);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON");
    }
    const parsed = messageBodySchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid body");
    const msg = await Message.create({
      conversation: conv._id,
      sender: new Types.ObjectId(me.id),
      body: parsed.data.body,
    });
    conv.lastMessageAt = new Date();
    await conv.save();
    return jsonOk({ message: msg.toObject() }, 201);
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
