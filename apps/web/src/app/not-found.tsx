import { ThemeToggle } from "@/components/theme-toggle";
import { NotFoundActions } from "./not-found-actions";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <header className="fixed right-0 top-0 z-50 p-4">
        <ThemeToggle />
      </header>

      <div className="flex flex-col items-center gap-8 text-center">
        <h1
          className="font-mono font-bold uppercase tracking-tight leading-none"
          style={{ fontSize: "clamp(8rem, 25vw, 18rem)" }}
        >
          404
        </h1>

        <div className="h-px w-full border-b border-border" />

        <p className="font-mono text-lg font-bold uppercase tracking-widest text-muted-foreground">
          THIS DOESN&apos;T EXIST.
        </p>

        <NotFoundActions />

        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {`// 404 · page_not_found · ${new Date().toISOString()}`}
        </p>
      </div>
    </main>
  );
}
