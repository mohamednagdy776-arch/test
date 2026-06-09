# Module 2 — User Profile

## clone-prompt.md Reference
Reference: `.kiro/agents/fb-clone-frontend.agent.md` - Module 2: User Profile

## Implemented

### Pages
- `/[username]` ✅ — Implemented in `web/src/app/(main)/[username]/page.tsx`
- `/profile` ✅ — Implemented in `web/src/app/(main)/profile/page.tsx`

### Components
- `ProfileHeader.tsx` ✅ — Implemented in `web/src/features/profile/components/ProfileHeader.tsx`
- `ProfileTabs.tsx` ✅ — Implemented in `web/src/features/profile/components/ProfileTabs.tsx`
- `ProfileSection.tsx` ✅ — Implemented in `web/src/features/profile/components/ProfileSection.tsx`
- `ProfileView.tsx` ✅ — Implemented in `web/src/features/profile/components/ProfileView.tsx`
- `ProfileEditForm.tsx` ✅ — Implemented in `web/src/features/profile/components/ProfileEditForm.tsx`
- `ActivityLogViewer.tsx` ✅ — Implemented in `web/src/features/profile/components/ActivityLogViewer.tsx`

### Hooks
- `useProfile` ✅ — Implemented in `web/src/features/profile/hooks.ts`
- `useUpdateProfile` ✅ — Hook for updating profile
- `useUploadAvatar` ✅ — Hook for uploading avatar

### API
- `profileApi` ✅ — Implemented in `web/src/features/profile/api.ts`

## Backend
- Backend exists: `backend/src/users/`
