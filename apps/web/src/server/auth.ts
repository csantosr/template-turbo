import * as schema from "@repo/db";
import { activityLogs, db, users } from "@repo/db";
import { ResetPasswordEmail, sendEmail, VerifyEmailEmail, WelcomeEmail } from "@repo/email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { createElement } from "react";
import { env } from "../../env";
import { ac, adminRole, superAdminRole } from "./auth-access";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_APP_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        react: createElement(ResetPasswordEmail, { url, name: user.name }),
      });
    },
    // Required when requireEmailVerification is true — provides safe fake response
    // for non-existent emails to prevent user enumeration
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "member",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        react: createElement(VerifyEmailEmail, { name: user.name, url }),
      });
    },
    afterEmailVerification: async (user) => {
      void sendEmail({
        to: user.email,
        subject: `Welcome to template, ${user.name}!`,
        react: createElement(WelcomeEmail, {
          name: user.name ?? "there",
          appUrl: env.NEXT_PUBLIC_APP_URL,
        }),
      });
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session, _ctx) => {
          const user = await db.query.users.findFirst({
            where: eq(users.id, session.userId),
          });
          if (user?.deletedAt) return false;
        },
        after: async (session) => {
          try {
            const user = await db.query.users.findFirst({
              where: eq(users.id, session.userId),
            });
            await db.insert(activityLogs).values({
              id: crypto.randomUUID(),
              userId: session.userId,
              userEmail: user?.email ?? "",
              action: "LOGIN",
              status: "success",
            });
          } catch {
            /* non-critical */
          }
        },
      },
    },
  },
  hooks: {
    // Check banned status BEFORE the email-verification check runs.
    // The admin plugin's own banned check lives in databaseHooks.session.create.before,
    // which is unreachable for unverified users because emailAndPassword throws first.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;

      const email = (ctx.body as { email?: string } | undefined)?.email;
      if (!email) return;

      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user?.banned) return;

      // Lift an expired ban transparently and let the normal flow continue
      if (user.banExpires && user.banExpires < new Date()) {
        await db
          .update(users)
          .set({ banned: false, banReason: null, banExpires: null, updatedAt: new Date() })
          .where(eq(users.id, user.id));
        return;
      }

      throw new APIError("FORBIDDEN", {
        message: `Your account has been banned.${user.banReason ? ` Reason: ${user.banReason}` : ""}`,
      });
    }),
  },
  plugins: [
    nextCookies(),
    admin({
      ac,
      adminRoles: ["admin", "superadmin"],
      roles: {
        admin: adminRole,
        superadmin: superAdminRole,
      },
    }),
  ],
});
