# Sho Hatha

Sho Hatha is a small bilingual trivia game project with a React frontend and a TypeScript/Express backend in one repo.

`Sho Hatha?` (`شو هاظ؟`) is a Levantine Arabic expression that roughly means “What is this?” or “What’s that?”. The name felt right for a light trivia game.

## Repo Layout

```text
apps/
  client/   frontend
  server/   backend
.github/
  workflows/
```

## Stack

- React 19 + Vite + TypeScript
- Express 5 + Prisma
- PostgreSQL / Supabase
- Zod
- Vitest
- pnpm workspaces

## Quick Start

1. Enable the pinned package manager:
   `corepack enable`
2. Install dependencies from the repo root:
   `pnpm install`
3. Create `apps/client/.env` and `apps/server/.env` using the values in `.env.example`.
4. Update `apps/server/.env` with your Supabase connection string and admin token.
5. Generate the Prisma client:
   `pnpm db:generate`
6. Run migrations:
   `pnpm db:migrate`
7. Seed the database:
   `pnpm db:seed`
8. Start both apps:
   `pnpm dev`

Local URLs:

- Client: `http://localhost:5173`
- Server: `http://localhost:3001`

## Workspace Scripts

- `pnpm dev` runs client and server together
- `pnpm dev:client` runs only the frontend
- `pnpm dev:server` runs only the backend
- `pnpm lint` runs lint checks across both apps
- `pnpm typecheck` runs TypeScript checks across both apps
- `pnpm test` runs both test suites
- `pnpm build` builds both apps
- `pnpm db:generate` runs Prisma generation for the server
- `pnpm db:migrate` runs server database migrations
- `pnpm db:seed` seeds server data

## App Docs

- Frontend: [apps/client/README.md](./apps/client/README.md)
- Backend: [apps/server/README.md](./apps/server/README.md)
- Backend deployment: [apps/server/DEPLOYMENT.md](./apps/server/DEPLOYMENT.md)
- Frontend deployment: [apps/client/DEPLOYMENT.md](./apps/client/DEPLOYMENT.md)

## Verification

Run these from the repo root before pushing:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Notes

- Use the direct Supabase PostgreSQL URL with `sslmode=require`.
- The admin API uses a shared token, which is fine for this project but not a full admin/auth system.
