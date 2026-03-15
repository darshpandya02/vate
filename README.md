# Vate – Swipe for Restaurants

A production-ready web application similar to Tinder but for restaurants. Users swipe on restaurants, create private groups, and get real-time notifications when **all** group members like the same restaurant (group match).

## Tech Stack

- **Frontend:** Angular 19, TypeScript, TailwindCSS, NgRx, RxJS, JWT, Socket.IO client, PWA-ready
- **Backend:** NestJS, TypeScript, PostgreSQL, Prisma, Redis, WebSockets (Socket.IO), Swagger, JWT, bcrypt
- **DevOps:** Docker, Docker Compose, GitHub Actions CI/CD, Nginx

## Quick Start (Local)

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for Postgres + Redis)
- npm or yarn

### 1. Clone and env

```bash
cd vate
cp .env.example .env
# Edit .env if needed (defaults work for local)
```

### 2. Start Postgres and Redis

```bash
docker compose up -d postgres redis
```

### 3. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed   # optional: seed users + restaurants + demo group
npm run start:dev
```

API: http://localhost:3000  
Swagger: http://localhost:3000/api/v1/docs  

### 4. Frontend

```bash
cd frontend
npm install
npm start
```

App: http://localhost:4200  

### 5. Run everything with Docker Compose

```bash
docker compose up -d
# Backend: http://localhost:3000
# Frontend: http://localhost:4200 (or via nginx on 80 with production profile)
```

## Project Structure

```
vate/
├── backend/                 # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma    # DB schema
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── common/          # Prisma, Redis, filters
│       ├── modules/
│       │   ├── auth/        # JWT, refresh, Google OAuth, password reset
│       │   ├── users/       # Profile (location, preferences)
│       │   ├── restaurants/ # Deck, filters
│       │   ├── swipes/      # Swipe left/right
│       │   ├── groups/      # Create, join, leave, progress
│       │   ├── matches/     # Group match history + engine
│       │   └── notifications/ # WebSocket gateway
│       ├── app.module.ts
│       └── main.ts
├── frontend/                # Angular SPA
│   └── src/app/
│       ├── core/            # Auth, API, NgRx store, guards, interceptors
│       ├── features/        # auth, swipe, groups, matches, profile
│       └── shared/          # layout/shell
├── nginx/                   # Reverse proxy config
├── .github/workflows/ci.yml
├── docker-compose.yml
└── .env.example
```

## Core Features

- **Auth:** Email/password signup & login, refresh tokens, JWT, Google OAuth (optional), password reset, role-based (user/admin)
- **Profile:** Location, cuisine/dietary preferences, price range, search radius
- **Swiping:** Left = dislike, right = like; history stored; no duplicate swipes; deck filtered by preferences
- **Groups:** Create group, join via invite code, leave, view members and match count
- **Group match:** Match when all members (or configurable threshold) like the same restaurant; stored in `group_matches`; WebSocket event to group; optional celebration in UI
- **Real-time:** WebSocket for match, member join/leave, group progress; Redis pub/sub for horizontal scaling

## API Summary

| Area        | Examples |
|------------|----------|
| Auth       | `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/google`, `POST /auth/password-reset/request` |
| Users      | `GET /users/me`, `PATCH /users/me/profile` |
| Restaurants| `GET /restaurants`, `GET /restaurants/:id` |
| Swipes     | `POST /swipes`, `GET /swipes/history` |
| Groups     | `POST /groups`, `GET /groups/invite/:code`, `POST /groups/join`, `GET /groups/my`, `GET /groups/:id`, `GET /groups/:id/progress` |
| Matches    | `GET /matches/group/:groupId` |

WebSocket path: `/ws`; auth via `auth.token` or `query.token`. Events: `join_group`, `leave_group`; server emits `group_match`, `group_member_joined`, `group_member_left`, `group_progress`.

## Database

- **PostgreSQL** with UUID PKs, `created_at`/`updated_at`, soft deletes where needed.
- **Tables:** `users`, `user_profiles`, `password_resets`, `restaurants`, `swipes`, `groups`, `group_members`, `group_matches`.
- Migrations: `npx prisma migrate deploy` (prod) or `npx prisma migrate dev` (dev).
- Seed: `npm run prisma:seed` (see `prisma/seed.ts`).

## Security

- Rate limiting (Throttler), Helmet, CORS, class-validator on DTOs, parameterized Prisma (no raw SQL), bcrypt, JWT expiry, role guards.

## Testing

- Backend: `cd backend && npm run test` (Jest), `npm run test:e2e` for e2e.
- Frontend: `cd frontend && npm run test` (Karma/Jasmine).
- CI: `.github/workflows/ci.yml` runs backend and frontend lint + build (and tests when present).

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) and [SCALABILITY.md](docs/SCALABILITY.md) for production deployment and scaling (stateless API, Redis pub/sub, DB replicas, caching, optional message queue).

## License

MIT
