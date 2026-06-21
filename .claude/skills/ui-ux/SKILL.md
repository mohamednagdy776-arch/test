---
name: ui-ux
description: UI/UX design quality rules for Tayyibt web app — accessibility, touch targets, RTL layout, forms, navigation, animation, color, typography. Read before designing new pages, creating/refactoring components, choosing colors or layouts, or reviewing UI code for quality. Source: nextlevelbuilder/ui-ux-pro-max-skill (adapted for Next.js 14 + Tailwind + Arabic RTL).
---

# UI/UX — Tayyibt Design Rules

Source: [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) — adapted for Next.js 14, Tailwind CSS, Arabic RTL, emerald palette.

## When to read this skill
- Designing new pages or layouts
- Creating/refactoring components (buttons, modals, forms, cards, tables)
- Choosing colors, fonts, spacing, or animations
- Reviewing UI code for quality, accessibility, or responsiveness
- Any change that affects how a feature **looks, feels, or is interacted with**

**Skip for**: pure backend logic, API/DB design, infrastructure, non-visual scripts.

---

## Priority 1 — Accessibility (CRITICAL)

- **Contrast**: minimum 4.5:1 for body text, 3:1 for large text (≥18px or bold ≥14px)
- **Focus rings**: visible on all interactive elements — never `outline: none` without a replacement
- **ARIA labels**: every icon-only button needs `aria-label`; toggles need `role="switch" aria-checked`
- **Alt text**: meaningful alt for images; `alt=""` for decorative
- **Heading order**: h1→h2→h3 — no skipping levels
- **Color alone**: never convey meaning with color only — add icon or text
- **Keyboard nav**: tab order matches visual order; all interactive elements reachable by keyboard
- **Reduced motion**: wrap animations in `@media (prefers-reduced-motion: reduce)`

## Priority 2 — Touch & Interaction (CRITICAL)

- **Touch targets**: minimum 44×44px for all tap targets; extend hit area if needed
- **Spacing**: at least 8px gap between adjacent tappable elements
- **Loading states**: disable buttons during async operations, show spinner — never silent freeze
- **Hover-only**: never make a feature accessible only via hover; use click/tap as primary
- **cursor-pointer**: add to all non-`<button>` clickable elements

## Priority 3 — Layout & Responsive (HIGH)

- **Mobile-first**: write mobile styles first, scale up with `sm:` / `md:` / `lg:`
- **Grids**: always `grid-cols-1 sm:grid-cols-N` — never bare `grid-cols-N` on mobile
- **Max width**: `max-w-2xl` for content columns, `max-w-4xl` for wider layouts
- **No horizontal scroll**: content must fit viewport — use `overflow-hidden` on wrappers
- **Spacing scale**: use Tailwind's 4-unit scale (p-4, gap-4, space-y-4); avoid arbitrary values

## Priority 4 — RTL (Arabic) — Tayyibt-specific

- **Direction**: `dir="rtl"` on root; text is naturally right-aligned
- **Chat bubbles**: own messages `justify-end` (right), other's `justify-start` (left)
- **Rounded corners**: own bubble `rounded-tl-sm`, other's `rounded-tr-sm`
- **Margins**: use `mr-*` (not `ml-*`) for spacing relative to the right anchor in RTL
- **Icons that indicate direction** (arrows, chevrons): flip with `scale-x-[-1]` or `rotate-180` for RTL
- **Numbers**: use Arabic-Indic numerals or `toLocaleString('ar-SA')` for displayed numbers
- **Date formatting**: `new Date(x).toLocaleDateString('ar-SA', {...})`

## Priority 5 — Tayyibt Color Palette

### App pages (`(main)/`)
```
Primary:     #10B981  emerald-500
Dark:        #059669  emerald-600
Heading:     #065F46  emerald-900
Border/tint: #DCFCE7  emerald-100
Card bg:     from-[#ECFDF5] to-[#F0FDF4]  (gradient)
Warm bg:     #FFFBEB  amber-50
```

### Auth pages (`(auth)/`)
```
Navy:   #213448    Slate:  #547792
Steel:  #94B4C1    Sand:   #EAE0CF    Cream:  #FDFAF5
```

**Rules**:
- Use emerald palette in app; navy/slate only in auth
- Never use raw hex in components — always use CSS classes
- Destructive actions: `text-red-500 border-red-200 hover:bg-red-50`
- Success states: emerald; Warning: `amber-*`

## Priority 6 — Typography (MEDIUM)

- **Body min**: 14px (`text-sm`), never smaller for readable content
- **Line height**: 1.5–1.75 (`leading-relaxed` or `leading-loose`)
- **Hierarchy**: bold headings `font-bold text-[#065F46]`, muted descriptions `text-sm text-[#10B981]`
- **Truncation**: use `line-clamp-2` not `truncate` for multi-line; provide tooltip for full text
- **Font**: Tayyibt uses system Arabic fonts — ensure `font-family` cascade includes Arabic-supporting fonts

## Priority 7 — Animation (MEDIUM)

- **Duration**: 150–300ms micro-interactions; transitions `≤400ms`
- **Properties**: animate only `transform` / `opacity` — never `width` / `height` / `top` / `left`
- **Easing**: `ease-out` for entering, `ease-in` for exiting; never `linear` for UI
- **Loading**: skeleton shimmer (`animate-pulse`) for >300ms operations — not raw spinners for full layouts
- **Motion**: respect `prefers-reduced-motion` — wrap non-essential animations

## Priority 8 — Forms & Feedback (MEDIUM)

- **Labels**: always use `<label htmlFor>` — never placeholder-only
- **Error placement**: show error message directly below the failing field
- **Submit state**: disable the button + show loading spinner during submit
- **Required fields**: mark with `<span className="text-red-400">*</span>`
- **Password fields**: always provide show/hide toggle (👁/🙈 or SVG icon)
- **Modals over confirm()**: NEVER use `window.confirm()` or `window.alert()` — use `<Modal>` component
- **Toasts**: use `useToast()` for success/error feedback; auto-dismiss after 3–5s
- **Empty states**: use `<EmptyState>` component (icon, title, description, optional action)

## Priority 9 — Navigation (HIGH)

- **Back behavior**: use `document.referrer` origin check before `router.back()` — fallback to list page
- **Deep links**: all key pages must be URL-addressable
- **Active state**: highlight current nav item visually
- **Modal vs navigation**: don't use Modal for primary navigation flows

## Priority 10 — Component Checklist

Before shipping a new component:
- [ ] Works on 375px mobile (iPhone SE)
- [ ] No horizontal scroll introduced
- [ ] Keyboard accessible (Tab, Enter, Escape on Modal)
- [ ] Has loading + error + empty states
- [ ] Uses `<Modal>` not `confirm()`; uses `useToast()` not `alert()`
- [ ] Arabic text readable; RTL layout correct
- [ ] Passes contrast check on emerald card backgrounds
