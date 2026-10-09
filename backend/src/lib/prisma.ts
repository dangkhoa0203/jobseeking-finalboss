import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "../config";

// One client per process, reused across requests — the standard Prisma pattern (avoids
// exhausting the DB connection pool by creating a new client per request). Prisma 7 requires
// an explicit driver adapter rather than reading the connection string from schema.prisma.
const adapter = new PrismaPg({ connectionString: config.databaseUrl() });
export const prisma = new PrismaClient({ adapter });
