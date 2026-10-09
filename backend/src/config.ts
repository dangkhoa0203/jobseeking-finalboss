function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  corsOrigin: process.env.CORS_ORIGIN || "",
  databaseUrl: () => required("DATABASE_URL"),
};
