/**
 * One-off: create the schema directly via `pg`, bypassing Prisma's CLI engine — both
 * `prisma migrate dev` (needs a shadow DB) and `prisma db push` (needs an advisory lock)
 * hang against Supabase's transaction-mode pooler. The app itself already talks to this
 * same pooler fine via @prisma/adapter-pg at runtime; this does the same for DDL.
 */
import "dotenv/config";
import { Client } from "pg";

const SQL = `
CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Contact" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  person TEXT NOT NULL,
  title TEXT,
  region TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE TYPE "DealStage" AS ENUM ('DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "Deal" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "contactId" INTEGER NOT NULL REFERENCES "Contact"(id) ON DELETE CASCADE,
  "valueCents" INTEGER NOT NULL,
  stage "DealStage" NOT NULL DEFAULT 'DISCOVERY',
  note TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Contact_userId_idx" ON "Contact"("userId");
CREATE INDEX IF NOT EXISTS "Deal_userId_idx" ON "Deal"("userId");
CREATE INDEX IF NOT EXISTS "Deal_contactId_idx" ON "Deal"("contactId");
`;

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(SQL);
    console.log("Schema created.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
