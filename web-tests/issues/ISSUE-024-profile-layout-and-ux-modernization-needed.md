# ISSUE-024: profile layout and UX modernization needed

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | UX |
| **Route / Page** | `/profile`, `/profile/[id]` |
| **Component** | `ProfileHeader`, `ProfileView`, `ProfileTabs` |
| **Files** | `web/src/features/profile/components/ProfileHeader.tsx` · `ProfileView.tsx` · `ProfileTabs.tsx` |
| **Status** | Open |

## Description

The current profile page layout has several structural and visual issues that make it feel unfinished relative to modern social platforms (Facebook, LinkedIn, X). These are verified from the codebase and visible at runtime.

## Observed UX Problems

### 1. Large vertical gap between avatar and the content below it

```tsx
// ProfileHeader.tsx line 154
<div className="flex-1 min-w-0 pt-16">
```
`pt-16` (64px top padding) pushes the name, username, and bio far below the avatar midpoint. On a typical viewport the user sees a large blank area before any text appears beside the avatar.

### 2. Avatar overlap amount is small — feels disconnected from cover

```tsx
// ProfileHeader.tsx line 119
<div className="flex items-start gap-5 -mt-14 relative">
```
`-mt-14` (−56px) lifts the entire row only 56px above the card body. With the avatar being `h-28 w-28` (112px), only half overlaps the cover — standard profiles (e.g. Facebook) overlap the avatar by ~75% of its height to create a strong visual connection.

### 3. Profile completion bar occupies footer space for every visitor

```tsx
// ProfileHeader.tsx line 258
<ProfileCompletion profile={profile} />   ← shown unconditionally (see also ISSUE-008)
```
Even when `isSelf === true`, the bar is a large horizontal element that pushes all profile content downwards. It would be better presented as a non-intrusive inline badge or a collapsible nudge, rather than a full-width bar pinned to the bottom of the header card.

### 4. Edit form is visually jarring — different design system

When the edit button is clicked, `ProfileView` swaps out the header card for `ProfileEditForm`. The edit form uses `bg-white shadow-sm` and `border-primary` (blue primary theme) while the profile view uses `bg-[#FDFAF5]`, `shadow-card-hover`, and the dark navy `#213448` palette. The transition looks like switching to a different app.

```tsx
// ProfileEditForm.tsx line 142 — plain white, no brand colours
<div className="rounded-xl bg-white shadow-sm overflow-hidden">
```

### 5. Tabs bar has no active visual weight

```tsx
// ProfileTabs.tsx line 27
className={`... border-b-2 ... ${
  activeTab === tab.id
    ? 'border-[#213448] text-[#213448]'
    : 'border-transparent text-[#547792] ...'
}`}
```
The active tab is indicated only by a bottom border and darker text. There is no background fill, pill, or other visual anchor. On a light beige background (`bg-[#FDFAF5]`) the distinction between active and inactive tabs is subtle.

### 6. `pt-16` on info block + `pb-6` on card body = excessive whitespace

The combination of:
- `h-56` cover (224px)
- `-mt-14` avatar lift (−56px)
- `pt-16` info text padding (64px)
- `pb-6` card body bottom padding (24px)
- `ProfileCompletion` component (≈56px)

…produces a header card that is approximately 350px tall before any actual profile data appears. Most social platforms keep the header to 220–280px.

### 7. No breadcrumb or page title on public profile pages

```tsx
// web/src/app/(main)/profile/[id]/page.tsx line 4-6
export default function PublicProfilePage({ params }: { params: { id: string } }) {
  return <ProfileView userId={params.id} />;   // ← no heading, no breadcrumb
}
```
The own-profile page at `/profile/page.tsx` shows `<h1>الملف الشخصي</h1>`, but the public profile route has no page title at all. The browser tab shows the app name only, not the person's name.

## Expected Behavior

- Avatar should overlap the cover image by 60–80% of its height.
- The name/info block should appear tightly under/beside the avatar, not 64px below it.
- The completion bar should only appear for `isSelf` (see ISSUE-008) and should be a compact, non-intrusive element.
- `ProfileEditForm` should adopt the same colour tokens as the rest of the profile UI.
- Active tab should have a clear filled background or pill indicator.
- The public profile page should set `<title>` and a visible heading to the user's full name.

## Affected Files

```
web/src/features/profile/components/ProfileHeader.tsx
  Line 119:  -mt-14 (avatar overlap — too shallow)
  Line 154:  pt-16 (info text — too much top padding)
  Line 258:  <ProfileCompletion /> (unconditional, too prominent)

web/src/features/profile/components/ProfileEditForm.tsx
  Line 142:  bg-white shadow-sm (different visual system)

web/src/features/profile/components/ProfileTabs.tsx
  Line 27-30: active tab uses only border-b-2 (weak active indicator)

web/src/app/(main)/profile/[id]/page.tsx
  Line 4-6:  no page title or breadcrumb
```

## Notes

- These are structural UX problems that should be addressed before a production launch.
- Fixing the avatar overlap and removing the unconditional completion bar alone would resolve the most visible issues.
- The edit form redesign (item 4) is the largest effort but also the most important for visual consistency.
