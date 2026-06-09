# Module 14 — Memories & Archive

## clone-prompt.md Reference
Reference: `.kiro/agents/fb-clone-frontend.agent.md` - Module 14: Memories & Archive

## Implemented

### Components
- `MemoryCard.tsx` — Card for displaying a memory
- `MemoriesList.tsx` — Grid of memories
- `SavedItemsList.tsx` — List of saved items
- `VideoGrid.tsx` — Grid and card components for videos

### Pages
- `/memories` — On This Day / Memories page (implemented)
- `/saved` — Saved posts page (implemented via `/memories` with tab)
- `/watch` — Videos page (implemented)

### Hooks
- `useMemories` — Hook for fetching memories
- `useSavedItems` — Hook for saved items
- `useSaveItem` — Hook for saving items
- `useRemoveSaved` — Hook for removing saved items

### API
- `memoriesApi` — API for memories
- `savedPostsApi` — API for saved posts
- `videosApi` — API for videos

### Types
- `types.ts` — Type definitions for Memory and SavedItem

## Backend
- Backend exists: `backend/src/memories/`
- Backend exists: `backend/src/videos/`
