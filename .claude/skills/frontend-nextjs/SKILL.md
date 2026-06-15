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
- Primary: **emerald green `#10B981`**; secondary: **gold `#F59E0B`**; clean white background with warm tones; dark charcoal text.
- Mobile-first responsive, generous whitespace, clear hierarchy, consistent spacing.
- **Arabic / RTL support** is required — handle direction and bidi text correctly.
- Cultural fit: modest, family-friendly, privacy-conscious profile UIs.
- Accessibility: aim for WCAG compliance (labels, contrast, keyboard nav).

## Output locations
- Components: `web/src/components/`, `web/src/features/*/components/`
- Admin lives under `admin/`.

## Verify
- Run the relevant app's `npm run lint` and `npm run build`; check rendering at the target breakpoints before declaring done.
