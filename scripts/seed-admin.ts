import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@havetech.id";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = "Admin Have Tech";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL tidak ditemukan");
    process.exit(1);
  }

  const client = postgres(dbUrl, { prepare: false });
  const db = drizzle(client, { schema });

  console.log("🔍 Mengecek apakah admin sudah ada...");

  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, ADMIN_EMAIL),
  });

  if (existing) {
    if (existing.role === "admin") {
      console.log(`⚠️ Admin dengan email "${ADMIN_EMAIL}" sudah ada (id: ${existing.id}). Skip.`);
    } else {
      console.log(`⚠️ User dengan email "${ADMIN_EMAIL}" sudah ada tapi bukan admin. Skip.`);
    }
    await client.end();
    return;
  }

  console.log(`🔐 Hashing password...`);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  console.log(`📝 Membuat akun admin...`);
  const [newAdmin] = await db.insert(schema.users).values({
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: "admin",
    passwordHash,
  }).returning();

  console.log(`✅ Admin berhasil dibuat!`);
  console.log(`   ID    : ${newAdmin.id}`);
  console.log(`   Email : ${newAdmin.email}`);
  console.log(`   Name  : ${newAdmin.name}`);
  console.log(`   Role  : ${newAdmin.role}`);

  await client.end();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
