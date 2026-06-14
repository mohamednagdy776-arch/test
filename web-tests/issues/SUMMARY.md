# Test Issues Summary

- **Generated:** 2026-06-11T22:55:44.110Z (original); profile issues added 2026-06-14
- **Total tests:** 293 passed, 7 failed, 0 flaky, 0 skipped
- **Issues reported:** 20 (7 automated Playwright · 13 code-review)

## Automated Test Failures (Playwright)

| ID | Severity | Route | Project | Check |
|----|----------|-------|---------|-------|
| [ISSUE-001](ISSUE-001-logs-no-console-errors.md) | Medium | `/admin` | user | logs no console errors |
| [ISSUE-002](ISSUE-002-logs-no-console-errors.md) | Medium | `/groups` | user | logs no console errors |
| [ISSUE-003](ISSUE-003-invalid-credentials-show-an-inline-error-message.md) | Low | `/login` | guest | invalid credentials show an inline error message |
| [ISSUE-004](ISSUE-004-has-no-horizontal-overflow-on-a-375px-mobile-viewp.md) | Medium | `/mockups` | guest | has no horizontal overflow on a 375px mobile viewport |
| [ISSUE-005](ISSUE-005-logs-no-console-errors.md) | Medium | `/pages` | user | logs no console errors |
| [ISSUE-006](ISSUE-006-logs-no-console-errors.md) | Medium | `/pages/110e2521-454e-4008-8af9-d89882dc3070` | user | logs no console errors |
| [ISSUE-007](ISSUE-007-logs-no-console-errors.md) | Medium | `/tamerfarouk21` | user | logs no console errors |

## Code-Review Findings — Profile System

| ID | Severity | Route | Component | Issue |
|----|----------|-------|-----------|-------|
| [ISSUE-008](ISSUE-008-profile-completion-bar-visible-on-other-users-profiles.md) | Medium | `/profile/[id]` | `ProfileHeader` | Profile completion bar visible on other users' profiles |
| [ISSUE-009](ISSUE-009-message-button-does-not-open-chat-with-specific-user.md) | Medium | `/profile/[id]` | `ProfileHeader` | Message button does not open chat with specific user |
| [ISSUE-010](ISSUE-010-username-falls-back-to-uuid-or-leaks-email-prefix.md) | Medium | `/profile`, `/profile/[id]` | `ProfileHeader` + `UsersService` | Username falls back to UUID or leaks email prefix |
| [ISSUE-011](ISSUE-011-user-names-are-not-clickable-links-to-profiles.md) | High | `/dashboard`, notifications | `PostCard`, `CommentList`, `NotificationList` | User names are not clickable links to profiles (Issue #152) |
| [ISSUE-012](ISSUE-012-profile-tabs-posts-friends-photos-videos-show-coming-soon.md) | Medium | `/profile`, `/profile/[id]` | `ProfileView` | Profile tabs Posts/Friends/Photos/Videos show "coming soon" |
| [ISSUE-013](ISSUE-013-default-active-tab-does-not-match-first-visible-tab.md) | Low | `/profile`, `/profile/[id]` | `ProfileView`, `ProfileTabs` | Default active tab does not match first visible tab |
| [ISSUE-014](ISSUE-014-duplicate-and-broken-post-menu-actions.md) | Low | `/dashboard` | `PostCard` | Duplicate and broken post menu actions |
| [ISSUE-015](ISSUE-015-match-score-breakdown-uses-math-random-on-every-render.md) | Medium | `/matching` | `MatchCard` | Match score breakdown uses Math.random on every render |
| [ISSUE-016](ISSUE-016-post-card-never-renders-user-avatar-only-initials.md) | Low | `/dashboard` | `PostCard` | Post card never renders user avatar, only initials |
| [ISSUE-017](ISSUE-017-getphotos-getvideos-always-return-total-zero.md) | Low | `/profile/[id]` | `UsersService` | getPhotos and getVideos always return total zero |
| [ISSUE-018](ISSUE-018-mutual-friends-count-truncates-silently-at-1000.md) | Medium | `/profile/[id]` | `UsersService` | Mutual friends count truncates silently at 1000 |
| [ISSUE-019](ISSUE-019-profile-work-education-update-deletes-entries-without-transaction.md) | High | `/profile` | `UsersService` | Profile work/education update deletes entries without a transaction |
| [ISSUE-020](ISSUE-020-profile-images-use-raw-img-tag-bypassing-nextjs-validation.md) | Medium | `/profile`, `/profile/[id]` | `ProfileHeader` | Profile images use raw img tag bypassing Next.js domain validation |

