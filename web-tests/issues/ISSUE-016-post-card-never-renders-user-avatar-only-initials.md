# ISSUE-016: post card never renders user avatar only initials

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Route / Page** | `/dashboard` (any page with posts) |
| **Type** | Bug / UX |
| **Component** | `PostCard` |
| **File** | `web/src/features/posts/components/PostCard.tsx:305` |
| **Status** | Open |

## Full location
- web/src/features/posts/components/PostCard.tsx
- `PostCard` component — author avatar element

## Description
The post author avatar area always shows a coloured circle with the user's first initial (`userInitial`). The user's actual avatar photo (`post.user?.profile?.avatarUrl`) is never used, even when it exists. This is inconsistent with `ProfileHeader` which correctly renders avatar images from the same URL field.

## Failure details
```tsx
// PostCard.tsx lines 303-307 — hardcoded to initials, never checks avatarUrl
<div
  className="h-11 w-11 shrink-0 rounded-full text-[#FDFAF5] font-bold text-sm ring-2 ring-[#FDFAF5] shadow-soft flex items-center justify-center"
  style={{ background: 'linear-gradient(135deg, #213448 0%, #547792 100%)' }}
>
  {userInitial}   {/* ← avatar photo never rendered */}
</div>
```

Compare with `ProfileHeader.tsx` line 126-128 which correctly handles avatarUrl:
```tsx
{mediaUrl(profile.avatarUrl) ? (
  <img src={mediaUrl(profile.avatarUrl)!} alt="avatar" className="h-full w-full object-cover" />
) : (
  <span className="text-4xl font-bold text-gradient">{profile.fullName?.charAt(0)?.toUpperCase() ?? '?'}</span>
)}
```

## Steps to reproduce
1. Upload an avatar photo via the profile page.
2. Navigate to the main feed.
3. Observe that posts by users with avatar photos still show only the initial letter, not the photo.

## Expected behaviour
The avatar image should be rendered when `post.user?.profile?.avatarUrl` is available, falling back to the initial only when no image exists.

## Fix
```tsx
const avatarUrl = post.user?.profile?.avatarUrl
  ? `${apiUrl}${post.user.profile.avatarUrl}`.replace('/api/v1', '')
  : null;

<div className="h-11 w-11 shrink-0 rounded-full overflow-hidden ring-2 ring-[#FDFAF5] shadow-soft">
  {avatarUrl
    ? <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
    : <div className="h-full w-full flex items-center justify-center text-[#FDFAF5] font-bold text-sm" style={{ background: 'linear-gradient(135deg, #213448 0%, #547792 100%)' }}>{userInitial}</div>
  }
</div>
```

> Code-review finding — not yet fixed.
