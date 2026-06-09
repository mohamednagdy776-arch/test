# Module 8 — Notifications

## clone-prompt.md Reference
Reference: `.kiro/agents/fb-clone-frontend.agent.md` - Module 8: Notifications

## Implemented

### Components
- `NotificationList.tsx` ✅ — List of notifications
- `NotificationBell.tsx` ✅ — Bell icon with unread count badge

### Hooks
- `useNotifications` ✅ — Hook for fetching notifications
- `useMarkAsRead` ✅ — Hook for marking notification as read
- `useDeleteNotification` ✅ — Hook for deleting notification

### API
- `notificationsApi` ✅ — API for notifications

### Pages
- Integrated into navbar (existing)
- `/notifications` page implemented in navbar dropdown

## Backend
- Backend exists: `backend/src/notifications/`
