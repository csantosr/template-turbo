import { db } from "@repo/db";
import type { Action, Resource } from "@repo/validators";
import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { z } from "zod";
import { auth } from "@/server/auth";
import { checkPermission } from "@/server/rbac";

const fieldLabels: Record<string, string> = {
  name: "Name",
  email: "Email",
  password: "Password",
  role: "Role",
  description: "Description",
  reason: "Reason",
  id: "ID",
  token: "Token",
  userId: "User ID",
  roleId: "Role ID",
  resource: "Resource",
  action: "Action",
  granted: "Granted",
  expiresIn: "Expiration",
  detail: "Detail",
  page: "Page",
  pageSize: "Page Size",
  search: "Search",
  status: "Status",
};

function formatZodError(issues: z.ZodIssue[]): string[] {
  return issues.map((issue) => {
    const path = issue.path.join(".");
    const label = fieldLabels[path] || path;
    const message = issue.message;

    if (issue.code === "too_small") {
      if (message.includes("string") || message.includes(">=1")) {
        return `${label} is required`;
      }
      if (message.includes("at least")) {
        const match = message.match(/at least (\d+)/);
        return `${label} must be at least ${match?.[1] || "1"}`;
      }
      return message;
    }

    if (issue.code === "too_big") {
      if (message.includes("string")) {
        const match = message.match(/<(\d+)/);
        return `${label} must be ${match?.[1] || "100"} characters or less`;
      }
      return message;
    }

    if (issue.code === "invalid_format") {
      if (message.toLowerCase().includes("email")) {
        return "Please enter a valid email address";
      }
      return message;
    }

    if (issue.code === "invalid_type") {
      return `${label} is required`;
    }

    if (issue.code === "invalid_union" || issue.code === "invalid_value") {
      return `${label} is invalid`;
    }

    return message || `Invalid ${label}`;
  });
}

export async function createContext({ req }: FetchCreateContextFnOptions) {
  const session = await auth.api.getSession({ headers: req.headers });
  return { db, req, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    if (error.cause instanceof z.ZodError) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: {
            issues: formatZodError(error.cause.issues),
          },
        },
      };
    }
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, session: ctx.session } });
});

export const requirePermission = <R extends Resource>(resource: R, action: Action<R>) =>
  t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
    const allowed = await checkPermission(ctx.session.user.id, resource, action);
    if (!allowed) throw new TRPCError({ code: "FORBIDDEN" });
    return next({ ctx: { ...ctx, session: ctx.session } });
  });
