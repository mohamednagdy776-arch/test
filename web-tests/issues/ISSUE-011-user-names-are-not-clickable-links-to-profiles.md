# ISSUE-011: user names are not clickable links to profiles

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Route / Page** | `/dashboard`, `/profile/[id]`, notifications |
| **Type** | Bug / Feature (Issue #152) |
| **Component** | `PostCard`, `CommentList`, `NotificationList` |
| **File** | Multiple — see table below |
| **Status** | Open |

## Full location

| File | Line | Context |
|------|------|---------|
| `web/src/features/posts/components/PostCard.tsx` | 310 | Post author name |
| `web/src/features/posts/components/PostCard.tsx` | 342 | Shared post's original author name |
| `web/src/features/posts/components/PostCard.tsx` | 117 | Comment author name (inline CommentSection) |
| `web/src/features/comments/components/CommentList.tsx` | 156 | Comment author name (standalone component) |
| `web/src/features/notifications/components/NotificationList.tsx` | 94 | Notification message (fromUser available but unused) |

## Description
Every place in the app where a person's name appears renders it as a plain, non-interactive `<p>` or `<span>`. Clicking a name does nothing. Users expect names to be clickable and navigate to that person's profile — this is the behaviour requested in GitHub Issue #152 ("Clicking a person's name should open their profile").

The `/profile/[id]` page already exists (`web/src/app/(main)/profile/[id]/page.tsx`) and is ready to receive a `userId`. The user ID is available on every object where the name is displayed (`post.user.id`, `comment.user.id`, `notification.fromUser.id`). The only missing piece is wrapping names in `<Link>` elements.

## Failure details
```tsx
// PostCard.tsx line 310 — post author, no link
<p className="text-sm font-bold text-[#213448]">{userName}</p>

// PostCard.tsx line 342 — original post author in a share, no link
<span className="text-xs font-medium text-[#213448]">
  {displayName(post.originalPost.user)}
</span>

// PostCard.tsx line 117 — inline comment author, no link
<p className="text-xs font-bold text-[#213448]">{displayName(c.user)}</p>

// CommentList.tsx line 156 — standalone comment author, no link
<p className="text-xs font-bold text-[#213448]">{displayName(comment.user)}</p>
```

## Steps to reproduce
1. Log in and view the main feed at `/dashboard`.
2. Click on any author name above a post.
3. Observe: nothing happens — no navigation to the author's profile.
4. Repeat for comment author names.

## Expected behaviour
Clicking any person's name navigates to `/profile/{userId}`. If it is your own name, it navigates to `/profile` (own profile page).

## Fix
```tsx
import Link from 'next/link';

// Replace plain text with a Link:
<Link
  href={`/profile/${post.user?.id}`}
  className="text-sm font-bold text-[#213448] hover:underline cursor-pointer"
>
  {userName}
</Link>
```
Apply the same pattern in `CommentList.tsx` and `NotificationList.tsx`.

> Code-review finding — not yet fixed.
