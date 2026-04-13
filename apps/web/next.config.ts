import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@repo/ui",
    "@repo/db",
    "@repo/email",
    "@repo/validators",
    "@assistant-ui/react",
    "@assistant-ui/react-ai-sdk",
  ],
  serverExternalPackages: ["better-auth", "drizzle-orm", "postgres"],
};

export default nextConfig;
