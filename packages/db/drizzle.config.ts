import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// apps/web/.env is the single source of truth for env vars
config({ path: "../../apps/web/.env", quiet: true });

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
