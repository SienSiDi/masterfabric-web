# MasterFabric Web-LLM

Single-page Next.js 16 SPA for the MasterFabric Web-LLM stack. Runs **Gemma in the browser** via WebLLM, reports every inference to the Go backend for **raw LLM monitoring + decision scoring**.

**Backend (live):** https://mf-masterfabric-backend.onrender.com — 20 endpoints, deployed Day 09.

## Status

| Day | View | Status |
|-----|------|--------|
| 10 | MV1 Auth (login/register/forgot-password) + scaffold | ✅ done |
| 11 | MV2 Subviews (dashboard/sessions/monitoring/settings) | ⏳ next |
| 12 | MV3 Web LLM (WebLLM + Gemma loader + chat + event submit) | pending |
| 13 | Vercel deploy + event submission loop | pending |

## Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5
- Tailwind CSS v4 + shadcn/ui (`@base-ui/react`)
- Zustand (auth store, sessionStorage persistence)
- `@mlc-ai/web-llm` (Day 12 — in-browser Gemma)

## Develop

```bash
npm install
npm run dev    # http://localhost:3000
```

Env (see `.env.example`):

```
NEXT_PUBLIC_API_BASE_URL=https://mf-masterfabric-backend.onrender.com
```

## Architecture

Single route (`/`) with URL-driven view state: `?view=auth|app|llm&sub=...`.

```
src/
├── app/            # layout + single page (Suspense + ViewSwitcher)
├── components/
│   ├── auth/       # MV1 — AuthCard, LoginForm, RegisterForm, ForgotPasswordForm
│   ├── app/        # MV2 — AppShell (Day 11 fills subviews)
│   ├── llm/        # MV3 — LlmView (Day 12 adds WebLLM)
│   └── ui/         # shadcn primitives
├── lib/
│   ├── config.ts
│   ├── view-router.ts
│   └── api/        # http.ts (refresh-on-401), auth.ts, llm.ts, types.ts
└── stores/
    └── useAuthStore.ts
```

See [`.cursor/AGENTS.md`](./.cursor/AGENTS.md) for full conventions.

## Backend endpoints used

| Day | EPs |
|-----|-----|
| 10 | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /me` (5/20) |
| 11 | + `GET /me/sessions`, `GET /llm/monitoring`, `GET/PUT /config` |
| 12 | + `GET /llm/models`, `POST /llm/sessions`, `POST /llm/sessions/{id}/events`, `POST /llm/sessions/{id}/score` |
