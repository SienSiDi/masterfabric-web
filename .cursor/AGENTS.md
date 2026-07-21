# MasterFabric Web — Agent Guide

Single-page Next.js 16 (App Router) SPA. 3 master views switched by URL state.
Backend is the live Go API at `https://mf-masterfabric-backend.onrender.com` (20 EP, deployed Day 09).

> ⚠️ **Next.js 16 breaking changes**: This is NOT the Next.js you know. Read `node_modules/next/dist/docs/` before writing code. `useSearchParams` must be wrapped in `<Suspense>`.

## Layout

```
src/
├── app/
│   ├── layout.tsx              # root layout + QueryProvider + Toaster
│   ├── page.tsx                # single route; Suspense + ViewSwitcher reads ?view&?sub
│   └── globals.css             # Tailwind v4 + shadcn theme (oklch vars)
├── components/
│   ├── auth/AuthCard.tsx       # MV1: LoginForm, RegisterForm, ForgotPasswordForm
│   ├── app/
│   │   ├── AppShell.tsx        # MV2: topbar + left nav + content area
│   │   ├── Dashboard.tsx       # stat cards + latency + tokens + byModel
│   │   ├── Sessions.tsx        # table (admin) or empty CTA (user)
│   │   ├── Monitoring.tsx      # recharts charts, admin-only
│   │   └── Settings.tsx        # profile edit, change password, sessions list
│   ├── llm/LlmView.tsx         # MV3: WebLLM + Gemma (Day 12)
│   ├── providers/QueryProvider.tsx  # TanStack React Query client
│   └── ui/                     # shadcn primitives (base-ui, not radix)
├── hooks/
│   ├── useMe.ts                # GET /me query
│   ├── useMonitoring.ts        # GET /llm/monitoring query (admin-only)
│   └── useSessions.ts          # GET /me/sessions query
├── lib/
│   ├── config.ts               # API_BASE_URL
│   ├── view-router.ts          # ?view=auth|app|llm&sub=... parser (typed)
│   └── api/
│       ├── http.ts             # fetch wrapper: Bearer + refresh-on-401 + retry-once
│       ├── auth.ts             # register/login/refresh/logout/me/updateMe/changePassword/sessions
│       ├── llm.ts              # models/sessions/events/score/monitoring
│       └── types.ts            # all BE response shapes
└── stores/
    └── useAuthStore.ts         # Zustand: user + tokens, sessionStorage persistence
```

## Conventions

- **View state is URL-driven**: `?view=auth|app|llm&sub=...`. Never use React state for view switching. Use `buildViewUrl(view, sub)` + `router.push()`.
- **Auth store**: Zustand with sessionStorage persistence (`mf_auth_session_v1`). `hydrate()` runs in `useEffect`. Access token in memory; refresh token in sessionStorage (MVP — not httpOnly).
- **HTTP client**: `http.ts` auto-injects `Authorization: Bearer`, on 401 calls `POST /auth/refresh` once, retries, on second 401 clears store.
- **All API functions** return typed responses and throw `HttpError` (with `.status` + `.body`). Forms catch and map to toasts.
- **shadcn/ui** here uses `@base-ui/react` (not radix). Components are copy-paste in `src/components/ui/`.
- **No Server Components do data fetching** — this is a client-rendered SPA. All interactive components have `"use client"`.

## Commands

- `npm run dev` — dev server (Turbopack) on :3000
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint

## Env

- `NEXT_PUBLIC_API_BASE_URL` — backend URL (default: live Render URL)

## Backend contract

20 endpoints under `/api/v1/*` + `/health/*` + `/metrics`. Full spec: `../masterfabric_plan/spec/api_endpoints.md`.
