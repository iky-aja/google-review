import postgres from "postgres";

async function main() {
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres.nbjizvpzotrudjwbnqve:Kikiganteng123*@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";
  console.log("🚀 Creating missing database tables in Supabase...");

  const client = postgres(dbUrl, { prepare: false });

  const query = `
    DO $$ BEGIN
      CREATE TYPE card_status AS ENUM ('UNASSIGNED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      google_id text UNIQUE,
      name text NOT NULL,
      role text DEFAULT 'owner' NOT NULL,
      password_hash text,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS businesses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name text NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      public_token text NOT NULL UNIQUE,
      business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
      review_url text,
      status card_status DEFAULT 'UNASSIGNED' NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      activated_at timestamp,
      updated_at timestamp DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tap_logs (
      id bigserial PRIMARY KEY,
      card_id uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      created_at timestamp DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      card_id uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      user_id uuid REFERENCES users(id) ON DELETE SET NULL,
      action text NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS cards_public_token_idx ON cards(public_token);
    CREATE INDEX IF NOT EXISTS tap_logs_card_id_idx ON tap_logs(card_id);
    CREATE INDEX IF NOT EXISTS users_google_id_idx ON users(google_id);
  `;

  await client.unsafe(query);
  console.log("✅ ALL TABLES CREATED SUCCESSFULLY IN SUPABASE!");
  await client.end();
}

main().catch((err) => {
  console.error("❌ Setup error:", err);
  process.exit(1);
});
