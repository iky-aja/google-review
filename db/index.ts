import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Connection pooling config: Supabase pooler requires prepare: false, max: 1 for serverless
const client = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

export const db = drizzle(client, { schema });
