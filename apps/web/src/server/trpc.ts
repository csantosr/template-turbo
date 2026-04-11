import { db } from "@repo/db";
import type { Action, Resource } from "@repo/validators";
import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { auth } from "@/server/auth";
import { checkPermission } from "@/server/rbac";

export async function createContext({ req }: FetchCreateContextFnOptions) {
  const session = await auth.api.getSession({ headers: req.headers });
  return { db, req, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

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
