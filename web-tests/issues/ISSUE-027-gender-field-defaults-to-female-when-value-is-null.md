# ISSUE-027: gender field defaults to female when value is null or undefined

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Bug |
| **Route / Page** | `/profile`, `/profile/[id]` (About tab) |
| **Component** | `ProfileView` |
| **File** | `web/src/features/profile/components/ProfileView.tsx:105` |
| **Status** | Open |

## Description

The "About" section in the profile view uses a ternary comparison to display the user's gender:

```tsx
['الجنس', profile.gender === 'male' ? 'ذكر' : 'أنثى'],
```

If `profile.gender` is `null`, `undefined`, or any value other than `'male'`, the ternary falls through to `'أنثى'` (Female). This means any user who has not set their gender — or whose gender could not be loaded — is incorrectly displayed as female in their public profile.

On a marriage matchmaking platform where gender is a central matching criterion, misrepresenting a user's gender is a significant correctness bug.

## Current Behavior

- A newly registered user who has not filled in their profile sees "أنثى" (Female) for the Gender field.
- Any profile where `gender` is `null` or has an unexpected value is shown as female.

## Expected Behavior

- If `profile.gender === 'male'`, show "ذكر".
- If `profile.gender === 'female'`, show "أنثى".
- If `profile.gender` is `null`, `undefined`, or anything else, show "—" (not set).

## Affected Files

```
web/src/features/profile/components/ProfileView.tsx
  Line 105:
  ['الجنس', profile.gender === 'male' ? 'ذكر' : 'أنثى'],
  //                                             ^^^^^ wrong fallback — should be '—'
```

## Suggested Fix

```diff
- ['الجنس', profile.gender === 'male' ? 'ذكر' : 'أنثى'],
+ ['الجنس', profile.gender === 'male' ? 'ذكر' : profile.gender === 'female' ? 'أنثى' : '—'],
```

Or using a helper map for clarity:
```tsx
const genderLabel: Record<string, string> = { male: 'ذكر', female: 'أنثى' };
['الجنس', genderLabel[profile.gender] ?? '—'],
```

## Notes

- The `ProfileEditForm` correctly limits gender selection to `['male', 'ذكر']` and `['female', 'أنثى']` via a `<select>`. However, newly registered users may not have completed the edit form, leaving `gender` as `null` in the database until they do.
- The backend `getProfile` service at `users.service.ts:60` can return `gender: user.gender ?? null` for users without a profile row, confirming that `null` is a valid value in the system.
