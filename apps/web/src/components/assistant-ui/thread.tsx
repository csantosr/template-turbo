"use client";

import {
  ActionBarPrimitive,
  AuiIf,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import { Button } from "@repo/ui";
import { ArrowUpIcon, CopyIcon, PencilIcon, RefreshCwIcon, SquareIcon } from "lucide-react";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";

const Thread = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4">
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <ThreadWelcome />
        </AuiIf>
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
            EditComposer,
          }}
        />
      </ThreadPrimitive.Viewport>
      <ThreadPrimitive.ViewportFooter className="border-t-2 border-foreground p-4 bg-background">
        <Composer />
      </ThreadPrimitive.ViewportFooter>
    </ThreadPrimitive.Root>
  );
};

const ThreadWelcome = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h1 className="text-2xl font-semibold mb-2">Welcome to AI Chat</h1>
      <p className="text-muted-foreground">Start a conversation with the assistant</p>
    </div>
  );
};

const Composer = () => {
  return (
    <ComposerPrimitive.Root className="flex gap-2">
      <ComposerPrimitive.Input
        autoFocus
        className="flex-1 border-2 border-foreground p-2 font-mono outline-none bg-background resize-none"
        placeholder="Type a message..."
      />
      <AuiIf condition={(s) => !s.thread.isRunning}>
        <ComposerPrimitive.Send asChild>
          <Button
            type="submit"
            className="border-2 border-foreground px-4 py-2 font-mono hover:bg-foreground hover:text-background"
          >
            <ArrowUpIcon className="size-4" />
          </Button>
        </ComposerPrimitive.Send>
      </AuiIf>
      <AuiIf condition={(s) => s.thread.isRunning}>
        <ComposerPrimitive.Cancel asChild>
          <Button
            variant="default"
            size="icon"
            className="border-2 border-destructive border-destructive px-4 py-2"
          >
            <SquareIcon className="size-3 fill-current" />
          </Button>
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </ComposerPrimitive.Root>
  );
};

const MessageError = () => {
  return (
    <MessagePrimitive.Error>
      <div className="mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm" />
    </MessagePrimitive.Error>
  );
};

const AssistantMessage = () => {
  return (
    <MessagePrimitive.Root data-role="assistant" className="py-3">
      <div className="flex gap-2">
        <div className="max-w-[80%] border-2 border-foreground p-4 font-mono">
          <div className="text-sm text-muted-foreground mb-2">assistant</div>
          <MessagePrimitive.Parts
            components={{
              Text: MarkdownText as any,
              Empty: () => (
                <span className="animate-pulse text-muted-foreground text-xs">Thinking...</span>
              ),
            }}
          />
          <MessageError />
        </div>
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantActionBar = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex flex-col gap-1 text-muted-foreground pt-2"
    >
      <ActionBarPrimitive.Copy asChild>
        <Button variant="ghost" className="cursor-pointer p-1">
          <CopyIcon className="size-4" />
        </Button>
      </ActionBarPrimitive.Copy>
      <ActionBarPrimitive.Reload asChild>
        <Button variant="ghost" className="cursor-pointer p-1">
          <RefreshCwIcon className="size-4" />
        </Button>
      </ActionBarPrimitive.Reload>
    </ActionBarPrimitive.Root>
  );
};

const UserMessage = () => {
  return (
    <MessagePrimitive.Root data-role="user" className="py-3">
      <div className="flex justify-end">
        <UserActionBar />
        <div className="max-w-[80%] border-2 border-foreground p-4 font-mono">
          <MessagePrimitive.Parts components={{ Text: MarkdownText as any }} />
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

const UserActionBar = () => {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="flex flex-col gap-1 text-muted-foreground pt-2 px-3"
    >
      <ActionBarPrimitive.Edit asChild>
        <Button variant="ghost" className="cursor-pointer p-1">
          <PencilIcon className="size-4" />
        </Button>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
};

const EditComposer = () => {
  return (
    <MessagePrimitive.Root className="py-3">
      <div className="flex justify-end">
        <div className="max-w-[80%] border-2 border-foreground p-4 font-mono mr-auto">
          <ComposerPrimitive.Root className="flex flex-col gap-2">
            <ComposerPrimitive.Input
              className="w-full border-2 border-foreground p-2 font-mono outline-none bg-background resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <ComposerPrimitive.Cancel asChild>
                <Button variant="ghost">Cancel</Button>
              </ComposerPrimitive.Cancel>
              <ComposerPrimitive.Send asChild>
                <Button>Update</Button>
              </ComposerPrimitive.Send>
            </div>
          </ComposerPrimitive.Root>
        </div>
      </div>
    </MessagePrimitive.Root>
  );
};

export { Thread };
