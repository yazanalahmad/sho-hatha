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

- React 18 + Vite + TypeScript
- Express 5 + Prisma
- PostgreSQL / Supabase
- Zod
- Vitest
- npm workspaces

## Quick Start

1. Install dependencies from the repo root:
   `npm install`
2. Copy env files:
   `cp apps/client/.env.example apps/client/.env`
   `cp apps/server/.env.example apps/server/.env`
3. Update `apps/server/.env` with your Supabase connection string and admin token.
4. Generate the Prisma client:
   `npm run db:generate`
5. Run migrations:
   `npm run db:migrate`
6. Seed the database:
   `npm run db:seed`
7. Start both apps:
   `npm run dev`

Local URLs:

- Client: `http://localhost:5173`
- Server: `http://localhost:3001`

## Workspace Scripts

- `npm run dev` runs client and server together
- `npm run dev:client` runs only the frontend
- `npm run dev:server` runs only the backend
- `npm run lint` runs lint checks across both apps
- `npm run typecheck` runs TypeScript checks across both apps
- `npm run test` runs both test suites
- `npm run build` builds both apps
- `npm run db:generate` runs Prisma generation for the server
- `npm run db:migrate` runs server database migrations
- `npm run db:seed` seeds server data

## App Docs

- Frontend: [apps/client/README.md](./apps/client/README.md)
- Backend: [apps/server/README.md](./apps/server/README.md)
- Backend deployment: [apps/server/DEPLOYMENT.md](./apps/server/DEPLOYMENT.md)
- Frontend deployment: [apps/client/DEPLOYMENT.md](./apps/client/DEPLOYMENT.md)

## Verification

Run these from the repo root before pushing:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Notes

- Use the Supabase `Session pooler` URL for local environments that do not have IPv6 routing.
- The admin API uses a shared token, which is fine for this project but not a full admin/auth system.
