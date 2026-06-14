# ISSUE-019: profile work education update deletes entries without a transaction

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Route / Page** | `/profile` (edit form save) |
| **Type** | Bug / Data loss |
| **Component** | `UsersService` |
| **File** | `backend/src/users/services/users.service.ts:82-99` |
| **Status** | Open |

## Full location
- backend/src/users/services/users.service.ts
- `createProfile()` method — lines 79-99

## Description
When a user saves their profile with updated work or education entries, the service:

1. **Deletes** all existing work/education entries with `workRepo.delete(...)`.
2. Assigns the new entries to the profile object.
3. **Saves** the profile (which cascades the new entries).

If step 3 fails (e.g. a validation error, DB timeout, or constraint violation), step 1 has already permanently deleted the user's entire work and education history. There is no rollback because the two operations are not wrapped in a database transaction.

## Failure details
```ts
// users.service.ts lines 80-99 — delete then save, no transaction
if (profile) {
  Object.assign(profile, dto);

  if (dto.workEntries) {
    await this.workRepo.delete({ profile: { id: profile.id } }); // ← entries deleted
    profile.workEntries = dto.workEntries.map(w => {             // ← if save() throws below →
      const work = new ProfileWork();
      Object.assign(work, w);
      work.profile = profile!;
      return work;
    });
  }
  if (dto.educationEntries) {
    await this.eduRepo.delete({ profile: { id: profile.id } }); // ← entries deleted
    profile.educationEntries = dto.educationEntries.map(e => {
      const edu = new ProfileEducation();
      Object.assign(edu, e);
      edu.profile = profile!;
      return edu;
    });
  }
  return this.profilesRepo.save(profile); // ← if this throws, data is gone permanently
}
```

## Steps to reproduce
This is hard to trigger in normal usage, but can happen under:
- Database connection interruption mid-request.
- A constraint violation in the new entries (e.g. invalid `startDate` > `endDate`).
- A network timeout between the delete and the save.

## Expected behaviour
Both the delete and the subsequent save must succeed or both must be rolled back atomically. No data should be lost if any step fails.

## Fix
Wrap the entire update in a TypeORM `DataSource` transaction:
```ts
import { DataSource } from 'typeorm';

// Inject DataSource in constructor
constructor(private dataSource: DataSource, ...) {}

async createProfile(userId: string, dto: UpdateProfileWithEntriesDto) {
  return this.dataSource.transaction(async (manager) => {
    let profile = await manager.findOne(Profile, {
      where: { user: { id: userId } },
      relations: ['workEntries', 'educationEntries'],
    });
    if (profile) {
      Object.assign(profile, dto);
      if (dto.workEntries) {
        await manager.delete(ProfileWork, { profile: { id: profile.id } });
        profile.workEntries = dto.workEntries.map(w => Object.assign(new ProfileWork(), w, { profile }));
      }
      if (dto.educationEntries) {
        await manager.delete(ProfileEducation, { profile: { id: profile.id } });
        profile.educationEntries = dto.educationEntries.map(e => Object.assign(new ProfileEducation(), e, { profile }));
      }
      return manager.save(Profile, profile);
    }
    // ... create path
  });
}
```

> Code-review finding — not yet fixed.
