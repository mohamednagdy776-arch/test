---
name: ui-ux
description: UI/UX design quality rules for Tayyibt web app — luxury Emerald Sanctum palette, CSS variables, RTL layout, accessibility, touch targets, forms, navigation, animation, typography. Read before designing new pages, creating/refactoring components, choosing colors or layouts, or reviewing UI code for quality.
---

# UI/UX — Tayyibt Design System

## When to read this skill
- Designing new pages or layouts
- Creating/refactoring components (buttons, modals, forms, cards, nav)
- Choosing colors, fonts, spacing, or shadows
- Reviewing UI code for quality, accessibility, or responsiveness
- Any change that affects how a feature **looks, feels, or is interacted with**

**Skip for**: pure backend logic, API/DB design, infrastructure, non-visual scripts.

---

## 1 — Design Theme: Luxury "Emerald Sanctum"

The app uses a **single luxury theme** applied via `data-theme="luxury"` on the root layout div in `web/src/app/(main)/layout.tsx`. All CSS variables are defined in `web/src/app/globals.css` under `[data-theme="luxury"]`.

### CSS Variables — always use these, never hardcode hex

```
--primary:            #0A3D2B   deep forest green   (headings, primary buttons, icons)
--primary-hover:      #0D4E37   hover state for primary
--primary-foreground: #F4EFE4   text on primary bg
--secondary:          #1A6B4A   emerald mid-tone (gradient end, secondary actions)
--accent:             #B8892A   antique gold       (active states, highlights, badges)
--accent-foreground:  #FDFAF3   text on accent bg
--background:         #F4EFE4   warm parchment     (page background)
--foreground:         #0E1912   ink charcoal       (all body text)
--card:               #FDFAF3   pearl ivory        (card surfaces, inputs, modals)
--card-foreground:    #0E1912
--muted:              #E8E3D8   warm muted         (subtle backgrounds, badges, skeletons)
--muted-foreground:   #66756A   sage mist          (secondary/placeholder text)
--border:             #DDD5BF   parchment border
--ring:               #B8892A   gold focus ring
--destructive:        #A03030   deep red
--destructive-foreground: #FDF8F0
--input:              #DDD5BF
```

### Sidebar-specific variables (dark forest panel)
```
--sidebar-bg:         #091F16   very dark forest
--sidebar-fg:         #7DAC8D   muted sage (inactive nav)
--sidebar-active-fg:  #E8C57A   warm gold (active nav)
--sidebar-active-bg:  rgba(184,137,42,0.15)
--sidebar-hover-bg:   rgba(255,255,255,0.05)
--sidebar-border:     rgba(255,255,255,0.07)
--sidebar-label:      #3E6B50
```

### Auth pages (`(auth)/`) — different palette, do NOT mix
```
Navy:   #213448    Slate:  #547792
Steel:  #94B4C1    Sand:   #EAE0CF    Cream:  #FDFAF5
```
Auth pages keep their own navy theme — do not apply luxury variables there.

---

## 2 — Color Rules

- **NEVER** use raw hex in components — always use `var(--token)` or Tailwind `[var(--token)]`
- **NEVER** use `emerald-*`, `gray-*`, `bg-white`, `text-black` in `(main)/` pages
- **Tailwind arbitrary syntax**: `text-[var(--primary)]`, `bg-[var(--card)]`, `border-[var(--border)]`
- **Inline styles**: `style={{ color: 'var(--foreground)', background: 'var(--card)' }}`
- **Gradients**: `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)` for green gradient, add `var(--accent)` for gold highlight
- **Destructive**: `text-[var(--destructive)] border-[var(--destructive)]/30 hover:bg-[var(--destructive)]/8`
- **Success states**: `var(--primary)` (deep green) — not emerald
- **Warning**: `#f59e0b` (amber) or `var(--accent)` for gold emphasis
- **Gold active indicators**: `var(--accent)` for selected tabs, active nav, badges, rings

### Mapping old → new (for refactors)
| Old (banned) | New CSS variable |
|---|---|
| `#10B981`, `emerald-500` | `var(--primary)` |
| `#059669`, `emerald-600` | `var(--primary)` |
| `#065F46`, `emerald-900` | `var(--foreground)` |
| `#ECFDF5`, `#F0FDF4`, `#DCFCE7` | `var(--muted)` |
| `#FFFBEB` | `var(--card)` |
| `bg-white` | `bg-[var(--card)]` |
| `text-gray-900/800/700` | `text-[var(--foreground)]` |
| `text-gray-600/500/400` | `text-[var(--muted-foreground)]` |
| `bg-gray-50/100` | `bg-[var(--muted)]` |
| `border-gray-100/200` | `border-[var(--border)]` |
| `#213448`, `#131F2E` (navy) | `var(--foreground)` |
| `#547792`, `#94B4C1` (steel) | `var(--muted-foreground)` |
| `#D4E8EE`, `#EAE0CF` (steel bg) | `var(--muted)` |
| `#C8D8DF` (steel border) | `var(--border)` |
| `#FDFAF5` (cream card) | `var(--card)` |

---

## 3 — Card & Surface Patterns

Use these utility classes from `globals.css` — do not repeat their styles inline:

```tsx
// Standard content card
<div className="rounded-2xl card-theme-default">

// Elevated card (modals, popovers)
<div className="rounded-2xl card-theme-elevated">

// Warm gradient card
<div className="rounded-2xl card-theme-warm">

// Dark gradient card (stats widgets)
<div className="rounded-2xl card-theme-dark">

// Glass card (overlays)
<div className="rounded-2xl card-theme-glass">

// Premium card with hover lift
<div className="rounded-2xl card-theme-premium">
```

**Card anatomy**:
- Background: `var(--card)` (#FDFAF3)
- Border: `var(--border)` (#DDD5BF) — always include `border` class
- Border radius: `rounded-2xl` (16px) standard, `rounded-3xl` for hero cards
- Box shadow: `shadow-card` or `shadow-card-hover` utility class
- Padding: `p-4` (16px) standard, `p-5` or `p-6` for spacious cards

---

## 4 — Button Patterns

```tsx
// Primary action — deep green gradient
<button className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:shadow-xl transition-all"
  style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>

// Gold accent button
<button className="rounded-xl px-5 py-2.5 text-sm font-bold"
  style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #D4A853 100%)', color: '#0A3D2B' }}>

// Outline / ghost button
<button className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">

// Destructive
<button className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--destructive)] border border-[var(--destructive)]/30 hover:bg-[var(--destructive)]/8 transition-colors">
```

Rules:
- All buttons need `transition-all` or `transition-colors`
- Disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
- Loading: show `<Spinner>` from `components/ui/Spinner.tsx` inside button, disable it
- Min height: 40px (2.5rem) for standard; 36px acceptable for compact UI

---

## 5 — Input / Form Patterns

```tsx
// Standard input
<input className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/20 transition-all" />

// Textarea
<textarea className="... resize-none" rows={3} />

// Select
<select className="... cursor-pointer appearance-none" />
```

Rules:
- **Always** use `<label htmlFor>` — never placeholder-only labels
- Error message directly below the field, `text-sm text-[var(--destructive)]`
- Required: `<span className="text-red-400">*</span>` on the label
- Password: always include show/hide toggle
- Submit state: disable button + spinner during mutation
- Use `useToast()` for success/error feedback — never `alert()` or `confirm()`

---

## 6 — Layout & Responsive

### Page wrapper (already set in layout.tsx)
```
max-w-screen-2xl  (1536px) — fills wide monitors
px-3 sm:px-5 lg:px-8
sidebar: hidden on < lg, 240px (lg), 256px (xl)
main: flex-1 min-w-0
```

### Responsive grid rules
```tsx
// NEVER bare grid-cols-N — always start at 1 column
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">  // photo grids
```

### Spacing
- Use Tailwind 4-unit scale: `p-4`, `gap-4`, `space-y-4`; avoid arbitrary `p-[17px]`
- `max-w-4xl mx-auto` for content-heavy pages (forms, articles)
- `pb-24 lg:pb-8` on content wrapper — clears mobile BottomNav

### No horizontal scroll
- `overflow-x: hidden` on body (already set in globals.css)
- Horizontal scrollable lists: `overflow-x-auto pb-1` with `shrink-0` children

---

## 7 — Navigation Structure

```
Desktop (lg+):  Navbar (sticky top) + Sidebar (left) + main content
Tablet (md-lg): Navbar (sticky top) + BottomNav (bottom, lg:hidden)
Mobile (<md):   Navbar (sticky top) + BottomNav (bottom, lg:hidden)
```

**Navbar** (`components/layout/Navbar.tsx`):
- Glass effect: `backdrop-filter: blur(24px)`, `background: color-mix(in srgb, var(--card) 90%, transparent)`
- Bottom border: subtle gold tint via `color-mix(in srgb, var(--accent) 20%, var(--border))`
- Active link: gold dot indicator + `color: var(--accent)`
- Inactive: `color: var(--muted-foreground)`
- Hamburger drawer: `lg:hidden` — shows secondary features in 4-column grid

**Sidebar** (`components/layout/Sidebar.tsx`):
- Background: `var(--sidebar-bg)` (#091F16) — dark forest
- Active items: `var(--sidebar-active-fg)` (#E8C57A) gold + left gold stripe
- Inactive: `var(--sidebar-fg)` (#7DAC8D) muted sage
- Never apply emerald or card-color to sidebar elements

**BottomNav** (`components/layout/BottomNav.tsx`):
- Fixed bottom, `lg:hidden`
- Same dark background as sidebar: `var(--sidebar-bg)`
- Active: gold top stripe + `var(--sidebar-active-fg)`
- 5 tabs: Home, Matching, Chat, Search, Profile
- `env(safe-area-inset-bottom, 0px)` for iPhone home bar

---

## 8 — Shadow Utility Classes

All defined in globals.css — use these, don't write raw box-shadows:

```
shadow-soft        subtle card shadow (forest green tinted)
shadow-card        standard card shadow
shadow-card-hover  hover state card shadow
shadow-elevated    high elevation (modals, dropdowns)
shadow-glow        gold glow for accent elements
shadow-glow-lg     stronger gold glow
shadow-glow-primary  primary green glow
shadow-inner-soft  inset shadow for inputs/wells
shadow-border-glow  border + glow combo
```

---

## 9 — RTL (Arabic) — Tayyibt-specific

- `dir="rtl"` on root — already set in layout; text is right-aligned by default
- **Chat bubbles**: own messages `justify-end` (right side), others `justify-start` (left)
- **Own bubble corners**: `rounded-tl-sm`; others: `rounded-tr-sm`
- **Directional icons** (arrows, chevrons, send): flip for RTL with `scale-x-[-1]` or `rotate-180`
- **Spacing anchors**: use `mr-*` not `ml-*` for right-side anchoring; or use `gap-*` / `space-x-*`
- **Numbers**: `toLocaleString('ar-SA')` or Arabic-Indic numerals where appropriate
- **Dates**: `new Date(x).toLocaleDateString('ar-SA', { ... })`

---

## 10 — Accessibility (CRITICAL)

- **Contrast**: 4.5:1 minimum for body text; 3:1 for large text (≥18px or bold ≥14px)
  - `var(--foreground)` (#0E1912) on `var(--card)` (#FDFAF3) ≈ 17:1 ✓
  - `var(--primary)` (#0A3D2B) on `var(--muted)` (#E8E3D8) ≈ 9:1 ✓
  - `var(--accent)` (#B8892A) on `var(--card)` (#FDFAF3) ≈ 3.5:1 — use for decorative/large only
- **Focus rings**: `focus:ring-2 focus:ring-[var(--ring)]/20 focus:border-[var(--ring)]` — never `outline-none` without replacement
- **ARIA**: every icon-only button needs `aria-label`; toggles need `role="switch" aria-checked`
- **Alt text**: meaningful for images; `alt=""` for decorative only
- **Heading order**: h1 → h2 → h3, no skipped levels
- **Color alone**: never convey meaning with color only — pair with icon or text
- **Keyboard nav**: tab order matches visual reading order; all interactive elements keyboard-reachable
- **Reduced motion**: wrap non-essential animations in `@media (prefers-reduced-motion: reduce)`

---

## 11 — Touch & Interaction

- **Touch targets**: minimum 44×44px; use `min-h-[44px] min-w-[44px]` or padding to extend
- **Gap between tappable elements**: at least 8px
- **Loading states**: always disable buttons + show spinner during async ops — no silent freeze
- **Hover-only features**: never — all interactive features must work on tap
- **cursor-pointer**: add to all non-`<button>` clickable elements (`<div onClick>`, `<a>`, etc.)
- **Active states**: `active:scale-95` on buttons for satisfying tap feedback
- **Hover lift**: `hover:-translate-y-0.5` or `hover-lift` utility for cards/buttons

---

## 12 — Typography

- **Minimum body**: 14px (`text-sm`) — never smaller for readable content
- **Line height**: `leading-relaxed` (1.625) for body; `leading-tight` for headings
- **Hierarchy**:
  - Page title: `text-2xl font-bold text-[var(--foreground)]`
  - Section heading: `text-lg font-bold text-[var(--foreground)]`
  - Card title: `text-base font-semibold text-[var(--foreground)]`
  - Body: `text-sm text-[var(--foreground)]`
  - Muted/meta: `text-xs text-[var(--muted-foreground)]`
  - Label: `text-xs font-semibold text-[var(--primary)]`
- **Truncation**: `line-clamp-2` for multi-line truncation; `truncate` for single-line
- **Font**: Noto Serif Arabic + system fallback (already loaded in globals.css)
- **Arabic numerals in display**: use `tabular-nums` for counters to prevent layout shift

---

## 13 — Animation

- **Duration**: 150–200ms for micro-interactions; 300ms for panels/modals; max 400ms for page transitions
- **Properties**: only animate `transform` / `opacity` — never `width`, `height`, `top`, `left`
- **Easing**: `ease-out` for entering elements; `ease-in` for exiting
- **Skeleton loading**: `animate-pulse` on `bg-[var(--muted)]` placeholder blocks for >300ms loads
- **Spinner**: `animate-spin` on a ring element with `border-t-transparent border-[var(--primary)]`
- **Slide transitions**: `animate-slide-down` (from globals.css) for drawers/dropdowns
- **Scale in**: `animate-scale-in` for modals, popovers, pickers

---

## 14 — Empty / Error / Loading States

Every data-driven component must handle all three:

```tsx
// Loading
{isLoading && (
  <div className="space-y-3">
    {[1,2,3].map(i => (
      <div key={i} className="h-20 rounded-2xl bg-[var(--muted)] animate-pulse" />
    ))}
  </div>
)}

// Error
{isError && (
  <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8 text-center">
    <p className="text-2xl mb-2">⚠️</p>
    <p className="text-sm text-[var(--muted-foreground)]">فشل التحميل — يرجى المحاولة مجدداً</p>
  </div>
)}

// Empty
{data.length === 0 && (
  <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center">
    <p className="text-3xl mb-2">🔍</p>
    <p className="font-semibold text-[var(--foreground)]">لا توجد نتائج</p>
    <p className="text-sm text-[var(--muted-foreground)] mt-1">جرّب تغيير معايير البحث</p>
  </div>
)}
```

---

## 15 — Component Checklist

Before shipping any new component:
- [ ] Works at 375px mobile (iPhone SE) — no horizontal scroll
- [ ] pb-24 lg:pb-8 clears BottomNav on mobile
- [ ] Grids start at `grid-cols-1` on mobile
- [ ] Keyboard accessible (Tab, Enter, Escape on Modal)
- [ ] Has loading + error + empty states
- [ ] Uses `<Modal>` not `confirm()`; `useToast()` not `alert()`
- [ ] Arabic text readable; RTL layout correct (directional icons flipped)
- [ ] All colors use CSS variables — no raw hex, no gray-*, no emerald-*, no bg-white
- [ ] Buttons disabled + spinner during async submit
- [ ] Touch targets ≥44px
- [ ] No navy/steel palette outside `(auth)/` routes
- [ ] Shadows use utility classes (shadow-card, shadow-glow, etc.) not raw box-shadow
