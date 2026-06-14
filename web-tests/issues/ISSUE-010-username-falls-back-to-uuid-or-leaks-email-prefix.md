# ISSUE-010: username falls back to UUID or leaks email prefix

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Route / Page** | `/profile`, `/profile/[id]` |
| **Type** | Bug / Privacy |
| **Component** | `ProfileHeader` + `UsersService` |
| **File** | `web/src/features/profile/components/ProfileHeader.tsx:157`, `backend/src/users/services/users.service.ts:152` |
| **Status** | Open |

## Full location
- web/src/features/profile/components/ProfileHeader.tsx — frontend display
- backend/src/users/services/users.service.ts — backend username fallback

## Description
Two separate problems combine to produce bad UI and a privacy leak when a user has not set a username:

**Frontend (UX):** `ProfileHeader` displays `@{profile.username || profile.userId}`. When no username is set, it renders the raw database UUID (e.g. `@3fa85f64-5717-4562-b3fc-2c963f66afa6`), which is meaningless to users.

**Backend (Privacy):** `getFullProfile` in `UsersService` falls back to `profile.user?.email?.split('@')[0]` as the username. This leaks the first half of the user's private email address as a publicly visible handle.

## Failure details
```tsx
// ProfileHeader.tsx line 157 — shows UUID when no username
<p className="mt-1 text-sm text-[#547792] font-medium">
  @{profile.username || profile.userId}
</p>
```

```ts
// users.service.ts line 152 — leaks email prefix as username
username: profile.user?.username || profile.user?.email?.split('@')[0],
```

## Steps to reproduce
1. Register a new user without setting a username.
2. Navigate to their profile.
3. Observe the `@` handle showing either a UUID (frontend) or the email prefix (backend).

## Expected behaviour
- If no username is set, hide the `@` handle entirely or show a neutral placeholder like "@user".
- The backend must never expose email addresses or their derivatives in public API responses.

## Fix
```diff
// ProfileHeader.tsx
- <p>@{profile.username || profile.userId}</p>
+ {profile.username && <p>@{profile.username}</p>}
```

```diff
// users.service.ts
- username: profile.user?.username || profile.user?.email?.split('@')[0],
+ username: profile.user?.username ?? null,
```

> Code-review finding — not yet fixed.
