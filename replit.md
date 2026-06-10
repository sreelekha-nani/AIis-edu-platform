# ALIS – Adaptive Learning Intelligence System

An AI-powered adaptive educational platform that personalizes learning for students, empowers teachers, informs parents, and gives admins full oversight.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/alis run dev` — run the frontend (dynamic port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Recharts + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `lib/db/src/schema/` — Drizzle table definitions (users, courses, enrollments, live-classes, tests, discussions)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/alis/src/` — React frontend (App.tsx, pages/, components/)

## Demo Accounts

All accounts use password: `password123`

| Role    | Email                  |
|---------|------------------------|
| Admin   | admin@alis.edu         |
| Teacher | sarah@alis.edu         |
| Teacher | michael@alis.edu       |
| Parent  | robert.a@alis.edu      |
| Student | alex@alis.edu          |
| Student | emma@alis.edu          |

## Architecture decisions

- Rule-based AI recommendation engine that analyzes quiz scores, subject performance, attendance, and course completion to generate personalized learning profiles
- Role-based auth via simple token (base64 JWT-like) stored in localStorage; `authMiddleware` decodes on every request
- YouTube videos embedded via iframe using extracted video IDs — no external redirect
- Session state managed through React Context (`AuthProvider`) with localStorage persistence
- Analytics computed on-the-fly from DB aggregates (no separate analytics store)

## Product

ALIS serves four user roles with dedicated dashboards:
- **Students**: course library with YouTube video lessons, AI learning profile, personalized recommendations, online tests with instant results, discussion forum
- **Teachers**: create/edit courses and lessons, schedule live classes, build MCQ tests, view student analytics
- **Parents**: monitor children's progress, view test scores, get AI insights per child
- **Admins**: platform-wide analytics, user management, course oversight

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always rebuild api-server after route changes: `pnpm --filter @workspace/api-server run build`
- Password hashing uses SHA-256 + "alis_salt_2024" (not bcrypt — simple demo auth)
- YouTube video ID is extracted and stored in `youtube_id` column at lesson creation time
- Analytics routes compute data live from DB — no caching

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
