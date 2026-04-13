import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { CheckInboxForm } from "./check-inbox-form";

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function CheckInboxPage({ searchParams }: Props) {
  const { email } = await searchParams;
  if (!email) redirect("/forgot-password");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <header className="fixed right-0 top-0 z-50 p-4">
        <ThemeToggle />
      </header>
      <div className="w-full max-w-sm">
        <div className="border-2 border-border p-8">
          <h1 className="mb-1 font-mono font-bold text-2xl uppercase tracking-widest">
            CHECK YOUR INBOX
          </h1>
          <CheckInboxForm email={email} />
        </div>
        <div className="border-2 border-border border-t-0 px-8 py-4">
          <p className="font-mono text-sm text-muted-foreground">
            Remember your password?{" "}
            <a
              href="/login"
              className="font-bold uppercase underline underline-offset-4 text-foreground"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
