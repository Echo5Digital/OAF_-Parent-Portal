# Open Arms — Backend (Phase Two, first slice)

Serverless backend for the Foster Care Management Platform: AWS Lambda + API Gateway, PostgreSQL, Cognito auth. See `../infra/` for the Terraform that provisions this — **not applied to any AWS account yet**, by design (see project memory: architecture decisions, 2026-10-12).

## Scope of this slice

Proves the hardest requirement end-to-end: a foster parent logs in, sees their assigned children, and edits each child's 7-day weekly log independently with server-enforced access control and compliance calculation. Also includes a first real Staff Dashboard endpoint (counts + recent submissions). Deliberately out of scope for this pass: respite caregiver accounts, therapist review/sign-off UI, correction workflow UI (the table exists, nothing writes to it from the frontend yet), AI reporting, and the rest of the staff-side pages (Parents/Children/Forms/Reviews/Reports/Settings — only the Dashboard itself is wired). The schema (`db/migrations/001_init.sql`) already has tables for those (`correction_requests`, `therapist_signed_*`, `placements.placement_type = 'respite'`) so this doesn't need a rework later — only new handlers.

## Endpoints in this slice

| Method | Path | Handler | Purpose |
|---|---|---|---|
| GET | `/children` | `getMyChildren` | List the caller's assigned children + current week status |
| GET | `/children/{childId}/weekly-log` | `getWeeklyLog` | Fetch the current week's 7 day entries for one child |
| PUT | `/children/{childId}/weekly-log/days/{dayIndex}` | `saveDailyEntry` | Create/update one day; server recalculates duration + compliance |
| POST | `/children/{childId}/weekly-log/submit` | `submitWeeklyLog` | Parent signs; requires all 7 days complete; moves to `awaiting_therapist_review` |
| GET | `/staff/dashboard` | `getStaffDashboard` | Real stat counts + recent submissions; restricted to staff roles server-side |

All parent-facing handlers verify a Cognito access token, then re-check (in Postgres, not just in the JWT) that the caller's household currently holds an active placement for the requested child — see `src/lib/access.ts`. `getStaffDashboard` instead checks the caller's `role` is one of administrator/management/caseworker/therapist via `requireRole` in `src/lib/auth.ts` — a foster_parent or respite_caregiver token gets a 403, not just a hidden button. This is what makes isolation and staff-only access backend guarantees instead of UI conventions.

## Local development

```bash
cd server
npm install
createdb open_arms_dev   # or point DATABASE_URL at any Postgres instance
psql $DATABASE_URL -f db/migrations/001_init.sql
psql $DATABASE_URL -f db/seed.sql   # synthetic demo data only — never real child records
npm run typecheck
```

Required env vars (see `infra/` for how these get populated in a real deployment):

- `DATABASE_URL` — Postgres connection string
- `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID` — for access-token verification
- `ALLOWED_ORIGIN` — CORS origin for the frontend
