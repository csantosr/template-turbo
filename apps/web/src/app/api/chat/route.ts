import { openai } from "@ai-sdk/openai";
import type { UIMessage } from "ai";
import { convertToModelMessages, createIdGenerator, streamText, tool, zodSchema } from "ai";
import { z } from "zod";
import { auth } from "@/server/auth";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { messages, system } = body as {
    messages: UIMessage[];
    system?: string;
  };

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: system ?? "You are a helpful assistant.",
    messages: await convertToModelMessages(messages),
    tools: {
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
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
  });
}
