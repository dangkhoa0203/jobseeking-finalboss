# Pursuit

A lightweight client-pipeline CRM — contacts, deals, pipeline stages, and a forecast
dashboard for account teams. Built as a second portfolio project alongside
[Trading Simulator](https://github.com/dangkhoa0203/trading-simulator), deliberately in a
different stack: React/TypeScript/Sass on the frontend, Node/Express/TypeScript on the
backend, with hand-rolled auth (bcrypt + JWT) rather than a third-party provider.

## Stack

- **Frontend**: React, TypeScript, Vite, Sass
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Auth**: bcrypt password hashing + JWT, issued and verified by this backend — no Auth0/
  third-party vendor
- **Database**: PostgreSQL (Supabase)
- **Hosting**: Render (backend), GitHub Pages (frontend)

## Package manager: pnpm, not npm

This repo uses **pnpm**, not npm — `npm@11.6.2` on Node 24 was observed silently failing to
extract newly-added packages to `node_modules` (reporting success while writing nothing to
disk; confirmed via npm's own debug log showing an empty reify diff). pnpm installs
correctly in the same environment. Use `pnpm install`, not `npm install`.

```bash
corepack enable
cd backend && pnpm install && pnpm approve-builds --all && pnpm install
```

## Demo data

Seed data uses real company names (pulled from Wikidata's public SPARQL endpoint, CC0
licensed) with invented contacts and deal details — see `backend/prisma/seed.ts`.

## Structure

```
backend/   Express API — auth, contacts, deals, pipeline summary
frontend/  React dashboard (Signal Dark theme)
```

See `backend/README.md` and `frontend/README.md` for service-specific run instructions.
