import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./db/schema";

async function main() {
  const url = "postgresql://postgres.nbjizvpzotrudjwbnqve:Kikiganteng123*@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";
  console.log("Connecting using Pooler address on port 5432...");
  
  // Try port 6543 and 5432
  const hosts = [
    "postgresql://postgres.nbjizvpzotrudjwbnqve:Kikiganteng123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
    "postgresql://postgres.nbjizvpzotrudjwbnqve:Kikiganteng123*@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
  ];

  for (const connectionUrl of hosts) {
    console.log(`Trying connection: ${connectionUrl}`);
    const client = postgres(connectionUrl, { max: 1, connect_timeout: 5 });
    const db = drizzle(client, { schema });
    try {
      await migrate(db, { migrationsFolder: "./db/migrations" });
      console.log("SUCCESS with " + connectionUrl);
      await client.end();
      process.exit(0);
    } catch (err) {
      console.error("Failed with " + connectionUrl + ":", (err as Error).message);
    } finally {
      await client.end();
    }
  }
  process.exit(1);
}

main();
