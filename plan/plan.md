# Production plan — USG Allocation System

## 1. Architecture

**Railway services (single project):**
- `api` — backend HTTP service
- `worker` — cron/jobs (daily public snapshot refresh, notifications)
- `postgres` — Railway managed Postgres
- *(optional)* `web` — frontend, or host frontend on Vercel

**Stack recommendation:**
- Backend: **Node.js + TypeScript + Fastify** (or NestJS if you want more structure), Prisma for DB
- DB: **Postgres** (Railway managed)
- Auth: **Clerk** or **Auth0** free tier with email allowlist; upgrade path to UChicago SSO (Shibboleth/SAML) later
- Frontend: **Next.js** (single app serves both internal UI and public site via route groups)

Rationale: one language across stack, Prisma gives you migrations + type-safe queries + easy audit hooks, Next.js lets the public site reuse components and deploy as one unit.

## 2. Environments

- **local** — docker-compose Postgres, seeded fixtures
- **staging** — Railway environment, real data shape, separate DB
- **production** — Railway environment, locked deploys from `main`

Railway's "environments" feature handles the staging/prod split cleanly.

## 3. Data model (first pass)

Core tables: `users`, `roles`, `committees`, `rso_categories`, `rsos`, `allocation_requests`, `allocation_records`, `allocation_record_versions`, `audit_logs`, `published_snapshot`, `notifications`.

Key decisions:
- **Versioning**: every edit writes a row to `allocation_record_versions`; `allocation_records` holds current state
- **Publication isolation**: `published_snapshot` is a separate table the public API reads from — never joined against working records
- **Audit**: Prisma middleware auto-writes `audit_logs` on every mutation (who, what, when, before/after)

## 4. Auth & RBAC

- Role enum: `viewer`, `committee_member`, `committee_chair`, `cli_advisor`, `cc_rep`, `cc_chair`, `vpso`, `president`, `evp`
- Committee-scoped roles carry a `committee_id`
- Middleware enforces: route-level role check + row-level filter by committee where applicable
- Workflow state machine enforced in service layer, not routes

## 5. Publication pipeline

1. VPSO clicks "Publish" on approved records
2. Transaction: copy approved records → `published_snapshot_staging`
3. Daily Railway cron job (or immediate on publish) swaps staging → `published_snapshot`
4. Public API reads only from `published_snapshot`

## 6. Build phases (rough sequencing toward spring quarter)

1. **Foundation** — Railway project, repo, CI, Prisma schema, auth, role seed
2. **Core CRUD** — RSOs, committees, allocation records
3. **Workflow & permissions** — state machine, role gates, committee scoping
4. **Audit & versioning** — middleware, history UI
5. **CSV import/export** — bulk upload, validation, dry-run preview
6. **Publication + public read API** — snapshot pipeline, daily cron
7. **Public frontend** — search, filters, charts, downloads
8. **Hardening** — backups, error monitoring (Sentry free), docs for handoff

## 7. Cost estimate (annual, within $3k)

- Railway Pro: ~$20/mo + usage (~$30–50/mo realistic) → **~$600/yr**
- Clerk/Auth0 free tier → **$0**
- Domain + Cloudflare → **~$20/yr**
- Sentry free tier → **$0**
- Buffer for overages, email (Resend/Postmark), backups → **~$300**

Leaves headroom for a paid SSO upgrade if UChicago requires Shibboleth.

## 8. Open questions before building

1. Does UChicago require Shibboleth/CNetID SSO from day one, or is email allowlist acceptable for the first cohort?
2. Is the frontend in scope for this build, or backend + API only?
3. Who owns the Railway account and domain — USG org account or a specific officer? (Matters for the "Nevin problem" — needs to be org-owned.)
4. Backup/DR expectations — is Railway's daily backup enough, or do you want offsite exports?
