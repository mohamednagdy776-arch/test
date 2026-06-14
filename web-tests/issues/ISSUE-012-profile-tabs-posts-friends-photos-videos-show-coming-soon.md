# ISSUE-012: profile tabs posts friends photos videos show coming soon placeholder

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Route / Page** | `/profile`, `/profile/[id]` |
| **Type** | Bug |
| **Component** | `ProfileView` |
| **File** | `web/src/features/profile/components/ProfileView.tsx:155-161` |
| **Status** | Open |

## Full location
- web/src/features/profile/components/ProfileView.tsx
- `tabContent` record — `posts`, `friends`, `photos`, `videos` entries

## Description
Four of the six profile tabs render a "قريباً" (Coming soon) placeholder indefinitely:

| Tab | Backend endpoint | API function in `profileApi` | Frontend content |
|-----|-----------------|------------------------------|-----------------|
| Posts | `GET /users/:id/posts` | `getUserProfile` | `placeholder('المنشورات')` |
| Friends | `GET /users/:id/friends` | `getFriends()` | `placeholder('الأصدقاء')` |
| Photos | `GET /users/:id/photos` | `getPhotos()` | `placeholder('الصور')` |
| Videos | `GET /users/:id/videos` | `getVideos()` | `placeholder('الفيديوهات')` |

The backend endpoints are implemented and the `profileApi` client already has the fetch functions. The data pipeline is complete — only the frontend tab content has not been wired up.

## Failure details
```tsx
// ProfileView.tsx lines 155-162
const tabContent: Record<Tab, React.ReactNode> = {
  about:    aboutContent,
  activity: profileUserId ? <ActivityLogViewer userId={profileUserId} /> : placeholder('النشاط'),
  posts:    placeholder('المنشورات'),   // ← backend endpoint exists
  friends:  placeholder('الأصدقاء'),   // ← backend endpoint exists
  photos:   placeholder('الصور'),      // ← backend endpoint exists
  videos:   placeholder('الفيديوهات'), // ← backend endpoint exists
};
```

## Steps to reproduce
1. Log in and navigate to `/profile`.
2. Click the "المنشورات" (Posts), "الأصدقاء" (Friends), "الصور" (Photos), or "الفيديوهات" (Videos) tab.
3. Observe: each shows "قريباً" (Coming soon) with no data.

## Expected behaviour
Each tab fetches and renders the relevant data using the existing API functions:
- Posts → `profileApi.getUserProfile(userId)` / posts list
- Friends → `profileApi.getFriends(userId)`
- Photos → `profileApi.getPhotos(userId)`
- Videos → `profileApi.getVideos(userId)`

> Code-review finding — not yet fixed.
