# Deployment
Build with `npm ci && npm run build`. Deploy `apps/web/dist` to Vercel/Netlify
and `apps/api/dist` to a Node host. Configure exact CORS origins, health checks
at `/api/v1/health`, HTTPS, Supabase production redirect URLs, and all backend
secrets in the host’s encrypted environment. Apply migrations before traffic.

## Vercel frontend and Render API

Set `VITE_API_URL` in Vercel to the HTTPS Render origin without a trailing
`/api/v1` (the client normalizes either form). Select Production and Preview,
save, then redeploy the latest commit. Never use a localhost value in a
production or preview deployment.

Set `NODE_ENV=production`, `WEB_URL`, and `CLIENT_URL` in Render. Both URL
variables must contain the exact deployed Vercel origin. Additional exact
origins may be supplied as a comma-separated `CORS_ALLOWED_ORIGINS` value.
Keep Supabase, database, and payment secrets only in Render’s encrypted
environment.

Render commands:

```text
Build Command: npm run build
Start Command: npm start
Health Check Path: /api/v1/health
```

After changing either host’s environment variables, redeploy both services.
