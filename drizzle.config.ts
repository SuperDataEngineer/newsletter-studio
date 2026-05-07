import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // For migrations, generate a fresh IAM token first:
    //   source scripts/db-token.sh && npm run db:push
    url: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false } as { rejectUnauthorized: boolean },
  },
} satisfies Config;
