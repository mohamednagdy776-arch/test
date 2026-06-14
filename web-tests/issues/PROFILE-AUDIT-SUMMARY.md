# Profile System Audit Summary

- **Audit date:** 2026-06-14 (initial) · 2026-06-15 (second pass)
- **Auditor:** Code review — Alisadek1
- **Scope:** Web profile feature · `web/src/features/profile/` · `backend/src/users/`
- **Total profile issues:** 22 (ISSUE-008 to ISSUE-029)

---

## Severity Overview

| Severity | Count | Issues |
|----------|-------|--------|
| Critical | 3 | 022, 023, 025 (indirectly) |
| High | 4 | 011, 019, 021, 023 |
| Medium | 9 | 008, 009, 010, 012, 015, 018, 024, 027, 028, 029 |
| Low | 6 | 013, 014, 016, 017, 026 |

---

## All Profile Issues

### First Audit Pass (2026-06-14) — ISSUE-008 to ISSUE-020

| ID | Severity | Component | Issue |
|----|----------|-----------|-------|
| [ISSUE-008](ISSUE-008-profile-completion-bar-visible-on-other-users-profiles.md) | Medium | `ProfileHeader` | Completion bar visible on other users' profiles |
| [ISSUE-009](ISSUE-009-message-button-does-not-open-chat-with-specific-user.md) | Medium | `ProfileHeader` | Message button does not open chat with specific user |
| [ISSUE-010](ISSUE-010-username-falls-back-to-uuid-or-leaks-email-prefix.md) | Medium | `ProfileHeader` · `UsersService` | Username falls back to UUID or leaks email prefix |
| [ISSUE-011](ISSUE-011-user-names-are-not-clickable-links-to-profiles.md) | High | `PostCard` · `CommentList` · `NotificationList` | Author names are not clickable links to profiles |
| [ISSUE-012](ISSUE-012-profile-tabs-posts-friends-photos-videos-show-coming-soon.md) | Medium | `ProfileView` | Posts / Friends / Photos / Videos tabs show "coming soon" |
| [ISSUE-013](ISSUE-013-default-active-tab-does-not-match-first-visible-tab.md) | Low | `ProfileView` · `ProfileTabs` | Default active tab does not match first visible tab |
| [ISSUE-014](ISSUE-014-duplicate-and-broken-post-menu-actions.md) | Low | `PostCard` | Duplicate and broken post menu actions |
| [ISSUE-015](ISSUE-015-match-score-breakdown-uses-math-random-on-every-render.md) | Medium | `MatchCard` | Match score breakdown uses `Math.random` on every render |
| [ISSUE-016](ISSUE-016-post-card-never-renders-user-avatar-only-initials.md) | Low | `PostCard` | Post card never renders user avatar — only initials |
| [ISSUE-017](ISSUE-017-getphotos-getvideos-always-return-total-zero.md) | Low | `UsersService` | `getPhotos` / `getVideos` always return `total: 0` |
| [ISSUE-018](ISSUE-018-mutual-friends-count-truncates-silently-at-1000.md) | Medium | `UsersService` | Mutual friends count truncates silently at 1,000 |
| [ISSUE-019](ISSUE-019-profile-work-education-update-deletes-entries-without-transaction.md) | High | `UsersService` | Work / education update deletes entries without a transaction |
| [ISSUE-020](ISSUE-020-profile-images-use-raw-img-tag-bypassing-nextjs-validation.md) | Medium | `ProfileHeader` | Profile images use raw `<img>` bypassing Next.js domain validation |

---

### Second Audit Pass (2026-06-15) — ISSUE-021 to ISSUE-029

| ID | Severity | Component | Issue |
|----|----------|-----------|-------|
| [ISSUE-021](ISSUE-021-profile-image-upload-rejects-valid-formats-with-silent-error.md) | High | `ProfileHeader` · `UsersController` | Image upload rejects valid formats (HEIC, AVIF, BMP) with generic error |
| [ISSUE-022](ISSUE-022-cover-photo-placeholder-not-clickable-and-no-upload-feedback.md) | Critical | `ProfileHeader` | Cover photo placeholder not clickable; no loading feedback during upload |
| [ISSUE-023](ISSUE-023-user-posts-never-rendered-on-profile-posts-tab.md) | Critical | `ProfileView` | User posts never rendered on profile — Posts tab is a hardcoded placeholder |
| [ISSUE-024](ISSUE-024-profile-layout-and-ux-modernization-needed.md) | Medium | `ProfileHeader` · `ProfileView` · `ProfileTabs` | Profile layout and UX modernization needed |
| [ISSUE-025](ISSUE-025-activity-tab-silently-returns-empty-for-other-users-profiles.md) | Medium | `ActivityLogViewer` · `UsersController` | Activity tab silently shows empty state (403 masked) for other users |
| [ISSUE-026](ISSUE-026-bio-character-limit-set-to-101-instead-of-sensible-value.md) | Low | `ProfileEditForm` | Bio character limit set to 101 instead of a sensible value |
| [ISSUE-027](ISSUE-027-gender-field-defaults-to-female-when-value-is-null.md) | Medium | `ProfileView` | Gender field defaults to "female" when value is `null` |
| [ISSUE-028](ISSUE-028-profile-edit-form-uses-different-visual-theme-from-profile-view.md) | Medium | `ProfileEditForm` | Profile edit form uses different visual theme from profile view |
| [ISSUE-029](ISSUE-029-profile-view-shows-not-found-message-on-api-errors.md) | Medium | `ProfileView` | Profile view shows "not found" message on all API errors, including network failures |

---

## Fix Priority

### P0 — Must fix before any public profile feature is usable
| Issue | Why |
|-------|-----|
| ISSUE-023 | Posts tab is the primary content of any social profile |
| ISSUE-022 | Cover upload is a core action; placeholder is not clickable |
| ISSUE-011 | Clicking names does nothing — basic social navigation broken |

### P1 — Fix before production release
| Issue | Why |
|-------|-----|
| ISSUE-019 | Data loss risk: profile work history can be permanently deleted |
| ISSUE-021 | iPhone HEIC photos silently fail with no guidance |
| ISSUE-027 | Incorrectly displays gender as female — wrong on a matchmaking platform |
| ISSUE-008 | Private completion metric visible to all visitors |
| ISSUE-025 | Activity tab is deceptive — shows empty instead of "private" |

### P2 — Fix before wide rollout
| Issue | Why |
|-------|-----|
| ISSUE-012 | Friends / Photos / Videos tabs all "coming soon" |
| ISSUE-010 | Username leaks email prefix (privacy) |
| ISSUE-009 | Message button goes nowhere specific |
| ISSUE-029 | Network errors look like missing profiles |
| ISSUE-024 | Layout feels unfinished |
| ISSUE-028 | Edit form looks like a different app |
| ISSUE-018 | Mutual friends count wrong for power users |
| ISSUE-020 | Raw `<img>` tag (security) |

### P3 — Quality improvements
| Issue | Why |
|-------|-----|
| ISSUE-013 | Tab order vs default mismatch |
| ISSUE-015 | Random match score bars |
| ISSUE-016 | Avatar missing in PostCard |
| ISSUE-017 | Photo/video pagination broken |
| ISSUE-026 | Bio limit too short |
| ISSUE-014 | Dead menu actions |
