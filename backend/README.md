# Pursuit backend

Express + TypeScript API: auth (bcrypt + JWT, no third-party vendor), contacts, deals, and a
pipeline summary endpoint. Uses Prisma with the `@prisma/adapter-pg` driver adapter
(Prisma 7 requires an explicit adapter rather than a `url` in `schema.prisma`).

## Running locally

Requires Node 22+, pnpm (via `corepack enable`), and a PostgreSQL database.

```bash
pnpm install
pnpm approve-builds --all   # first run only — allows bcrypt/esbuild/prisma native builds
pnpm install                # re-run so the approved builds actually execute

cp .env.example .env        # fill in DATABASE_URL, JWT_SECRET
pnpm exec prisma generate
pnpm exec tsx prisma/push-schema.ts        # creates the tables — see note below
pnpm exec tsx prisma/seed.ts               # optional: demo data

pnpm dev                    # http://localhost:4000
```

### Why `push-schema.ts` instead of `prisma migrate dev` / `prisma db push`

Both of Prisma's own schema-sync commands hang indefinitely against Supabase's transaction-mode
pooler (port 6543) — `migrate dev` needs a shadow database, and `db push` needs an advisory lock
that PgBouncer's transaction pooling doesn't support. The app's actual runtime queries (via
`@prisma/adapter-pg`) work fine through the same pooler; only Prisma's CLI schema-engine doesn't.
`push-schema.ts` creates the tables with a plain `pg` client instead, sidestepping the CLI
entirely. If you change `schema.prisma`, update this script's SQL to match.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` / `pnpm start` | Production build / run |
| `pnpm test` | Vitest |
| `pnpm prisma:generate` | Regenerate the Prisma client after a schema change |
| `pnpm prisma:migrate` | Apply migrations (production — use `prisma migrate dev` locally) |
| `pnpm prisma:seed` | Insert demo data |

## Routes

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | /auth/register | — | Create an account |
| POST | /auth/login | — | Get a JWT |
| GET | /auth/me | Bearer | Current user |
| GET, POST | /api/contacts | Bearer | List / create contacts |
| PATCH, DELETE | /api/contacts/:id | Bearer | Update / remove a contact |
| GET, POST | /api/deals | Bearer | List / create deals |
| GET | /api/deals/summary | Bearer | Pipeline stats (open value, forecast, win rate) |
| PATCH, DELETE | /api/deals/:id | Bearer | Update (e.g. move stage) / remove a deal |
