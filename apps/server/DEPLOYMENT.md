# Backend Deployment Guide

## Supabase Setup
1. Create a project on Supabase.
2. Open `Connect -> ORMs -> Prisma`.
3. For environments without IPv6, copy the `Session pooler` connection string and use it as `DATABASE_URL`.
4. Only use the direct `db.<project-ref>.supabase.co:5432` URI when the runtime has IPv6 connectivity.

## Railway Setup (No Docker)
1. Push `sho-hatha-backend` to GitHub.
2. Create a Railway project and connect the repo.
3. Configure environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=<supabase-uri>`
   - `CORS_ORIGIN=https://your-frontend.vercel.app`
   - `ADMIN_API_TOKEN=<openssl rand -base64 32>`
   - `QUESTIONS_PER_GAME=18`
   - `CATEGORIES_TO_DISPLAY=6`
   - `CATEGORIES_PER_TEAM=3`
   - `LOG_LEVEL=info`
4. Build command:
   - `npm ci && npx prisma generate && npm run build`
5. Start command:
   - `npx prisma migrate deploy && npm start`

## Seed Production Data (Run Once)
```bash
DATABASE_URL=<production_database_url> npm run db:seed
```

## Verify
```bash
curl https://your-backend.railway.app/health
curl https://your-backend.railway.app/api/config
```

## Troubleshooting
- Migration errors: verify `DATABASE_URL` uses `postgresql://` format.
- `Can't reach database server at db.<project-ref>.supabase.co:5432`: your environment likely does not have IPv6 routing. Switch `DATABASE_URL` to the Supabase `Session pooler` URL.
- CORS errors: match `CORS_ORIGIN` exactly to frontend URL.
- Runtime 500: inspect Railway logs.
- Seed issues: run migrations first, then seed.
