# ISSUE-013: default active tab does not match first visible tab

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Route / Page** | `/profile`, `/profile/[id]` |
| **Type** | Bug / UX |
| **Component** | `ProfileView`, `ProfileTabs` |
| **File** | `web/src/features/profile/components/ProfileView.tsx:19`, `web/src/features/profile/components/ProfileTabs.tsx:10-16` |
| **Status** | Open |

## Full location
- web/src/features/profile/components/ProfileView.tsx — initial state
- web/src/features/profile/components/ProfileTabs.tsx — tab render order

## Description
The tab bar renders tabs in this visual order: **Posts → About → Friends → Photos → Videos → Activity**.

However, the initial active tab state is set to `'about'`, which is the **second** tab. On page load the "About" tab is highlighted even though "Posts" appears first. Users expect the first visible tab to be the selected one.

## Failure details
```tsx
// ProfileView.tsx line 19 — initial state set to 'about'
const [activeTab, setActiveTab] = useState<Tab>('about');

// ProfileTabs.tsx lines 10-16 — 'posts' is first in render order
const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'posts',    label: 'المنشورات',   icon: '📝' },  // ← appears first visually
  { id: 'about',    label: 'حول',         icon: 'ℹ️'  },  // ← highlighted on load
  { id: 'friends',  label: 'الأصدقاء',    icon: '👥' },
  ...
];
```

## Steps to reproduce
1. Navigate to any profile page.
2. Observe the tab bar on load — the second tab ("حول") is highlighted, not the first ("المنشورات").

## Expected behaviour
The initial active tab should be `'posts'` to match the first rendered tab, or the tab order should be changed so `'about'` comes first.

## Fix (option A — change initial state)
```diff
- const [activeTab, setActiveTab] = useState<Tab>('about');
+ const [activeTab, setActiveTab] = useState<Tab>('posts');
```

## Fix (option B — move About first in the tab list)
```diff
 const tabs = [
+  { id: 'about',    label: 'حول',         icon: 'ℹ️'  },
   { id: 'posts',    label: 'المنشورات',   icon: '📝' },
-  { id: 'about',    label: 'حول',         icon: 'ℹ️'  },
   ...
 ];
```

> Code-review finding — not yet fixed.
