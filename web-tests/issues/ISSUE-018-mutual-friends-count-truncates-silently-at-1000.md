# ISSUE-018: mutual friends count truncates silently at 1000

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Route / Page** | `/profile/[id]` |
| **Type** | Bug / Performance |
| **Component** | `UsersService` |
| **File** | `backend/src/users/services/users.service.ts:161-162` |
| **Status** | Open |

## Full location
- backend/src/users/services/users.service.ts
- `getMutualFriendsCount()` private method — lines 160-168

## Description
`getMutualFriendsCount` fetches up to 1000 friends per user into application memory and computes the intersection in JavaScript. For users with more than 1000 friends, the result is silently wrong (under-counted) because pagination cuts off at 1000.

Additionally, loading potentially thousands of user objects into memory on every profile view is a performance concern under load.

## Failure details
```ts
// users.service.ts lines 161-162 — loads up to 1000 friends in memory
private async getMutualFriendsCount(userId: string, viewerId: string): Promise<number> {
  const userFriends = await this.friendsService.getFriends(userId, 1, 1000);   // ← truncated at 1000
  const viewerFriends = await this.friendsService.getFriends(viewerId, 1, 1000); // ← truncated at 1000

  const userFriendIds = new Set(userFriends.data.map(f => f.id));
  const mutualCount = viewerFriends.data.filter(f => userFriendIds.has(f.id)).length;

  return mutualCount; // ← wrong if either user has > 1000 friends
}
```

## Expected behaviour
The mutual friend count should be accurate regardless of friend list size, and should not load large object arrays into memory. A SQL `COUNT` with a self-join on the friends table is the correct approach.

## Fix
Replace the in-memory calculation with a database-level count:
```ts
private async getMutualFriendsCount(userId: string, viewerId: string): Promise<number> {
  // Use a subquery to count mutual friends at the DB level
  const result = await this.friendsRepo
    .createQueryBuilder('f1')
    .select('COUNT(*)', 'count')
    .innerJoin(
      'friends',
      'f2',
      'f2.userId = :viewerId AND f2.friendId = f1.friendId AND f2.status = :status',
      { viewerId, status: 'accepted' },
    )
    .where('f1.userId = :userId', { userId })
    .andWhere('f1.status = :status', { status: 'accepted' })
    .getRawOne();
  return parseInt(result?.count ?? '0', 10);
}
```

> Code-review finding — not yet fixed.
