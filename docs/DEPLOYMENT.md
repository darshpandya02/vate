# Production Deployment Notes

## Environment variables

- **Backend:** Set all variables from `.env.example` in your hosting environment. Required: `DATABASE_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`. For Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`.
- **Frontend:** Configure `API_URL` and `WS_URL` for production (e.g. `https://api.yourdomain.com/api/v1` and `wss://api.yourdomain.com`).

## Database

1. Provision PostgreSQL 15+.
2. Set `DATABASE_URL`.
3. Run migrations: `npx prisma migrate deploy` (in the backend container or CI/CD).
4. Optionally run seed once: `npm run prisma:seed`.

## Redis

- Required for caching and WebSocket pub/sub when running multiple API instances.
- Set `REDIS_URL` (or `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`).

## Docker

- **Backend:** Build from `backend/Dockerfile`. It runs `prisma migrate deploy` then `node dist/main.js`. Expose port 3000.
- **Frontend:** Build from `frontend/Dockerfile` (multi-stage: build Angular, serve with nginx). Or build Angular and serve static files from your CDN/reverse proxy.
- Use `docker-compose.yml` as reference; in production you may run backend/worker replicas behind a load balancer and use the `nginx` service (or your own reverse proxy) with the `production` profile.

## Nginx / reverse proxy

- Serve frontend static files and proxy `/api/` to the backend.
- Proxy WebSockets: `/ws` to the backend with `Upgrade` and `Connection: upgrade`.
- Example config is in `nginx/nginx.conf` (and `frontend/nginx.conf` for the frontend container).

## CI/CD (GitHub Actions)

- `.github/workflows/ci.yml` runs on push/PR to `main`/`develop`: backend and frontend install, lint, build; backend tests if present.
- For deployment: add a job that builds images, pushes to a registry, and updates your runtime (e.g. Kubernetes, ECS, or a single-node Docker Compose with `docker compose pull && docker compose up -d`).

## SSL

- Terminate TLS at the reverse proxy (Nginx or cloud LB). Set `X-Forwarded-Proto: https` so the app sees the correct scheme.

## Health checks

- Backend: add a `GET /health` that returns 200 if DB (and optionally Redis) are reachable.
- Use the same for your orchestrator’s liveness/readiness probes.
