-- Migration: Support admin credentials login
-- Makes google_id nullable (admins don't use Google OAuth)
-- Adds password_hash column for bcrypt hashed passwords (admins only)

ALTER TABLE "users" ALTER COLUMN "google_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;
