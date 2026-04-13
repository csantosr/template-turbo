import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MarkdownText = (props: any) => {
  const text = props?.content?.text ?? props?.text ?? String(props?.children ?? "");

  if (!text) {
    return <span className="font-mono text-sm">Empty message</span>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h4>
        ),
        h5: ({ children }) => (
          <h5 className="text-sm font-semibold mb-2 mt-3 first:mt-0">{children}</h5>
        ),
        h6: ({ children }) => (
          <h6 className="text-sm font-medium mb-2 mt-3 first:mt-0">{children}</h6>
        ),
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-blue-500 underline hover:text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li className="ml-2">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-muted-foreground pl-4 italic my-3 text-muted-foreground">
            {children}
          </blockquote>
        ),
        pre: ({ children }) => (
          <pre className="bg-muted border border-foreground p-4 rounded-md overflow-x-auto my-3 font-mono text-sm">
            {children}
          </pre>
        ),
        code: ({ className, children }) => {
          const isInline = !className?.includes("language-");
          if (isInline) {
            return (
              <code className="bg-muted border border-foreground px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            );
          }
          return <code className={className}>{children}</code>;
        },
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            className="max-w-full h-auto rounded-md my-3 border border-foreground"
          />
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full border border-foreground">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
        th: ({ children }) => (
          <th className="border border-foreground px-3 py-2 text-left font-semibold">{children}</th>
        ),
        td: ({ children }) => <td className="border border-foreground px-3 py-2">{children}</td>,
        hr: () => <hr className="border-foreground my-6" />,
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export { MarkdownText };
