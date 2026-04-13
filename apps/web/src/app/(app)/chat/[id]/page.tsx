"use client";

import { useRouter } from "next/navigation";
import { use } from "react";
import Assistant, { type AssistantProps } from "@/components/assistant";
import { trpc } from "@/trpc/client";

export default function ChatThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: thread, isLoading } = trpc.chat.getThread.useQuery(
    { id },
    {
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
      staleTime: 0,
    },
  );

  const initialMessages = thread?.messages as AssistantProps["initialMessages"] | undefined;

  if (isLoading || !thread) {
    return (
      <div className="flex h-full items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Assistant threadId={thread.id} initialMessages={initialMessages} />
    </div>
  );
}
