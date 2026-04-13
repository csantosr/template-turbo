import { getSession } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <header className="fixed right-0 top-0 z-50 p-4">
        <ThemeToggle />
      </header>
      <div className="w-full max-w-sm">
        <div className="border-2 border-border p-8">
          <h1 className="mb-1 font-mono font-bold text-2xl uppercase tracking-widest">SIGN IN</h1>
          <p className="mb-8 font-mono text-sm uppercase tracking-widest text-muted-foreground">
            Enter your credentials
          </p>
          <LoginForm />
        </div>
        <div className="border-2 border-border border-t-0 px-8 py-4">
          <p className="font-mono text-sm text-muted-foreground">
            No account?{" "}
            <a
              href="/register"
              className="font-bold uppercase underline underline-offset-4 text-foreground"
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
