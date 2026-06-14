# ISSUE-025: activity tab silently returns empty for other users profiles

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Bug |
| **Route / Page** | `/profile/[id]` (Activity tab) |
| **Component** | `ActivityLogViewer` + `UsersController` |
| **Files** | `web/src/features/profile/components/ActivityLogViewer.tsx:24-28` · `backend/src/users/controllers/users.controller.ts:125-129` |
| **Status** | Open |

## Description

The backend activity-log endpoint enforces `id === user.id` — a user can only read their own activity log. However, `ProfileView` renders `<ActivityLogViewer>` for *any* profile, including other users'. When a logged-in user views someone else's profile and clicks the Activity tab, the request returns HTTP 403 Forbidden. `ActivityLogViewer` does not handle this error and instead renders the empty-state message "لا يوجد نشاط" (No activity), making it look as if the person has never done anything on the platform.

## Current Behavior

1. User A visits User B's profile at `/profile/{B_id}`.
2. User A clicks the "Activity" tab.
3. `ActivityLogViewer` calls `GET /users/{B_id}/activity`.
4. Backend returns `403 Forbidden` because `B_id !== A_id`.
5. The query enters an error state; `activities` defaults to `[]`.
6. The component renders "لا يوجد نشاط" (No activity found).
7. User A incorrectly concludes that User B has no activity.

## Expected Behavior

**Option A (recommended):** The Activity tab should only render when `isSelf === true`. For other users' profiles it should be hidden or replaced with a locked/private state message.

**Option B:** If activity is intended to be visible to others in future, `ActivityLogViewer` must handle 403 with a clear "هذا النشاط خاص" (This activity is private) message, not an empty-state.

## Affected Files

```
backend/src/users/controllers/users.controller.ts
  Lines 125-129:
  @Get(':id/activity')
  async getActivityLog(...) {
    if (id !== user.id) throw new ForbiddenException('Access denied');  // ← IDOR fix
    ...
  }

web/src/features/profile/components/ActivityLogViewer.tsx
  Lines 24-28:  useQuery — no onError handler, no isError check
  Line 30:      activities = data?.data?.data || []  ← 403 response has no .data.data,
                                                        so this silently becomes []
  Line 73-76:   activities.length === 0 → renders empty state  ← misleading on 403

web/src/features/profile/components/ProfileView.tsx
  Line 157:  activity: profileUserId
               ? <ActivityLogViewer userId={profileUserId} />  ← no isSelf guard
               : placeholder('النشاط'),
```

## Suggested Fix

```diff
// ProfileView.tsx line 157
- activity: profileUserId
-   ? <ActivityLogViewer userId={profileUserId} />
-   : placeholder('النشاط'),
+ activity: isSelf && profileUserId
+   ? <ActivityLogViewer userId={profileUserId} />
+   : placeholder('النشاط غير متاح'),
```

## Notes

- The IDOR fix in `UsersController` (preventing users from reading others' activity logs) is **correct and should stay**. The problem is the frontend not honouring this constraint in the UI.
- `ActivityLogViewer` should also add `isError` handling as a defensive measure.
