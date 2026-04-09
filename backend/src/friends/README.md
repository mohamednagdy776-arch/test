# Module 6: Friends & Connections

## Overview

This module handles all social connection features including friend requests, friend management, follow/unfollow functionality, blocking, restrictions, and friend lists.

## Table of Contents

- [Friend Requests](#friend-requests)
- [Friend Management](#friend-management)
- [Follow/Unfollow](#followunfollow)
- [Block/Unblock](#blockunblock)
- [User Restrictions](#user-restrictions)
- [Friend Lists](#friend-lists)
- [People You May Know](#people-you-may-know)
- [Privacy Settings](#privacy-settings)
- [API Endpoints](#api-endpoints)
- [Implementation Status](#implementation-status)

---

## Features

### Friend Requests

#### Send Friend Request
Create a new friend request to another user.

- **Endpoint**: `POST /friends/request`
- **Body**: `{ "userId": "uuid" }`
- **Status**: ✅ Implemented
- **Validations**:
  - Cannot send request to yourself
  - Cannot send if request already exists
  - Cannot send if either user has blocked the other

#### Accept Friend Request
Accept a pending friend request.

- **Endpoint**: `POST /friends/request/:requestId/accept`
- **Status**: ✅ Implemented

#### Decline Friend Request
Decline a pending friend request.

- **Endpoint**: `POST /friends/request/:requestId/decline`
- **Status**: ✅ Implemented

#### Cancel Sent Request
Cancel a friend request you sent (before it's accepted/declined).

- **Endpoint**: `DELETE /friends/request/:requestId`
- **Status**: ✅ Implemented

#### Get Pending Requests
Retrieve all incoming friend requests.

- **Endpoint**: `GET /friends/requests`
- **Status**: ✅ Implemented
- **Response**: Array of pending requests with requester details

#### Get Sent Requests
Retrieve all sent friend requests.

- **Endpoint**: `GET /friends/requests/sent`
- **Status**: ✅ Implemented

---

### Friend Management

#### Get Friends List
Retrieve user's friends with pagination.

- **Endpoint**: `GET /friends/list`
- **Query Params**: `page`, `limit`
- **Status**: ✅ Implemented
- **Response**: Paginated list of friends

#### Unfriend
Remove a user from friends list.

- **Endpoint**: `DELETE /friends/:userId`
- **Status**: ✅ Implemented

#### Get Friendship Status
Check friendship status with another user.

- **Endpoint**: `GET /friends/status/:userId`
- **Status**: ✅ Implemented
- **Response**: `{ status: "pending" | "accepted" | "declined" | "blocked" | "none", id?: string }`

---

### Follow/Unfollow

Follow a user to see their public posts in your feed without being friends.

#### Follow User
- **Endpoint**: `POST /friends/follow/:userId`
- **Status**: ✅ Implemented

#### Unfollow User
- **Endpoint**: `DELETE /friends/follow/:userId`
- **Status**: ✅ Implemented

**Note**: Current implementation uses the same underlying friendship mechanism. Consider splitting into separate Follow entity for proper separation of concerns.

---

### Block/Unblock

Block a user to hide both profiles from each other, remove friendship, and cancel pending requests.

#### Block User
- **Endpoint**: `POST /friends/block`
- **Body**: `{ "userId": "uuid" }`
- **Status**: ✅ Implemented
- **Effects**:
  - Creates block record
  - Removes existing friendships
  - Cancels pending friend requests

#### Unblock User
- **Endpoint**: `DELETE /friends/block/:userId`
- **Status**: ✅ Implemented
- **Effects**: Removes block record

---

### User Restrictions

Restrict a user to limit their visibility of your content.

#### Restrict User
- **Endpoint**: `POST /friends/restrict`
- **Body**: 
  ```json
  {
    "userId": "uuid",
    "restrictPosts": true,
    "restrictMessages": true
  }
  ```
- **Status**: ✅ Implemented

#### Unrestrict User
- **Endpoint**: `DELETE /friends/restrict/:userId`
- **Status**: ✅ Implemented

---

### Friend Lists

Create and manage custom friend lists for audience targeting.

#### Create Friend List
- **Endpoint**: `POST /friends/lists`
- **Body**:
  ```json
  {
    "name": "string",
    "type": "close_friends" | "acquaintances" | "family" | "custom"
  }
  ```
- **Status**: ✅ Implemented
- **Types**:
  - `CLOSE_FRIENDS` - For close friends audience
  - `ACQUAINTANCES` - For casual contacts
  - `FAMILY` - For family members
  - `CUSTOM` - Custom user-defined lists

#### Get Friend Lists
- **Endpoint**: `GET /friends/lists`
- **Status**: ✅ Implemented

#### Update Friend List
- **Endpoint**: `PATCH /friends/lists/:listId`
- **Body**:
  ```json
  {
    "name": "string",
    "memberIds": ["uuid1", "uuid2"]
  }
  ```
- **Status**: ✅ Implemented

#### Delete Friend List
- **Endpoint**: `DELETE /friends/lists/:listId`
- **Status**: ✅ Implemented

---

### People You May Know

Get friend suggestions based on mutual friends.

- **Endpoint**: `GET /friends/suggestions`
- **Query Params**: `limit` (default: 10)
- **Status**: ✅ Implemented
- **Algorithm**: Counts mutual friends and returns users with most mutual connections

---

### Privacy Settings

#### Friend Request Privacy (Who Can Send Friend Requests)
- **Feature**: Control who can send you friend requests
- **Options**: `everyone` | `friends_of_friends`
- **Status**: ❌ Not Implemented

#### Friends List Privacy (Who Can See Your Friends List)
- **Feature**: Control who can see your friends list
- **Options**: `everyone` | `friends` | `only_me`
- **Status**: ❌ Not Implemented

---

## API Endpoints Summary

| Method | Endpoint | Feature | Status |
|--------|----------|---------|--------|
| POST | `/friends/request` | Send friend request | ✅ |
| POST | `/friends/request/:requestId/accept` | Accept request | ✅ |
| POST | `/friends/request/:requestId/decline` | Decline request | ✅ |
| DELETE | `/friends/request/:requestId` | Cancel request | ✅ |
| GET | `/friends/requests` | Get pending requests | ✅ |
| GET | `/friends/requests/sent` | Get sent requests | ✅ |
| GET | `/friends/list` | Get friends list | ✅ |
| DELETE | `/friends/:userId` | Unfriend | ✅ |
| GET | `/friends/status/:userId` | Get friendship status | ✅ |
| POST | `/friends/follow/:userId` | Follow user | ✅ |
| DELETE | `/friends/follow/:userId` | Unfollow user | ✅ |
| POST | `/friends/block` | Block user | ✅ |
| DELETE | `/friends/block/:userId` | Unblock user | ✅ |
| POST | `/friends/restrict` | Restrict user | ✅ |
| DELETE | `/friends/restrict/:userId` | Unrestrict user | ✅ |
| GET | `/friends/lists` | Get friend lists | ✅ |
| POST | `/friends/lists` | Create friend list | ✅ |
| PATCH | `/friends/lists/:listId` | Update friend list | ✅ |
| DELETE | `/friends/lists/:listId` | Delete friend list | ✅ |
| GET | `/friends/suggestions` | Get suggestions | ✅ |

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Send friend request | ✅ Complete | |
| Accept request | ✅ Complete | |
| Decline request | ✅ Complete | |
| Cancel request | ✅ Complete | |
| Friends list | ✅ Complete | With pagination |
| Unfriend | ✅ Complete | |
| Follow/Unfollow | ✅ Complete | Uses friendship entity |
| Block/Unblock | ✅ Complete | Also removes friendships |
| Restrict user | ✅ Complete | |
| Close Friends list | ✅ Complete | Via FriendListType |
| Custom Friend Lists | ✅ Complete | |
| People you may know | ✅ Complete | Mutual friend algorithm |
| Blocked user count | ✅ Complete | Helper method exists |
| Follower/Following counts | ⚠️ Partial | Available via service |
| Friends list privacy | ❌ Not Implemented | |
| Friend request privacy | ❌ Not Implemented | |

---

## Entities

### Friendship Entity
- `id`: UUID (primary key)
- `requesterId`: FK to User
- `addresseeId`: FK to User
- `status`: PENDING | ACCEPTED | DECLINED | BLOCKED
- `createdAt`, `updatedAt`, `deletedAt`

### FriendList Entity
- `id`: UUID (primary key)
- `userId`: FK to User
- `name`: string
- `type`: CLOSE_FRIENDS | ACQUAINTANCES | FAMILY | CUSTOM
- `memberIds`: string[]

### UserBlock Entity
- `id`: UUID (primary key)
- `blockerId`: FK to User
- `blockedId`: FK to User

### UserRestriction Entity
- `id`: UUID (primary key)
- `userId`: FK to User
- `restrictedId`: FK to User
- `restrictPosts`: boolean
- `restrictMessages`: boolean

---

## Usage Examples

### Send Friend Request
```bash
curl -X POST http://localhost:3000/friends/request \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"userId": "target-user-uuid"}'
```

### Get Friends List
```bash
curl -X GET "http://localhost:3000/friends/list?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

### Get Suggestions
```bash
curl -X GET "http://localhost:3000/friends/suggestions?limit=5" \
  -H "Authorization: Bearer <token>"
```

---

## Notes

- All endpoints require JWT authentication
- Pagination uses `page` (default: 1) and `limit` (default: 20) query parameters
- Blocked users cannot send/receive friend requests
- Blocking automatically removes existing friendships and pending requests
- Follow functionality currently shares the Friendship entity; consider refactoring to separate Follows table