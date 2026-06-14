# ISSUE-026: bio character limit set to 101 instead of sensible value

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Category** | Bug / UX |
| **Route / Page** | `/profile` (edit form) |
| **Component** | `ProfileEditForm` |
| **File** | `web/src/features/profile/components/ProfileEditForm.tsx:94,96` |
| **Status** | Open |

## Description

The bio textarea in the profile edit form has `maxLength={101}`. 101 is almost certainly a typo for 100 or a mistake — the counter beneath it displays "0/101" which looks like a bug to any user. More importantly, 101 characters is far too short for a meaningful bio on a social platform; most platforms allow 150–500 characters for a personal bio.

## Current Behavior

- The bio field accepts a maximum of 101 characters.
- The character counter below the textarea reads "{n}/101".
- Users with meaningful profiles cannot write more than two short sentences.
- The unusual limit is not explained or communicated elsewhere in the app.

## Expected Behavior

- The bio limit should be a round, user-friendly number (e.g. 300 or 500 characters).
- The counter should read "{n}/500" (or whatever the chosen limit is).
- The backend profile entity and DTO should be updated to match.

## Affected Files

```
web/src/features/profile/components/ProfileEditForm.tsx
  Line 94:  maxLength={101}          ← likely a typo for 100; should be 300-500
  Line 96:  <p>{form.bio?.length || 0}/101</p>   ← counter shows the wrong limit

backend/src/users/entities/profile.entity.ts
  (bio column length should be verified to match the new frontend limit)
```

## Suggested Fix

```diff
// ProfileEditForm.tsx line 94-96
- <textarea value={form.bio} ... maxLength={101} ... />
- <p className="text-xs text-gray-400 mt-1">{form.bio?.length || 0}/101</p>
+ <textarea value={form.bio} ... maxLength={500} ... />
+ <p className="text-xs text-gray-400 mt-1">{form.bio?.length || 0}/500</p>
```

Also verify/update the backend entity column definition:
```ts
// profile.entity.ts — ensure bio column supports the new max
@Column({ nullable: true, length: 500 })
bio: string;
```

## Notes

- This is likely an off-by-one typo (101 vs 100) that was then accepted as-is. Regardless, 100 or 101 characters is too short for a bio field on a matchmaking platform where users need to express their personality and values.
