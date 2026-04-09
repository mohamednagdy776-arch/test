# Module 11 — Events

## clone-prompt.md Reference
Reference: `.kiro/agents/fb-clone-frontend.agent.md` - Module 11: Events

## Implemented

### Pages
- `/events` ✅ — Implemented in `web/src/app/(main)/events/page.tsx`

### Components
- `EventsList.tsx` ✅ — Implemented in `web/src/features/events/components/EventsList.tsx`

### Hooks
- `useEvents` ✅ — Implemented in `web/src/features/events/hooks.ts`

### API
- `eventsApi` — Backend exists in `backend/src/events/`

## Needs Implementation

### Components
- `EventCard.tsx` — Card component for displaying an event
- `EventHeader.tsx` — Header for event detail
- `EventDetails.tsx` — Event details (date, location, attendees)
- `EventRSVP.tsx` — RSVP buttons (Interested, Going, Maybe)

### Pages
- `/events/[id]` — Individual event detail page