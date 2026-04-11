import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/db", "@repo/email", "@repo/validators"],
  serverExternalPackages: ["better-auth", "drizzle-orm", "postgres"],
};

export default nextConfig;
