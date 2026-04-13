"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import type { UIMessage } from "ai";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useMemo } from "react";
import { Thread } from "@/components/assistant-ui/thread";

export interface AssistantProps {
  threadId?: string;
  initialMessages?: UIMessage[];
}

export default function Assistant({ threadId, initialMessages }: AssistantProps) {
  const runtime = useChatRuntime({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
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
