import { Types } from "mongoose";
import Message from "@/models/Message";
import Conversation from "@/models/Conversation";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  try {
    const me = await requireAuth();
    await connectDB();
    const uid = new Types.ObjectId(me.id);

    // Get all conversations where the user is a participant
    const conversations = await Conversation.find({
      $or: [{ buyer: uid }, { seller: uid }],
    });

    if (conversations.length === 0) {
      return jsonOk({ unreadCount: 0 });
    }

    const conversationIds = conversations.map((c) => c._id);

    // Count unread messages where user is NOT the sender
    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: uid },
      readAt: null,
    });

    return jsonOk({ unreadCount });
  } catch (e) {
    const err = e as Error & { status?: number };
    return jsonError(err.message, err.status ?? 500);
  }
}
