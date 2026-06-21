<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project Architecture Rules (Mandatory)

This repository follows a hybrid data-access strategy used in professional full-stack systems. All contributors and agents should follow these rules.

### 1) Database Access Pattern

- Use `PrismaClient` for standard CRUD and relational data operations:
	- users, profiles, sessions, posts, donations, requests, and other basic tables
	- schema-driven reads/writes with strong type safety
	- default choice for tRPC procedures and NextAuth callbacks/adapters
- Use `pg` (raw SQL) for advanced/performance-sensitive queries:
	- PostGIS and geographic radius / nearest-neighbor queries
	- complex aggregations, CTE-heavy reports, analytics-style queries
	- optimized bulk operations and hot-path endpoints where Prisma is limiting

### 2) Selection Rule (Prisma vs `pg`)

- Start with Prisma unless there is a clear reason not to.
- Use raw SQL only when one of these is true:
	- requires PostGIS operators/functions or SQL features Prisma cannot express well
	- query plans/performance are measurably better with SQL
	- operation is bulk/high-throughput and Prisma introduces avoidable overhead
- Keep raw SQL isolated behind small repository/service functions; do not spread ad-hoc SQL across routes.

### 3) Safety and Consistency

- Always parameterize SQL in `pg`; never build SQL with string concatenation.
- Reuse shared DB helpers (`lib/server-db.ts`) and environment-based credentials.
- Keep naming/data-shape consistency between Prisma models, SQL aliases, and tRPC outputs.
- Add validation at boundaries (`lib/validation.ts`) before database writes.

### 4) Required Stack Direction

Use this stack as the default project direction unless a task explicitly requires deviation:

- Frontend: Next.js (App Router), Tailwind CSS
- Backend: tRPC + Next.js route handlers/API routes
- Auth: NextAuth.js
- Database: Supabase Postgres + Prisma
- Real-time: Supabase subscriptions
- Storage: Supabase Storage (or Cloudinary where appropriate)
- Maps/Geo UX: Mapbox or Google Maps
- Geo Search: PostGIS in Supabase
- Admin Panel: Retool or Appsmith
- Hosting: Vercel
- Monitoring: Sentry or LogRocket (optional but recommended for production)

This combination is **free-tier friendly** and suitable for portfolio work: type-safe APIs, optional real-time and geo, and a credible admin story (Retool/Appsmith) without committing to paid tiers early.

## Integration Risks to Avoid

These are the most common issues that interrupt delivery in this stack:

- **Self-HTTP to your own API for DB work:** avoid `fetch` from NextAuth or server code to internal `/api/...` routes when the same process can call **Prisma** or **`pg`** directly (fewer hops, fewer env URL bugs, clearer errors). Reserve route handlers for **external** clients or webhooks.
- Dual auth confusion: mixing Supabase Auth and NextAuth session ownership in the same flow.
- RLS mismatches: Supabase Row Level Security policies not aligned with NextAuth user identity.
- Connection exhaustion: serverless cold starts creating too many Postgres connections.
- Drift between Prisma and SQL: migrations evolve schema but raw SQL is not updated.
- Timezone inconsistencies: server, DB, and client formatting disagree on UTC/local handling.
- Inconsistent IDs: mixing UUID/cuid/int patterns across Prisma models and SQL joins.
- Non-idempotent webhooks/jobs: retries creating duplicate writes.
- Heavy real-time channels: broad subscriptions causing noisy updates and higher costs.
- Unbounded map queries: missing bbox/radius limits leading to slow PostGIS scans.
- Large unoptimized assets: image/storage costs and performance regressions in Vercel deployments.
- Missing observability: no structured error tracking for API, tRPC, and background jobs.
- Env fragmentation: different local/staging/prod secrets causing hard-to-reproduce bugs.

## Working Conventions

- Document why raw SQL was chosen when adding a new `pg` query.
- Add at least one test (or query verification script) for every non-trivial SQL path.
- Prefer explicit DTO/return types for tRPC procedures to prevent accidental API shape drift.
- Keep security-first defaults: least-privilege policies, server-only secrets, and validated inputs.
