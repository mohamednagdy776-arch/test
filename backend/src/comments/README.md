# Module 5 — Comments & Reactions

## Overview

This module handles comment and reaction functionality for posts. It supports nested comments (up to 2 levels) and 6 reaction types.

## Features

### Implemented

| Feature | Status | Description |
|---------|--------|-------------|
| Create Comment | ✅ | Add comments to posts |
| Nested Comments | ✅ | Reply to comments (max 2 levels: post → comment → reply) |
| Edit Comment | ✅ | Update comment content with "Edited" indicator |
| Delete Comment | ✅ | Remove comments |
| 6 Reaction Types | ✅ | Like, Love, Haha, Wow, Sad, Angry |
| Reaction Toggle | ✅ | Add/remove reactions (same type removes) |
| Reaction Count | ✅ | Get total reaction count |
| Reaction Breakdown | ✅ | Get count per reaction type |
| Pin Comment | ✅ | Post author can pin one comment per post |

### To Implement

| Feature | Priority | Description |
|---------|----------|-------------|
| Rich Text | Medium | Support bold, italic, @mention, emoji in comment content |
| Report Comment | Medium | Allow users to report inappropriate comments |
| Reaction Users List | Low | List of users who reacted (filterable by type) |
| Reaction Notification | Low | Notify post author on first reaction of each type |

## API Endpoints

### Comments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/posts/:postId/comments` | Create a comment | ✅ |
| GET | `/posts/:postId/comments` | Get all comments for a post | ✅ |
| PATCH | `/posts/:postId/comments/:commentId` | Update a comment | ✅ |
| DELETE | `/posts/:postId/comments/:commentId` | Delete a comment | ✅ |
| POST | `/posts/:postId/comments/:commentId/pin` | Pin/unpin a comment | ✅ |

### Reactions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/posts/:postId/comments/:commentId/reactions` | Add/remove reaction | ✅ |
| GET | `/posts/:postId/comments/:commentId/reactions` | Get all reactions with breakdown | ✅ |
| GET | `/posts/:postId/comments/:commentId/reactions/me` | Get current user's reaction | ✅ |

## Request/Response Formats

### Create Comment

```typescript
// POST /posts/:postId/comments
// DTO: CreateCommentDto
{
  content: string;        // Comment text
  parentId?: string;      // Optional: ID of parent comment for replies
}

// Response
{
  success: true,
  data: { ...Comment },
  message: "Comment added"
}
```

### Update Comment

```typescript
// PATCH /posts/:postId/comments/:commentId
// DTO: UpdateCommentDto
{
  content: string;        // New comment text
}

// Response
{
  success: true,
  data: { ...Comment },
  message: "Comment updated"
}
```

Note: The `editedAt` field is automatically set when updating.

### React to Comment

```typescript
// POST /posts/:postId/comments/:commentId/reactions
// DTO: ReactToCommentDto
{
  type: "like" | "love" | "haha" | "wow" | "sad" | "angry";
}

// Response
{
  success: true,
  data: {
    reacted: boolean;     // true if added, false if removed
    type: string | null;  // Current reaction type
  },
  message: "Reaction added" | "Reaction removed"
}
```

### Get Reactions

```typescript
// GET /posts/:postId/comments/:commentId/reactions
// Response
{
  success: true,
  data: {
    reactions: CommentReaction[];
    counts: {
      like: number;
      love: number;
      haha: number;
      wow: number;
      sad: number;
      angry: number;
    };
    total: number;
  }
}
```

### Pin Comment

```typescript
// POST /posts/:postId/comments/:commentId/pin
// DTO: PinCommentDto
{
  isPinned: boolean;
}

// Response
{
  success: true,
  data: { ...Comment },
  message: "Comment pinned" | "Comment unpinned"
}
```

## Entities

### Comment Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| postId | UUID | Reference to the post |
| userId | UUID | Reference to the author |
| parentId | UUID? | Reference to parent comment (for replies) |
| content | string | Comment text |
| isPinned | boolean | Whether comment is pinned |
| editedAt | Date? | Timestamp when last edited |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |

### CommentReaction Entity

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| commentId | UUID | Reference to the comment |
| userId | UUID | Reference to the reacting user |
| type | enum | Reaction type (LIKE, LOVE, HAHA, WOW, SAD, ANGRY) |
| createdAt | Date | Reaction timestamp |

## Reaction Types Enum

```typescript
enum CommentReactionType {
  LIKE = 'like',
  LOVE = 'love',
  HAHA = 'haha',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry',
}
```

## Nested Comments Structure

Comments are returned in a nested structure:

```typescript
[
  {
    id: "comment-1",
    content: "Main comment",
    user: { ...User },
    isPinned: true,
    editedAt: null,
    createdAt: "...",
    replies: [
      {
        id: "comment-2",
        content: "Reply to main comment",
        user: { ...User },
        parentId: "comment-1",
        isPinned: false,
        editedAt: null,
        createdAt: "...",
        replies: []
      }
    ]
  }
]
```

## Usage Notes

- Comments are sorted by: pinned first, then by creation date (ascending)
- Only the post author can pin/unpin comments
- Only the comment author can edit or delete their comments
- Reacting with the same type twice removes the reaction
- Each user can have only one reaction per comment
