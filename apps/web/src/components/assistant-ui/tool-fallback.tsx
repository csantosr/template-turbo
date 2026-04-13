const ToolFallback = ({ toolCall }: { toolCall?: { name?: string; args?: unknown } }) => {
  return (
    <div className="mt-2 pt-2 border-t-2 border-foreground font-mono text-sm">
      <div className="font-bold">Tool Call</div>
      <pre className="text-xs">{JSON.stringify(toolCall, null, 2)}</pre>
    </div>
  );
};

export { ToolFallback };
