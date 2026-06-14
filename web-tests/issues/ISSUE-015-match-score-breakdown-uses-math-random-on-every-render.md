# ISSUE-015: match score breakdown uses Math.random on every render

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Route / Page** | `/matching` |
| **Type** | Bug |
| **Component** | `MatchCard` → `ScoreBreakdown` |
| **File** | `web/src/features/matching/components/MatchCard.tsx:100` |
| **Status** | Open |

## Full location
- web/src/features/matching/components/MatchCard.tsx
- `ScoreBreakdown` component — category value calculation

## Description
The per-category score bars (Religion, Lifestyle, Interests, Location, Other) inside a match card are calculated with `Math.random()` on every render. This means:

- The displayed values are fabricated and bear no relation to actual match data.
- They change to different random numbers every time the component re-renders (e.g. on any state change above it).
- Users cannot rely on these numbers to understand why their match score is what it is.

## Failure details
```tsx
// MatchCard.tsx line 100 — random value recalculated on every render
const val = Math.min(100, Math.round(score * (0.8 + Math.random() * 0.4)));
```

The `categories` array with five items (Deen, Lifestyle, Interests, Location, Other) sums to `weight: 1.0`, suggesting these were meant to be real breakdown values from the AI service.

## Steps to reproduce
1. Log in and navigate to `/matching`.
2. Open browser DevTools → React DevTools.
3. Trigger any state change that re-renders the match list.
4. Observe the breakdown bar percentages change to different values with each render.

## Expected behaviour
The AI service (`/ai-service`) returns match scores with optional reasons. The breakdown should use real per-category scores from the API response, or the component should at minimum use a stable seeded value (e.g. derived from `match.id` and `match.score`) so the display is at least consistent.

## Fix
Remove `Math.random()` and use either real API data or a deterministic derivation:
```tsx
// Stable placeholder (no random flicker) — replace with real data when available
const val = Math.min(100, Math.round(score * c.weight * (10 / 6)));
```

> Code-review finding — not yet fixed.
