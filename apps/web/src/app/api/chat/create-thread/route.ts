import { chatThreads, db } from "@repo/db";
import { generateId } from "ai";
import { auth } from "@/server/auth";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const id = generateId();
  await db.insert(chatThreads).values({
    id,
    userId: session.user.id,
    messages: [],
  });

  return Response.json({ id });
}
