# Pages Module

This module provides functionality for creating and managing social pages that users can follow.

## Features

### Page Creation
- Users can create public or private pages with a name, description, and category
- The page creator automatically follows their own page

### Page Follow
- Users can follow/unfollow pages
- Check if currently following a page
- View follower count

### Page Discovery
- List all pages with pagination
- Get pages the current user follows
- Get single page details with follower count and follow status

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/pages` | Create a new page |
| GET | `/pages` | List all pages (paginated) |
| GET | `/pages/my` | Get pages user follows |
| GET | `/pages/:id` | Get page details |
| POST | `/pages/:id/follow` | Follow a page |
| DELETE | `/pages/:id/follow` | Unfollow a page |

## Entities

### Page
```typescript
{
  id: string;
  name: string;
  description?: string;
  category?: string;
  privacy: 'public' | 'private';
  createdBy: User;
  createdAt: Date;
}
```

### PageFollower
```typescript
{
  id: string;
  page: Page;
  user: User;
  followedAt: Date;
}
```

## DTOs

### CreatePageDto
```typescript
{
  name: string;           // Required
  description?: string;   // Optional
  category?: string;     // Optional
  privacy?: 'public' | 'private';  // Default: 'public'
}
```

## Usage Example

```bash
# Create a page
curl -X POST /pages \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "My Page", "description": "A test page", "category": "Technology"}'

# Follow a page
curl -X POST /pages/:id/follow \
  -H "Authorization: Bearer <token>"

# Get your followed pages
curl -X GET /pages/my \
  -H "Authorization: Bearer <token>"
```

## Not Yet Implemented

- Page admin management (owner controls)
- Post as page functionality
- Invite friends to like a page