import { LandingNav } from "./_components/landing-nav";
import { Button } from "@repo/ui";
import Link from "next/link";

const FEATURES = [
  {
    label: "MONOREPO",
    name: "Turborepo",
    desc: "Blazing-fast build system with intelligent caching and parallel task execution across packages.",
  },
  {
    label: "AUTH",
    name: "Better Auth",
    desc: "Full-featured authentication — sessions, email/password, and OAuth providers ready out of the box.",
  },
  {
    label: "DATABASE",
    name: "Drizzle ORM",
    desc: "Type-safe SQL with schema-as-code, auto migrations, and a PostgreSQL-first design.",
  },
  {
    label: "API",
    name: "tRPC v11",
    desc: "End-to-end type-safe APIs with React Query integration. No REST, no GraphQL, just TypeScript.",
  },
  {
    label: "UI",
    name: "shadcn/ui + Tailwind v4",
    desc: "Accessible component primitives with utility-first styling and zero-config dark mode.",
  },
  {
    label: "EMAIL",
    name: "React Email",
    desc: "Write email templates as React components. Preview locally, send via any provider.",
  },
  {
    label: "TYPES",
    name: "TypeScript 6",
    desc: "Strict type safety across every package boundary, shared configs, and path aliases.",
  },
  {
    label: "TOOLING",
    name: "Biome v2",
    desc: "Fast, opinionated linter and formatter that replaces ESLint + Prettier in a single tool.",
  },
  {
    label: "INFRA",
    name: "Docker Compose",
    desc: "Local Postgres pre-configured. One command spins up your full dev environment.",
  },
];

const PRICING = [
  {
    tier: "STARTER",
    price: "$0",
    period: "forever",
    desc: "Everything you need to start building.",
    highlight: false,
    features: [
      "Full source code — MIT license",
      "Next.js + tRPC + Better Auth",
      "Drizzle ORM + PostgreSQL",
      "shadcn/ui + Tailwind v4",
      "React Email templates",
      "Community support",
    ],
    cta: "GET STARTED",
    href: "/register",
  },
  {
    tier: "PRO",
    price: "$29",
    period: "per month",
    desc: "For teams shipping to production.",
    highlight: true,
    features: [
      "Everything in Starter",
      "Managed hosting on Fly.io",
      "Automated CI/CD pipelines",
      "Managed PostgreSQL + backups",
      "Priority email support",
      "Early roadmap access",
    ],
    cta: "START FREE TRIAL",
    href: "/register",
  },
  {
    tier: "ENTERPRISE",
    price: "CUSTOM",
    period: "contact us",
    desc: "For large teams and compliance needs.",
    highlight: false,
    features: [
      "Everything in Pro",
      "Dedicated infrastructure",
      "SSO / SAML support",
      "Custom SLAs and audits",
      "On-premise option",
      "Dedicated support channel",
    ],
    cta: "CONTACT US",
    href: "mailto:hello@example.com",
  },
];

const FAQ = [
  {
    q: "Is this free to use?",
    a: "Yes. The template is open source under the MIT license. Clone it, fork it, build on it — no attribution required.",
  },
  {
    q: "What database does it use?",
    a: "PostgreSQL, accessed via Drizzle ORM. The Docker Compose file spins up a local Postgres instance automatically so you can start developing with one command.",
  },
  {
    q: "Which authentication methods are supported?",
    a: "Email/password out of the box. Better Auth supports OAuth providers like GitHub, Google, and Discord with minimal configuration.",
  },
  {
    q: "Can I deploy this to Vercel?",
    a: "Yes. The Next.js app deploys to Vercel with no changes. For the database you'll need an external provider like Neon, Supabase, or Railway.",
  },
  {
    q: "How do I add a new package to the monorepo?",
    a: "Create a directory under packages/, add a package.json with your package name, and reference it from any app using the workspace name.",
  },
  {
    q: "Does it support the Next.js edge runtime?",
    a: "The app router is edge-compatible for most routes. tRPC and Better Auth run on the Node.js runtime by default but can be configured for edge.",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* ── Hero ── */}
      <section className="flex min-h-screen flex-col justify-center border-b border-border px-6 py-24 md:px-16">
        <p className="mb-6 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Full-stack monorepo starter
        </p>
        <h1
          className="font-mono font-bold uppercase leading-none tracking-tight"
          style={{ fontSize: "clamp(3rem, 10vw, 9rem)" }}
        >
          BUILD
          <br />
          SOMETHING
          <br />
          RAW.
        </h1>
        <p className="mt-8 max-w-xl font-mono text-base leading-relaxed text-muted-foreground">
          A production-ready starter with Next.js, tRPC, Better Auth, and
          Drizzle ORM — wired together so you can skip the boilerplate and ship.
        </p>
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            className="h-auto rounded-none border-2 border-primary px-8 py-4 font-mono font-bold uppercase tracking-widest shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Link href="/register">GET STARTED</Link>
          </Button>
          <Button
            asChild
            className="h-auto rounded-none border-2 border-primary px-8 py-4 font-mono font-bold uppercase tracking-widest shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Link href="/login">SIGN IN</Link>
          </Button>
        </div>
      </section>

      {/* ── Sticky nav ── */}
      <LandingNav />

      {/* ── Product ── */}
      <section
        id="product"
        className="scroll-mt-12 border-b border-border px-6 py-24 md:px-16"
      >
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          What's included
        </p>
        <h2
          className="mb-16 font-mono font-bold uppercase leading-none tracking-tight"
          style={{ fontSize: "clamp(2rem, 5vw, 5rem)" }}
        >
          EVERYTHING
          <br />
          YOU NEED.
        </h2>

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="group flex flex-col gap-3 bg-background p-8 transition-colors duration-200 hover:bg-foreground"
            >
              <span className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-200 group-hover:text-background/60">
                {f.label}
              </span>
              <span className="font-mono font-bold uppercase tracking-wide transition-colors duration-200 group-hover:text-background">
                {f.name}
              </span>
              <p className="font-mono text-sm leading-relaxed text-muted-foreground transition-colors duration-200 group-hover:text-background/70">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section
        id="pricing"
        className="scroll-mt-12 border-b border-border px-6 py-24 md:px-16"
      >
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Simple pricing
        </p>
        <h2
          className="mb-16 font-mono font-bold uppercase leading-none tracking-tight"
          style={{ fontSize: "clamp(2rem, 5vw, 5rem)" }}
        >
          PICK YOUR
          <br />
          PLAN.
        </h2>

        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
          {PRICING.map((p) => (
            <div
              key={p.tier}
              className={`flex flex-col gap-6 p-8 ${
                p.highlight ? "bg-foreground text-background" : "bg-background"
              }`}
            >
              <div>
                <span
                  className={`font-mono text-sm uppercase tracking-[0.3em] ${
                    p.highlight ? "text-background/60" : "text-muted-foreground"
                  }`}
                >
                  {p.tier}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-bold uppercase">
                    {p.price}
                  </span>
                  <span
                    className={`font-mono text-sm uppercase tracking-widest ${
                      p.highlight
                        ? "text-background/60"
                        : "text-muted-foreground"
                    }`}
                  >
                    / {p.period}
                  </span>
                </div>
                <p
                  className={`mt-2 font-mono text-sm ${
                    p.highlight ? "text-background/70" : "text-muted-foreground"
                  }`}
                >
                  {p.desc}
                </p>
              </div>

              <ul className="flex flex-col gap-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 font-mono text-sm">
                    <span
                      className={
                        p.highlight ? "text-background/50" : "text-muted-foreground"
                      }
                    >
                      —
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`mt-auto h-auto rounded-none border-2 px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest transition-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${
                  p.highlight
                    ? "border-background bg-transparent text-background shadow-[4px_4px_0_0_hsl(var(--background))] hover:bg-background hover:text-foreground"
                    : "border-foreground bg-transparent text-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]"
                }`}
              >
                <Link href={p.href}>{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        className="scroll-mt-12 border-b border-border px-6 py-24 md:px-16"
      >
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Frequently asked
        </p>
        <h2
          className="mb-16 font-mono font-bold uppercase leading-none tracking-tight"
          style={{ fontSize: "clamp(2rem, 5vw, 5rem)" }}
        >
          QUESTIONS.
        </h2>

        <div className="max-w-2xl divide-y divide-border border-t border-border">
          {FAQ.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-base font-bold uppercase tracking-widest">
                  {item.q}
                </span>
                <span className="shrink-0 font-mono text-lg text-muted-foreground transition-transform duration-150 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-6 font-mono text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="flex flex-col gap-6 border-t border-border px-6 py-10 md:flex-row md:items-center md:justify-between md:px-16">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-base font-bold uppercase tracking-widest">
            template-turbo
          </span>
          <span className="font-mono text-sm text-muted-foreground">
            Open source. MIT licensed.
          </span>
        </div>
        <div className="flex flex-wrap gap-6">
          {(
            [
              ["GitHub", "https://github.com"],
              ["Docs", "#product"],
              ["Pricing", "#pricing"],
              ["Sign In", "/login"],
            ] as const
          ).map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </main>
  );
}
