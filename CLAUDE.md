# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Production build
npm run start        # Production server
npx shadcn add <name>  # Add shadcn/ui component
```

Regenerate API client after backend changes:
```bash
npx @hey-api/openapi-ts -i openapi.yaml -o src/lib/api -c @hey-api/client-fetch
```

No test framework is configured.

## Architecture

Next.js 16 App Router + React 19 + TypeScript 5 (strict) + Tailwind CSS 4 + shadcn/ui (New York style).

**All code comments and documentation must be in Chinese.**

### Routing

| Route | Purpose |
|-------|---------|
| `/` | Homepage - article waterfall layout with OAuth callback handling |
| `/profile` | User profile (redirects to home if not logged in) |
| `/publish` | Article publishing with rich text editor + multi-image upload |
| `/auth/callback/[provider]` | OAuth2 callback - redirects to homepage with params |

There is no `/login` route. Login is handled via `LoginDialog` (desktop) and `MobileLoginDrawer` (mobile) components.

### API Layer

Auto-generated from `openapi.yaml` using `@hey-api/openapi-ts`. Generated files live in `src/lib/api/`:
- `sdk.gen.ts` / `types.gen.ts` / `client.gen.ts` - auto-generated, do not edit
- `config.ts` - manual configuration: base URL (`/backend`), auth token setup, re-exports of SDK methods

API calls are proxied via Next.js rewrites: `/backend/:path*` → `API_BASE_URL/:path*` (configured in `next.config.ts`).

Usage pattern:
```typescript
import { listArticles } from "@/lib/api/config";
const { data, error } = await listArticles({ query: { page: 1 } });
```

### State Management

Two React Context providers (wrapped in `src/app/layout.tsx`):
- `AuthProvider` (`src/lib/auth.tsx`) - JWT auth via localStorage (`accessToken`, `refreshToken`), provides `user`, `isAuthenticated`, `login()`, `logout()`
- `ThemeProvider` (`src/lib/theme.tsx`) - light/dark/system theme with CSS variables

No React Query or SWR. Server state is managed via direct API calls.

### Key Architectural Patterns

- **OAuth flow**: Provider redirects → `/auth/callback/[provider]` → redirects to homepage with query params → `OAuthCallbackHandler` component processes login in a popup overlay
- **Image upload**: Images are compressed to JPEG (<2MB), renamed with MD5 hash, uploaded directly to Tencent Cloud COS via `cos-js-sdk-v5` SDK (see `src/lib/cos-upload.ts`)
- **Mobile responsive**: Sidebar hidden on mobile (`hidden md:flex`), bottom nav shown instead (`MobileNav`). Login uses drawer on mobile, dialog on desktop
- **Article waterfall**: CSS `columns` layout, with image preloading via `useImagePreload` hook to prevent layout shifts

## Code Conventions

- Path alias: `@/*` → `src/*`
- Use `type` over `interface`
- Components: PascalCase names, kebab-case filenames
- Use `cn()` from `@/lib/utils` for merging Tailwind classes
- Client components require `"use client"` directive
- Toast notifications via `sonner`: `toast.success()`, `toast.error()`, etc.
- Import order: React/Next.js → third-party → local components → local utils

## Environment Variables

Copy `.env.local.template` to `.env.local`:
- `API_BASE_URL` - Backend API URL (used server-side in next.config.ts rewrites)
- `NEXT_PUBLIC_SITE_ICON_URL` - Site favicon URL

## Known Gotchas

- After regenerating API client with `openapi-ts`, **always check and preserve** manual config in `config.ts` (baseUrl, auth setup)
- `config.ts` function definitions must appear **before** their invocations
- localStorage token keys use camelCase: `accessToken`, not `access_token`
- When adding features, search for existing components first before creating new ones
- After any API changes, verify: build passes, request URLs are correct, Authorization header is present
