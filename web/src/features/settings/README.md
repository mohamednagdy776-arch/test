# Module 13 — Privacy & Settings

## clone-prompt.md Reference
Reference: `.kiro/agents/fb-clone-frontend.agent.md` - Module 13: Privacy & Settings

## Implemented

### Pages
- `/settings` — Main settings landing page ✅
- `/settings/privacy` — Privacy settings page ✅
- `/settings/security` — Security settings page ✅
- `/settings/account` — Account settings page ✅
- `/settings/appearance` — Appearance/theme settings page ✅
- `/settings/notifications` — Notification settings page ✅
- `/settings/language` — Language settings page ✅
- `/settings/help` — Help page ✅
- `/settings/report` — Report issue page ✅

### Components
- Components are integrated inline in the pages using hooks

### Hooks
- `usePrivacySettings` — Hook for fetching privacy settings
- `useUpdatePrivacySettings` — Hook for updating privacy settings
- `useBlocks` — Hook for fetching blocked users
- `useBlockUser` — Hook for blocking a user
- `useUnblockUser` — Hook for unblocking a user

### API
- `settingsApi` — API for settings (privacy, blocks)

## Backend
- Backend exists: `backend/src/settings/`
- Privacy settings entity
- Block entity
- Settings service and controller
