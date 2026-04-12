import { getSession } from "@/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { redirect } from "next/navigation";
import { RegisterForm } from "./register-form";

interface Props {
  searchParams: Promise<{ invite?: string; email?: string; name?: string }>;
}

export default async function RegisterPage({ searchParams }: Props) {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const isInvite = !!params.invite;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <header className="fixed right-0 top-0 z-50 p-4">
        <ThemeToggle />
      </header>
      <div className="w-full max-w-sm">
        <div className="border-2 border-border p-8">
          <h1 className="mb-1 font-mono text-2xl font-bold uppercase tracking-widest">
            {isInvite ? "ACCEPT INVITE" : "REGISTER"}
          </h1>
          <p className="mb-8 font-mono text-sm uppercase tracking-widest text-muted-foreground">
            {isInvite ? "Set your password to get started" : "Create your account"}
          </p>
          <RegisterForm
            invite={params.invite}
            initialEmail={params.email}
            initialName={params.name}
          />
        </div>
        {!isInvite && (
          <div className="border-2 border-t-0 border-border px-8 py-4">
            <p className="font-mono text-sm text-muted-foreground">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-bold uppercase underline underline-offset-4 text-foreground"
              >
                Sign in
              </a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
