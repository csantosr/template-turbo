"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { trpc } from "@/trpc/client";

export default function ChatPage() {
  const router = useRouter();
  const createdRef = useRef(false);

  const { data: threads, isLoading } = trpc.chat.listThreads.useQuery();

  const createThread = trpc.chat.createThread.useMutation({
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`);
    },
  });

  useEffect(() => {
    if (isLoading || createdRef.current) return;

    if (threads && threads.length > 0) {
      const mostRecent = threads[0]!;
      router.replace(`/chat/${mostRecent.id}`);
    } else if (!createThread.isPending) {
      createdRef.current = true;
      createThread.mutate();
    }
  }, [isLoading, threads, createThread, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <div>Loading...</div>
    </div>
  );
}
