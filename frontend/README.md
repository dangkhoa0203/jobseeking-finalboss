# Pursuit frontend

React + TypeScript + Vite + Sass. Signal Dark theme — a deliberately single-theme, dark-only
design (see `src/styles/_tokens.scss`).

## Running locally

Requires Node 22+ and pnpm (`corepack enable`). The backend must be running first (see
`../backend/README.md`).

```bash
pnpm install
pnpm approve-builds --all   # first run only
pnpm install

cp .env.example .env.local  # VITE_API_BASE defaults to http://localhost:4000
pnpm dev                    # http://localhost:5173
```

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` | Type-check + production build to `dist/` |
| `pnpm test` | Vitest |
| `pnpm preview` | Serve the production build locally |

## Structure

- `src/api/` — typed fetch client and shared types
- `src/context/AuthContext.tsx` — JWT auth state (login/register/logout, persisted to
  `localStorage`)
- `src/pages/` — Login, Register, Dashboard
- `src/components/` — StatsRow, PipelineBoard, DealCard, NewDealModal
