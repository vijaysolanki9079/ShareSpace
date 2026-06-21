# Repository Audit Summary

Date: 2026-04-15

This file is an executive summary of the repo scan I performed and the actionable items I created for the project.

---

## What I inspected
- Top-level docs and guides (`AGENTS.md`, `AUDIT_REPORT.md`, `MFA_*` docs).
- `docs/work-updates/` folder (contains Word docs and related work-update files).
- Core API routes: `app/api/analytics/route.ts`, `app/api/donations/route.ts`, `app/api/auth/*` (signup + MFA routes).
- tRPC router: `server/routers/ngo.ts` and repository helpers in `lib/repositories/ngo.ts`.
- MFA implementation: `lib/mfa.ts`, `app/api/auth/mfa/*`, related components in `components/ngo/`.
- DB helpers: `lib/server-db.ts` and Prisma schema `prisma/schema.prisma`.

## Top critical issues (need immediate attention)
- `app/api/analytics/route.ts` exposes donor PII and runs bulk updates with NO authentication/authorization.
- `app/api/donations/route.ts` allows unauthenticated GETs and accepts `donorId` from the client on POST (privilege escalation risk).
- `app/api/auth/signup/route.ts` returns internal error `details` to clients — sensitive information disclosure.
- `server/routers/ngo.ts` exposes verification documents via a `publicProcedure` (PII / KYC documents visible to anyone).

## High-priority fixes suggested (first 24–72 hours)
1. Protect analytics and bulk endpoints: require session + restrict to admin or NGO owners.
2. Require auth for donations GET and always set `donorId` from server session on POST.
3. Remove internal error details from API responses; log full errors server-side only.
4. Turn `getSubmittedDocuments` into a protected procedure and verify requestor is owner or admin.
5. Add basic rate-limiting to public hot endpoints (`search`, analytics) to prevent DoS.

## Additional important issues / improvements
- Add pagination/offset to `findNearbyNGOs` and cap limits (avoid large unbounded queries).
- Tune Postgres pool settings in `lib/server-db.ts` for serverless environments or use PgBouncer.
- Replace leftover merge artifacts (`lib/auth.ts.orig`, `lib/auth.ts.rej`) with a single canonical file.
- Add centralized environment validation at startup (ensure `DATABASE_URL`, `NEXTAUTH_SECRET`, `MFA_ENCRYPTION_KEY` are present).
- Add CORS and secure headers middleware for API routes.
- Replace uses of `any` and strengthen TypeScript types across `lib/*` and server code.
- Add structured security/audit logging (Sentry or similar) for auth/authorization events.

## MFA & what is working (done well)
- MFA is implemented end-to-end: `lib/mfa.ts` implements TOTP/verification and AES-GCM encryption utilities.
- Routes present and integrated: `app/api/auth/mfa/generate-secret`, `verify-setup`, `verify-login`.
- Frontend components exist: `components/ngo/MFAFlowCoordinator.tsx`, `MFAOnboardingWarning.tsx`, `MFASetup.tsx`, `MFAVerification.tsx`.
- Prisma schema contains MFA fields and an `MFAAuditLog` model.
- A verification script is present at `scripts/verification/verify-mfa-setup.mjs`.

## Files placed in `docs/work-updates`
- This summary: `docs/work-updates/REPO_AUDIT_SUMMARY.md`
- Existing binary docs in `docs/work-updates/`: `FullStack_Project_Checklist_Updated.docx`, `work_update1.docx`  (these are intentionally left as docx).

## Recommended next steps (pick one)
- Option A (security-first): I can open a PR that (1) requires auth on analytics/donations, (2) removes error `details` exposures, and (3) enforces `donorId` from session. — estimated 2–4 hours.
- Option B (maintenance): Remove `.orig`/`.rej` files, add env validation, and add a simple rate-limiter middleware. — estimated 1–2 hours.
- Option C (tests): Add API integration tests for signup, donations, and analytics to CI.

---

If you want, I can implement Option A now and push the fixes; tell me which option to proceed with and I will create the PR and run tests.
