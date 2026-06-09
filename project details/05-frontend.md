# 05 — Frontend (Next.js Web App)

## App Router Structure

The web app uses the Next.js 14 App Router with two route groups:

```
web/src/app/
├── (auth)/                     # Unauthenticated routes
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/[token]/
│   └── verify-email/
├── (main)/                     # Authenticated routes (AuthGuard)
│   ├── dashboard/
│   ├── matching/
│   ├── search/
│   ├── chat/
│   ├── friends/
│   ├── groups/  groups/[id]/
│   ├── pages/   pages/[id]/
│   ├── events/
│   ├── notifications/
│   ├── memories/
│   ├── saved/
│   ├── posts/
│   ├── watch/
│   ├── profile/
│   ├── upgrade/
│   ├── settings/  (account, security, privacy, notifications,
│   │               appearance, language, help, report)
│   └── [username]/             # Public profile by username
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout
├── not-found.tsx               # 404
├── error.tsx                   # Error boundary
└── loading.tsx                 # Loading state
```

---

## Layout & Auth Guard

`(main)/layout.tsx` wraps all authenticated pages with `<AuthGuard>`:

```tsx
export const AuthGuard = ({ children }) => {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) router.replace('/login');
    else setChecked(true);
  }, [router]);
  // shows spinner until checked
};
```

The layout renders a `Navbar` + `Sidebar` + main content area.

---

## API Client

`web/src/lib/api-client.ts`:

```typescript
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: on 401, clear token and redirect to /login
```

> `NEXT_PUBLIC_API_URL` is baked at build time → set to `https://145-14-158-100.sslip.io/api/v1` in production.

---

## Feature Modules (`web/src/features/`)

Each feature folder typically contains `api.ts`, `hooks.ts`, `types.ts`, and `components/`.

| Feature | Key components |
|---------|----------------|
| `auth` | LoginForm, RegisterForm |
| `matching` | MatchList, MatchCard, MatchDetailModal, MatchingTabs, MatchingStats |
| `search` | SearchPage, SearchFilters, UserCard, UserProfileModal |
| `profile` | ProfileView, ProfileHeader, ProfileTabs, ProfileEditForm, ProfileSection, ActivityLogViewer |
| `posts` | PostFeed, PostComposer, PostCard, StoryCreator, StoryViewer |
| `comments` | CommentList, CommentForm, ReactionPicker |
| `chat` | ChatList, ChatSidebar, ChatWindow |
| `friends` | (friends page) |
| `groups` | GroupList |
| `pages` | PagesList |
| `events` | EventsList |
| `notifications` | NotificationBell, NotificationList |
| `memories` | MemoriesList, MemoryCard, SavedItemsList |
| `videos` | VideoGrid |

---

## Page-by-Page Summary

### Dashboard (`/dashboard`)
Home feed with activity overview, friend suggestions (`useSuggestions(4)`), trending topics, quick stats, and the social `PostFeed`.

### Matching (`/matching`)
Compatibility matching with AI scoring. Filters (age, location, prayer level), accept/reject, view profiles, start chat. Score color-coded: 80+ green, 60–79 amber, <60 red. Categories: religion, lifestyle, interests, location.

### Search (`/search`)
Cross-entity search (users, posts, groups, pages, events). Debounced auto-search (600 ms), autocomplete, advanced filters, tabbed results. User cards show name, country, city, job, sect, bio, age.

### Chat (`/chat`)
Real-time messaging. Select conversation, send/receive, reactions, replies, typing indicators, read receipts. Socket.IO-driven with optimistic UI.

### Friends (`/friends`)
Manage friendships, requests, suggestions, custom lists, birthdays, blocking, restrictions.

### Profile (`/profile`)
Multi-tab profile editing (Basic, Education/Work, Religion, Preferences) via `ProfileEditForm`, submitting `PATCH /users/me`.

### Groups (`/groups`, `/groups/[id]`)
Create/browse communities, cover photo upload, privacy levels, categories, membership.

### Pages (`/pages`, `/pages/[id]`)
Create/follow/like brand and topic pages.

### Events (`/events`)
Create events, browse, RSVP.

### Notifications (`/notifications`)
Filter all/unread/mentions, mark read (single/all), delete.

### Memories (`/memories`) & Saved (`/saved`)
View yearly memories and bookmarked items (posts/videos/stories); remove saved items.

### Settings (`/settings/*`)
Navigation hub → account, security, privacy, notifications, appearance, language, help, report.

### Upgrade (`/upgrade`)
Subscription tier display + checkout.

### Watch (`/watch`)
Video feed.

---

## State Management

- **Server state**: React Query (`useQuery`, `useMutation`) per feature.
- **Auth token**: `localStorage` (`access_token`, `refresh_token`).
- **Theme/appearance**: persisted via settings API + CSS variables.

---

## Styling

- Tailwind CSS with an emerald/green brand palette.
- RTL support (`<html lang="ar" dir="rtl">`), bilingual Arabic/English UI.
- Responsive layout with mobile breakpoints.
