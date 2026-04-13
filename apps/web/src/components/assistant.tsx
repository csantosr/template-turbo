"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { useMemo, useRef } from "react";
import { Thread } from "@/components/assistant-ui/thread";
import { trpc } from "@/trpc/client";

export interface AssistantProps {
  threadId?: string;
  initialMessages?: UIMessage[];
}

export default function Assistant({ threadId, initialMessages }: AssistantProps) {
  const utils = trpc.useUtils();
  const hasInvalidatedRef = useRef(false);
  const initialCount = useRef(initialMessages?.length ?? 0);

  const runtime = useChatRuntime({
    onFinish: ({ messages }) => {
      if (!threadId) return;

      const userMessages = messages.filter((m: UIMessage) => m.role === "user");
      const currentCount = userMessages.length;

      if (currentCount > initialCount.current && !hasInvalidatedRef.current) {
        hasInvalidatedRef.current = true;
        setTimeout(() => {
          utils.chat.getThread.invalidate({ id: threadId });
          utils.chat.listThreads.invalidate();
        }, 500);
      }
    },
    transport: useMemo(
      () =>
        new DefaultChatTransport({
          api: "/api/chat",
          prepareSendMessagesRequest: async (options) => ({
            body: {
              ...options.body,
              id: threadId,
              messages: options.messages,
            },
          }),
        }),
      [threadId],
    ),
    messages: initialMessages,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-full">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
