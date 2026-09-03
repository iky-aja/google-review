import postgres from "postgres";

async function main() {
  const url = "postgresql://postgres.nbjizvpzotrudjwbnqve:Kikiganteng123*@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
  console.log("Checking tables in database...");
  const client = postgres(url, { max: 1 });
  try {
    const tables = await client`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log("Tables present:", tables.map(t => t.table_name));

    const types = await client`SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace`;
    console.log("Types present:", types.map(t => t.typname));
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await client.end();
  }
}

main();
