# ISSUE-017: getPhotos and getVideos always return total zero

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Route / Page** | `/profile/[id]` (Photos / Videos tabs) |
| **Type** | Bug |
| **Component** | `UsersService` |
| **File** | `backend/src/users/services/users.service.ts:317,327` |
| **Status** | Open |

## Full location
- backend/src/users/services/users.service.ts
- `getPhotos()` method — line 317
- `getVideos()` method — line 327

## Description
Both `getPhotos` and `getVideos` hardcode `total: 0` and `totalPages: 0` in their return value, even after successfully fetching a page of activity records. Any client-side pagination logic based on these fields will conclude there are 0 items and 0 pages regardless of actual data.

## Failure details
```ts
// users.service.ts line 310-318
async getPhotos(userId: string, page = 1, limit = 20) {
  const activities = await this.activityRepo.find({
    where: { userId, type: 'photo' as any },
    order: { createdAt: 'DESC' },
    skip: (page - 1) * limit,
    take: limit,
  });
  return { data: activities, total: 0, page, totalPages: 0 }; // ← hardcoded zeros
}

// users.service.ts line 320-328
async getVideos(userId: string, page = 1, limit = 20) {
  const activities = await this.activityRepo.find({ ... });
  return { data: activities, total: 0, page, totalPages: 0 }; // ← hardcoded zeros
}
```

## Steps to reproduce
1. Upload photos or videos so activity log entries of type `photo`/`video` exist.
2. Call `GET /users/:id/photos` or `GET /users/:id/videos`.
3. Observe: `total` is `0` and `totalPages` is `0` in the response even when `data` contains items.

## Expected behaviour
`total` and `totalPages` should reflect the actual count of matching records.

## Fix
Switch to `findAndCount` to get the real count in a single query:
```diff
- const activities = await this.activityRepo.find({ where: ..., skip, take });
- return { data: activities, total: 0, page, totalPages: 0 };
+ const [activities, total] = await this.activityRepo.findAndCount({ where: ..., skip, take });
+ return { data: activities, total, page, totalPages: Math.ceil(total / limit) };
```

> Code-review finding — not yet fixed.
