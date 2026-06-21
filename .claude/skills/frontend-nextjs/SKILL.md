---
name: frontend-nextjs
description: Build the Tayyibt web app and admin dashboard with Next.js, React, TypeScript, and Tailwind CSS. Use when working in web/ or admin/, creating React components/pages, wiring API calls, handling state, or implementing UI/UX.
---

# Frontend (Next.js) — Tayyibt

You are a senior frontend engineer building the Tayyibt user web app (`web/`, port 3002) and admin dashboard (`admin/`, port 3001). Build scalable, performant, accessible interfaces.

## Tech stack
- Framework: **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict)
- Styling: **Tailwind CSS**
- Data fetching / server state: **React Query**; local/UI state via hooks + Context
- HTTP: Axios/Fetch against `http://localhost:3000/api/v1`

## Architecture rules
- Feature-based folder structure. Separate UI, logic, and API calls.
- **Functional components + hooks only** — no class components.
- One component per file; keep components small and reusable. Avoid deep nesting.
- Co-locate API hooks (e.g. `useMatches`) and keep network logic out of presentational components.

## Component pattern
```tsx
const UserCard = ({ user }: { user: User }) => {
  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">{user.name}</h2>
    </div>
  );
};
```

## Design guidelines (Tayyibt brand)
- **Luxury "Emerald Sanctum" palette** — `data-theme="luxury"` on layout root. Always use CSS variables, never raw hex:
  - `var(--primary)` #0A3D2B (deep forest green) · `var(--secondary)` #1A6B4A · `var(--accent)` #B8892A (gold)
  - `var(--background)` #F4EFE4 (parchment) · `var(--card)` #FDFAF3 (pearl ivory) · `var(--foreground)` #0E1912
  - `var(--muted)` #E8E3D8 · `var(--muted-foreground)` #66756A · `var(--border)` #DDD5BF · `var(--ring)` #B8892A
  - Full token list, old→new mapping, card/button/shadow utilities: see `ui-ux/SKILL.md`
- **Auth pages** use navy/slate: `#213448`, `#547792`, `#94B4C1`, `#EAE0CF`, `#FDFAF5` — do NOT mix with luxury.
- **BANNED in `(main)/`**: `bg-white`, `text-gray-*`, `bg-gray-*`, `border-gray-*`, `emerald-*` Tailwind classes, and all old hex codes.
- Tailwind arbitrary CSS vars: `bg-[var(--card)]`, `text-[var(--primary)]`, `border-[var(--border)]`
- Mobile-first responsive. Use `grid-cols-1 sm:grid-cols-N` — **never** bare `grid-cols-N` without responsive override.
- Sidebar: `hidden lg:block` (visible 1024px+). BottomNav: `lg:hidden` (mobile/tablet fixed bar).
- **Arabic / RTL**: own chat messages `justify-end` (right). Bubble corners: own `rounded-tl-sm`, other `rounded-tr-sm`. RTL spacing: `mr-*` not `ml-*`.
- Cultural fit: modest, family-friendly, privacy-conscious profile UIs.
- Accessibility: `role="switch" aria-checked` for toggles; `aria-label` on icon-only buttons.

## Auth
- Uses **HttpOnly cookies** (`access_token`, `refresh_token`, `uid`) — **NOT** localStorage tokens.
- `(main)` route group requires auth; `(auth)` group is public.

## API response shapes
- Paginated lists: `{ success, data: [...], meta: { total, page, limit, totalPages } }`. Access items as `response.data?.data ?? []`.
- Single resources: `{ success, data: {...} }`.
- Send pagination params as `?page=N&limit=N`. Show prev/next controls only when `totalPages > 1`.

## Shared UI components (`web/src/components/ui/`)
- `Modal` — use for **all** confirmation dialogs. Never use native `confirm()` or `alert()`.
- `useToast` — success/error feedback notifications.
- `EmptyState` — consistent empty-list placeholder (icon, title, description, action).
- `Avatar`, `Spinner`, `OfflineBanner` — already available; don't recreate them.

## Output locations
- Components: `web/src/components/`, `web/src/features/*/components/`
- Admin lives under `admin/`.

## Verify
- Run the relevant app's `npm run lint` and `npm run build`; check rendering at the target breakpoints before declaring done.
