# api/

Fastify + TypeScript + Prisma backend for the UChicago USG allocation system.

## Setup (Railway — recommended)

```bash
cd api
cp .env.example .env
# Open api/.env and paste the DATABASE_PUBLIC_URL from your Railway Postgres
# service (service → Variables tab) into the DATABASE_URL line.

npm install                   # also runs `prisma generate` via postinstall
npx prisma migrate deploy     # apply existing migrations to the Railway DB
npm run dev                   # Fastify at http://localhost:3000
```

Health check: `curl http://localhost:3000/healthz` → `{"status":"ok","db":"ok"}`.

`npm run dev` uses `tsx watch --env-file=.env`, so `.env` is loaded automatically in dev. In production (Railway deployment), env vars are injected by the platform — no `.env` file involved.

## Setup (offline / local Postgres alternative)

```bash
docker compose up -d                    # from repo root — starts Postgres on :5433
cd api
cp .env.example .env
# In api/.env, set:
#   DATABASE_URL="postgresql://postgres:postgres@localhost:5433/uchicagofinance?schema=public"

npm install
npx prisma migrate dev                  # creates + applies migrations locally
npm run dev
```

## Stopping things

```bash
# stop the API: Ctrl-C in the terminal running `npm run dev`
docker compose down        # stop local Postgres (data persists in the named volume)
docker compose down -v     # stop AND wipe the local database (destructive)
```

## Scripts

- `npm run dev` — Fastify with auto-reload (tsx watch)
- `npm run build` — compile TS → `dist/`
- `npm start` — run compiled `dist/index.js`
- `npm run db:generate` — regenerate Prisma client
- `npm run db:migrate` — create + apply a migration in dev
- `npm run db:deploy` — apply migrations in production (Railway)
- `npm run db:studio` — open Prisma Studio

## Schema state

`prisma/schema.prisma` covers the stable parts of the data model:

- `User`, `UserRole`, `Committee`, `RsoCategory`, `Rso`, `FiscalYear`, `AuditLog`
- Enums: `Role`, `AllocationStatus`, `AllocationType`, `BudgetLineKind`, `AllocationScope`

Deferred pending design decisions (see chat history / planning notes):

- `BudgetLine` (depends on caps-vs-sums question)
- `AllocationRequest`, `AllocationRecord`, `AllocationRecordVersion`
- `PublishedSnapshot`, `PublishedBudgetSnapshot`
- `Notification`

## Railway deployment

This package becomes the `api` service on Railway. `DATABASE_URL` is auto-injected from the linked Postgres service. Build command: `npm run build`. Start command: `npm run db:deploy && npm start`.
