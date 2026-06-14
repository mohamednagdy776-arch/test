# ISSUE-008: profile completion bar visible on other users profiles

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Route / Page** | `/profile/[id]` |
| **Type** | Bug |
| **Component** | `ProfileHeader` |
| **File** | `web/src/features/profile/components/ProfileHeader.tsx:258` |
| **Status** | Open |

## Full location
- web/src/features/profile/components/ProfileHeader.tsx
- ProfileHeader component
- `<ProfileCompletion profile={profile} />` — rendered unconditionally

## Description
The profile completion progress bar ("اكتمال الملف الشخصي") is rendered for every profile view, including when a logged-in user views **someone else's** profile. This exposes a private metric (how complete the other person's profile is) to any visitor.

The `isSelf` prop is passed into `ProfileHeader` but is never used to guard the `ProfileCompletion` component at the bottom of the card.

## Failure details
```
// ProfileHeader.tsx line 258 — always renders regardless of isSelf
<ProfileCompletion profile={profile} />

// isSelf prop is received but never checked before this render:
export const ProfileHeader = ({
  profile, onEdit, isSelf = false, ...
}: Props) => {
  ...
  return (
    <div ...>
      ...
      <ProfileCompletion profile={profile} />  {/* ← missing isSelf guard */}
    </div>
  );
};
```

## Steps to reproduce
1. Log in as any user.
2. Navigate to another user's profile at `/profile/{userId}`.
3. Observe the "اكتمال الملف الشخصي" (Profile completion) progress bar at the bottom of the header card.

## Expected behaviour
The completion bar is only shown when `isSelf === true` (viewing your own profile).

## Fix
```diff
- <ProfileCompletion profile={profile} />
+ {isSelf && <ProfileCompletion profile={profile} />}
```

> Code-review finding — not yet fixed.
