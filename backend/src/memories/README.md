# Memories & Archive Module

This module handles user memories (past posts from same date) and saved items (bookmarks).

## Features

### On This Day (Memories)
Retrieves posts created by the user on the same date in previous years.

- **Endpoint**: `GET /memories`
- **Authentication**: Required (JWT)
- **Response**: Array of posts from the same date in past years (up to 1 year back)

### Saved Items (Bookmarks)
Allows users to save (bookmark) posts, comments, videos, and stories for later.

- **Save an item**: `POST /saved`
- **Get all saved items**: `GET /saved`
- **Remove saved item**: `DELETE /saved/:id`

#### DTO
```typescript
SaveItemDto {
  entityType: 'post' | 'comment' | 'video' | 'story';
  entityId: string;
}
```

### Archive
Archive functionality is planned but not yet implemented.

## File Structure

```
memories/
├── memories.module.ts          # Module definition
├── controllers/
│   ├── memories.controller.ts  # On This Day endpoints
│   └── saved.controller.ts     # Saved items endpoints
├── services/
│   ├── memory.service.ts       # Memory retrieval logic
│   └── saved.service.ts        # Save/unsave logic
├── entities/
│   └── saved-item.entity.ts    # SavedItem entity
└── dto/
    └── save-item.dto.ts        # Save item DTO
```

## Entity Types

- `post` - Blog posts
- `comment` - Comments
- `video` - Videos
- `story` - Stories