import { Signer } from "@aws-sdk/rds-signer";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const signer = new Signer({
  hostname: process.env.RDS_HOST!,
  port: Number(process.env.RDS_PORT ?? 5432),
  username: process.env.RDS_USERNAME!,
  region: process.env.AWS_REGION ?? "us-east-1",
});

// pg calls password() per new connection — token stays fresh automatically
// (IAM tokens expire after 15 min)
const pool = new Pool({
  host: process.env.RDS_HOST,
  port: Number(process.env.RDS_PORT ?? 5432),
  database: process.env.RDS_DATABASE ?? "postgres",
  user: process.env.RDS_USERNAME,
  password: () => signer.getAuthToken(),
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
});

export const db = drizzle(pool, { schema });
export { pool };
