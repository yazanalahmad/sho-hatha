# Sho Hatha? Backend

TypeScript/Express backend for a bilingual trivia game. The service stores categories and questions in PostgreSQL, exposes public endpoints for game setup, and provides admin-only CRUD endpoints for content management.

## Stack

- Node.js 20+
- Express 5
- TypeScript
- Prisma ORM
- PostgreSQL / Supabase
- Zod
- Pino
- Vitest + Supertest

## Features

- Public API for health checks, app config, category browsing, and randomized game-pack generation
- Admin API for creating, updating, toggling, and soft-deleting categories and questions
- Seed-based content workflow using JSON files committed in the repo
- Structured validation and consistent JSON error responses
- Basic hardening with Helmet, CORS, request IDs, and rate limiting

## Project Structure

```text
src/
  config/         runtime config, logger, Prisma client
  lib/            shared error helpers
  middleware/     auth, rate limit, request id, error handling
  modules/        route/controller/service logic by feature
  tests/          API and unit tests
prisma/           schema, migrations, seed script
data/             seed data for categories and questions
```

## Getting Started

1. Install dependencies:
   `npm install`
2. Copy the example environment file:
   `cp .env.example .env`
3. Set `DATABASE_URL`.
   For local IPv4-only environments such as many WSL setups, use the Supabase `Session pooler` connection string from `Connect -> ORMs -> Prisma`.
4. Set a strong `ADMIN_API_TOKEN`.
5. Generate the Prisma client:
   `npm run db:generate`
6. Apply migrations:
   `npm run db:migrate`
7. Seed the database:
   `npm run db:seed`
8. Start the API:
   `npm run dev`

Health check:

```bash
curl http://localhost:3001/health
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NODE_ENV` | yes | `development`, `test`, or `production` |
| `PORT` | yes | HTTP port for the API |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `CORS_ORIGIN` | yes | Allowed frontend origin |
| `ADMIN_API_TOKEN` | yes | Shared secret for `/api/admin/*` routes |
| `QUESTIONS_PER_GAME` | yes | Number of questions returned by pack generation |
| `CATEGORIES_TO_DISPLAY` | yes | Public config value for the frontend |
| `CATEGORIES_PER_TEAM` | yes | Categories each team must pick |
| `LOG_LEVEL` | yes | `debug`, `info`, `warn`, or `error` |

Supabase note:

- `db.<project-ref>.supabase.co:5432` is the direct host and commonly requires IPv6.
- On IPv4-only machines, prefer the Supabase `Session pooler` URL on port `5432`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with file watching |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm test` | Run the test suite |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks without emitting files |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run Prisma development migrations |
| `npm run db:migrate:deploy` | Apply migrations in deployment environments |
| `npm run db:seed` | Seed categories and questions |
| `npm run db:studio` | Open Prisma Studio |

## API Overview

### Public Routes

- `GET /health`
- `GET /api/config`
- `GET /api/categories`
- `GET /api/categories/random?count=6`
- `POST /api/game-packs/generate`
- `POST /api/game-packs/generate-board`

Example game pack request:

```json
{
  "team1CategoryIds": ["uuid-1", "uuid-2", "uuid-3"],
  "team2CategoryIds": ["uuid-4", "uuid-5", "uuid-6"]
}
```

### Admin Routes

All admin routes require the `x-admin-token` header.

- `GET /api/admin/questions`
- `GET /api/admin/questions/:id`
- `POST /api/admin/questions`
- `PUT /api/admin/questions/:id`
- `PATCH /api/admin/questions/:id/toggle-active`
- `DELETE /api/admin/questions/:id`
- `GET /api/admin/categories`
- `GET /api/admin/categories/:id`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `PATCH /api/admin/categories/:id/toggle-active`
- `DELETE /api/admin/categories/:id`

### Error Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

## Content Workflow

Game content lives in:

- `data/categories.seed.json`
- `data/questions.seed.json`

This keeps the project portable and makes content changes reviewable in pull requests.

For a fresh database:

```bash
npm run db:migrate:deploy
npm run db:seed
```

## Verification

Run these before opening a PR or pushing to a public branch:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Security Notes

- Never commit `.env`.
- Rotate any real database password or admin token that has ever been shared outside your machine.
- Use a strong random value for `ADMIN_API_TOKEN`.
- Review CORS configuration before production deployment.
- Admin authentication is a single shared token, which is acceptable for an MVP but not a long-term auth model.

## Deployment

Deployment notes for Supabase and Railway are in [DEPLOYMENT.md](./DEPLOYMENT.md).

## Status

This is an MVP backend intended for a controlled client application. The API is tested and structured for extension, but the admin authentication model is intentionally simple and should be upgraded before broader multi-user use.
