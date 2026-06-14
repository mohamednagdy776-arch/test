# ISSUE-023: user posts never rendered on profile posts tab

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Category** | Bug |
| **Route / Page** | `/profile`, `/profile/[id]` (Posts tab) |
| **Component** | `ProfileView` |
| **File** | `web/src/features/profile/components/ProfileView.tsx:159` |
| **Status** | Open |

## Description

The "Posts" tab on any profile page permanently shows the text "المنشورات قريباً" (Posts coming soon). This is a hardcoded placeholder that has never been replaced with real data, even though the complete backend pipeline for fetching profile posts is fully implemented and working.

This is distinct from the general "coming soon" issue (ISSUE-012) in that it specifically affects the primary content of a social profile. A profile without visible posts is effectively empty and unacceptable for a social platform.

## Current Behavior

- User creates posts via the feed.
- User navigates to their own profile and clicks the "Posts" tab.
- Tab shows: "المنشورات قريباً" (a static placeholder `<div>`).
- No posts are loaded or displayed.
- The same is true when viewing another user's profile.

## Expected Behavior

- The Posts tab must fetch and render all posts authored by the profile user.
- For own profile: authenticated user sees all their own posts.
- For other profiles: visitor sees publicly accessible posts by that user.
- Pagination should work (next/previous pages).
- Newly created posts should appear after standard cache invalidation.

## Affected Files

```
web/src/features/profile/components/ProfileView.tsx
  Line 149-152: placeholder helper — renders static "قريباً" text
  Line 159:     posts: placeholder('المنشورات')   ← hardcoded, never wired up

backend/src/users/services/users.service.ts
  Lines 28-39:  getUserPosts() — IMPLEMENTED, accepts UUID or username
                Returns: { data: Post[], total: number }
                Relations loaded: ['user', 'group']

backend/src/users/controllers/users.controller.ts
  Lines 103-107: GET /users/:id/posts — IMPLEMENTED, returns paginated posts

web/src/features/profile/api.ts
  Line 22-24:  getUserProfile() — exists but calls GET /users/{userId}, not /posts
  (No dedicated getPostsByUser() helper exists yet)
```

## Suggested Fix

**Step 1 — Add a posts API helper in `profileApi`:**
```ts
// web/src/features/profile/api.ts
getUserPosts: (userId: string, page = 1, limit = 10) =>
  apiClient.get(`/users/${userId}/posts`, { params: { page, limit } }).then((r) => r.data),
```

**Step 2 — Create a `ProfilePostsFeed` component** (or reuse `PostFeed` with a userId filter) that:
- Calls `profileApi.getUserPosts(profileUserId, page, limit)` via React Query.
- Renders a list of `<PostCard>` items.
- Shows a paginator or infinite-scroll trigger.
- Shows an empty state when the user has no posts.

**Step 3 — Wire it into `ProfileView`:**
```diff
- posts: placeholder('المنشورات'),
+ posts: profileUserId
+   ? <ProfilePostsFeed userId={profileUserId} />
+   : placeholder('المنشورات'),
```

## Notes

- The backend's `getUserPosts` loads posts with `relations: ['user', 'group']` but NOT `['user', 'user.profile']`. The profile picture (`post.user.profile.avatarUrl`) will be missing for profile tab posts — this should be added to the relation list when the tab is implemented (and ties into ISSUE-016).
- Cache invalidation: after posting, `['my-profile-posts', userId]` should be invalidated to reflect the new post without a page reload.
