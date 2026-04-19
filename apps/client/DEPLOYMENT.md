# Frontend Deployment Guide

## Vercel Setup (No Docker)
1. Push `sho-hatha-client` to GitHub.
2. Create a new Vercel project and import the repo.
3. Vercel auto-detects Vite settings.
4. Add environment variable:
   - `VITE_API_URL=https://your-backend.railway.app`
5. Deploy.

## SPA Routing
This repo includes `vercel.json` with a rewrite rule to route all paths to `index.html`, so refreshing `/game` or `/results` does not return 404.

## Verify
1. Open the deployed app URL.
2. Complete a full game flow: setup -> categories -> game -> results.
3. Confirm there are no failed API requests in browser devtools.
4. Refresh on `/game` and ensure the app still loads.

## Troubleshooting
- CORS errors: set backend `CORS_ORIGIN` to the exact Vercel URL (no trailing slash).
- API not reachable: confirm `VITE_API_URL` points to Railway HTTPS URL.
- Build failure: check Vercel logs for TypeScript/lint issues.
