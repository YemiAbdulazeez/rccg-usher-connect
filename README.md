# RNUMS Web (rccg-usher-connect)

Frontend for the **RCCG National Ushering Management System (RNUMS)** — a Vite + React + TypeScript single-page app.

## Stack
- Vite + React 18 + TypeScript
- TanStack Router (SPA / browser history) + TanStack Query
- Tailwind CSS v4 + shadcn/ui
- `fetch`-based API client with httpOnly-cookie auth and automatic token refresh on 401

## Prerequisites
- Node 18+
- The RNUMS API running (see `../backend-rccg-usher-connect`)

## Setup
```bash
npm install
cp .env.example .env
```

`.env`:
```
VITE_API_URL=http://localhost:4000/api/v1
```

## Run
```bash
npm run dev       # http://localhost:5173
npm run build     # production build
npm run preview   # serve the build locally
```

> The API must allow this origin via `FRONTEND_ORIGIN` and run with CORS `credentials: true`
> (already configured in the backend). Auth relies on httpOnly cookies, so the app and API must
> share cookies — in production use HTTPS with `COOKIE_SECURE=true` (`SameSite=None`).

## App structure
- `src/routes/` — file-based routes. Public marketing pages + auth (`login`, `register`,
  `forgot-password`, `reset-password`, `onboarding`) and the authenticated `app.*` area.
- `src/lib/api/` — typed API clients (`auth`, `hierarchy`, `profile`, `notifications`,
  `approvals`, `hostel`, `payments`, `idcards`, `admin`).
- `src/lib/auth/AuthProvider.tsx` — global auth context (`useAuth`).
- `src/components/app/` — dashboard shell (sidebar, header) with role/status-aware navigation.

## User flow (MVP)
Register → complete profile (cascading region → province → zone → area → parish + passport/signature)
→ submit → PHU review → RHU review → **approved**. Approved ushers can book hostels, pay via Paystack,
and apply for a digital ID card. Reviewers get an approvals queue; Super Admin gets a full console
(stats, user/reviewer provisioning, hierarchy CRUD, audit logs).

Menu items appear only when the user's status/role permits (e.g. hostel/payments/ID cards unlock
after final approval). Phase 2 modules are intentionally hidden until Phase 2.

## Payments
In **live** Paystack mode the app redirects to Paystack's hosted page and returns to
`/payments/callback` for verification. In **mock** mode (backend `PAYSTACK_MODE=mock`) it verifies
directly for a no-charge dev flow.
