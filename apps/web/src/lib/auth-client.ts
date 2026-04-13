import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { ac, adminRole, superAdminRole } from "@/server/auth-access";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    adminClient({
      ac,
      roles: {
        admin: adminRole,
        superadmin: superAdminRole,
      },
    }),
  ],
});

export const {
  changePassword,
  revokeOtherSessions,
  signIn,
  signOut,
  signUp,
  useSession,
  sendVerificationEmail,
} = authClient;
