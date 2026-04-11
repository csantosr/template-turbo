import { getSession } from "@/auth";
import { ArrowRight, CheckCircle, XCircle } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { redirect } from "next/navigation";

const STATS = [
  {
    label: "TOTAL USERS",
    value: "1,284",
    change: "+12% this month",
    up: true,
  },
  {
    label: "ACTIVE TODAY",
    value: "48",
    change: "+3 since yesterday",
    up: true,
  },
  {
    label: "MONTHLY REVENUE",
    value: "$3,920",
    change: "+8% MoM",
    up: true,
  },
  {
    label: "OPEN ISSUES",
    value: "7",
    change: "−2 resolved today",
    up: false,
  },
];

const RECENT_USERS = [
  {
    name: "Alice Martin",
    email: "alice@example.com",
    role: "Admin",
    joined: "Jan 15, 2025",
  },
  {
    name: "Bob Chen",
    email: "bob@example.com",
    role: "Member",
    joined: "Feb 3, 2025",
  },
  {
    name: "Carol Davis",
    email: "carol@example.com",
    role: "Member",
    joined: "Feb 20, 2025",
  },
  {
    name: "Dan Wilson",
    email: "dan@example.com",
    role: "Member",
    joined: "Mar 8, 2025",
  },
  {
    name: "Emma Garcia",
    email: "emma@example.com",
    role: "Viewer",
    joined: "Mar 22, 2025",
  },
];

const RECENT_ACTIVITY = [
  {
    user: "alice@example.com",
    action: "LOGIN",
    detail: "Web browser",
    time: "2 min ago",
    ok: true,
  },
  {
    user: "bob@example.com",
    action: "INVITE",
    detail: "carol@example.com",
    time: "18 min ago",
    ok: true,
  },
  {
    user: "unknown",
    action: "LOGIN",
    detail: "Blocked — bad credentials",
    time: "2h ago",
    ok: false,
  },
  {
    user: "dan@example.com",
    action: "PROFILE_UPDATE",
    detail: "Name changed",
    time: "3h ago",
    ok: true,
  },
];

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      {/* Welcome */}
      <div>
        <p className="mb-1 font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Welcome back
        </p>
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight">
          {session.user.name}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-2 bg-background p-6">
            <span className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
              {s.label}
            </span>
            <span className="font-mono text-3xl font-bold">{s.value}</span>
            <span
              className={`font-mono text-sm ${
                s.up
                  ? "text-green-800 dark:text-green-400"
                  : "text-muted-foreground"
              }`}
            >
              {s.change}
            </span>
          </div>
        ))}
      </div>

      {/* Two-column: recent users + activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent users */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Recent Users
            </span>
            <Link
              href="/users"
              className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-1">View all <ArrowRight weight="bold" size={14} /></span>
            </Link>
          </div>
          <div className="border border-border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-mono text-sm uppercase tracking-widest text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-sm uppercase tracking-widest text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-mono text-sm uppercase tracking-widest text-muted-foreground">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {RECENT_USERS.map((u) => (
                  <tr
                    key={u.email}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-base font-bold">{u.name}</p>
                      <p className="font-mono text-sm text-muted-foreground">
                        {u.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm uppercase tracking-widest text-muted-foreground">
                      {u.role}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                      {u.joined}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-sm uppercase tracking-[0.3em] text-muted-foreground">
              Recent Activity
            </span>
            <Link
              href="/activity"
              className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-1">View all <ArrowRight weight="bold" size={14} /></span>
            </Link>
          </div>
          <div className="border border-border">
            {RECENT_ACTIVITY.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 border-b border-border p-4 last:border-0"
              >
                <span className={`mt-0.5 shrink-0 ${a.ok ? "text-green-800 dark:text-green-400" : "text-destructive"}`}>
                  {a.ok
                    ? <CheckCircle weight="fill" size={16} />
                    : <XCircle weight="fill" size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-bold uppercase tracking-widest">
                    {a.action}
                  </p>
                  <p className="truncate font-mono text-sm text-muted-foreground">
                    {a.user} — {a.detail}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm text-muted-foreground">
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
