import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
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
