"use client";

import { AssistantRuntimeProvider, ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DefaultChatTransport } from "ai";

interface ChatInterfaceProps {
  threadId: string;
  initialMessages?: unknown[];
}

function MyComposer() {
  return (
    <ComposerPrimitive.Root className="flex gap-2">
      <ComposerPrimitive.Input
        className="flex-1 border-2 border-foreground p-2 font-mono outline-none bg-background resize-none"
        placeholder="Type a message..."
      />
      <ComposerPrimitive.Send className="border-2 border-foreground px-4 py-2 font-mono hover:bg-foreground hover:text-background transition-colors" />
    </ComposerPrimitive.Root>
  );
}

export function ChatInterface({ threadId, initialMessages }: ChatInterfaceProps) {
  const runtime = useChatRuntime({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="flex flex-col h-full">
        <ThreadPrimitive.ViewportProvider>
          <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4 space-y-4">
            <ThreadPrimitive.Empty>
              <div className="border-foreground border-2 p-8 text-center font-mono">
                <p className="text-xl mb-2">Welcome to AI Chat</p>
                <p className="text-muted-foreground text-sm">
                  Start a conversation with the assistant
                </p>
              </div>
            </ThreadPrimitive.Empty>
            <ThreadPrimitive.Messages>
              {({ message }) => {
                const parts = (
                  message.content as { parts?: Array<{ type: string; text?: string }> }
                ).parts;
                const textContent = parts?.find((p) => p.type === "text");
                const text = textContent?.text ?? "";
                return (
                  <div
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] border-foreground border-2 p-4 font-mono ${
                        message.role === "user" ? "mr-auto" : "ml-auto"
                      }`}
                    >
                      <div className="text-sm text-muted-foreground mb-2">
                        {message.role === "user" ? "you" : "assistant"}
                      </div>
                      <div className="whitespace-pre-wrap">{text}</div>
                    </div>
                  </div>
                );
              }}
            </ThreadPrimitive.Messages>
          </ThreadPrimitive.Viewport>
          <ThreadPrimitive.ViewportFooter className="border-t-2 border-foreground p-4 bg-background">
            <MyComposer />
          </ThreadPrimitive.ViewportFooter>
        </ThreadPrimitive.ViewportProvider>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}
