# ISSUE-014: duplicate and broken post menu actions

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Route / Page** | `/dashboard` (any page with posts) |
| **Type** | Bug |
| **Component** | `PostCard` |
| **File** | `web/src/features/posts/components/PostCard.tsx:195-201` |
| **Status** | Open |

## Full location
- web/src/features/posts/components/PostCard.tsx
- `PostMenu` component — `menuItems` array

## Description
The post options menu (⋮) contains two separate problems:

1. **Duplicate actions:** "إخفاء المنشور" (Hide post) and "عدم الاهتمام" (Not interested) both call `hidePost.mutate({ postId, hideType: 'not_interested' })` with identical arguments. They are functionally indistinguishable — one of them is a dead duplicate.

2. **No-op action:** "أرشفة المنشور" (Archive post) has `action: () => {}` — clicking it does nothing silently.

## Failure details
```tsx
// PostCard.tsx lines 193-201
const menuItems = [
  { label: 'حفظ المنشور',   icon: BookmarkSimple, action: () => savePost.mutate(postId) },
  { label: post.isPinned ? 'إلغاء التثبيت' : 'تثبيت المنشور', icon: MapPin, action: () => pinPost.mutate(...) },
  { label: 'أرشفة المنشور', icon: BookmarkSimple, action: () => {} },          // ← no-op
  { label: 'إخفاء المنشور', icon: EyeSlash, action: () => hidePost.mutate({ postId, hideType: 'not_interested' }) },
  { label: 'عدم الاهتمام',  icon: EyeSlash, action: () => hidePost.mutate({ postId, hideType: 'not_interested' }) }, // ← exact duplicate
  { label: 'إيقاف مؤقت 30 يوم', icon: Clock, action: () => hidePost.mutate({ postId, hideType: 'snooze', snoozeDays: 30 }) },
  { label: 'حذف المنشور',   icon: Trash, action: () => deletePost.mutate(postId), danger: true },
];
```

## Steps to reproduce
1. Log in and view the main feed.
2. Click the ⋮ (three-dot) menu on any post.
3. Click "أرشفة المنشور" → nothing happens.
4. Click "إخفاء المنشور" then "عدم الاهتمام" separately → identical result.

## Expected behaviour
- "أرشفة المنشور" should call a real archive API endpoint or be removed until implemented.
- "إخفاء المنشور" and "عدم الاهتمام" should either use different `hideType` values or one should be removed.

> Code-review finding — not yet fixed.
