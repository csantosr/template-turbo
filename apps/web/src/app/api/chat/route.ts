import { google } from "@ai-sdk/google";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { chatThreads, db } from "@repo/db";
import type { UIMessage } from "ai";
import {
  convertToModelMessages,
  createIdGenerator,
  stepCountIs,
  streamText,
  tool,
  zodSchema,
} from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/server/auth";

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { messages, system, tools, id, threadId } = body as {
    messages: UIMessage[];
    system?: string;
    tools?: unknown;
    id?: string;
    threadId?: string;
  };

  const chatId = id;

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    system: system ?? "You are a helpful assistant.",
    messages: await convertToModelMessages(messages),
    tools: {
      ...(tools ? frontendTools(tools as Parameters<typeof frontendTools>[0]) : {}),
      getWeather: tool({
        description: "Get current weather for a location",
        inputSchema: zodSchema(
          z.object({
            location: z.string().describe("City name"),
          }),
        ),
        execute: async ({ location }) => {
          return { location, temperature: Math.round(Math.random() * 40 + 10), condition: "sunny" };
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    onFinish: async ({ messages: finalMessages }) => {
      if (chatId && session?.user?.id) {
        const title =
          finalMessages
            .find((m) => m.role === "user")
            ?.parts?.filter((p) => p.type === "text")
            ?.map((p) => p.text)
            ?.join(" ")
            ?.slice(0, 100) ?? "New Chat";

        await db
          .update(chatThreads)
          .set({ messages: finalMessages, title, updatedAt: new Date() })
          .where(eq(chatThreads.id, chatId));
      }
    },
  });
}
