# Module 12: Search

## Overview

Search module provides full-text search capabilities across the platform, enabling users to find users, posts, groups, pages, and events.

## Features

### 12.1 Global Search
- Search across: people, pages, groups, events, posts
- Autocomplete suggestions as user types (debounced, 300ms)
- Recent searches (stored server-side, clearable)
- Filter by category tabs (All, People, Posts, Pages, Groups, Events)

### 12.2 Search Results
- **People**: name, avatar, username
- **Posts**: content preview, creation date, author info
- **Groups**: name, description, privacy settings
- **Pages**: name, description, category
- **Events**: title, description, start date, location

### 12.3 Search Filters
- Date range filter for posts
- Posted by: anyone / friends / pages
- Tagged location filter

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q=<query>` | Global search across all entities |

### Request
```
GET /search?q=john HTTP/1.1
Authorization: Bearer <jwt_token>
```

### Response
```json
{
  "success": true,
  "data": {
    "users": [...],
    "posts": [...],
    "groups": [...],
    "pages": [...],
    "events": [...]
  }
}
```

## Implementation Details

### Module Structure
```
search/
├── search.module.ts        # NestJS module configuration
├── controllers/
│   └── search.controller.ts    # API endpoints
└── services/
    └── search.service.ts    # Search logic
```

### Search Service
The `SearchService` performs parallel queries across all entities using TypeORM query builders with ILIKE for case-insensitive matching:
- Users: searched by firstName, lastName, username
- Posts: searched by content
- Groups: searched by name, description
- Pages: searched by name, description
- Events: searched by title, description, location

### Authentication
All search endpoints require JWT authentication via `AuthGuard('jwt')`.

## Database Indexes

For optimal search performance, consider adding:
- GIN indexes with `pg_trgm` extension for fuzzy matching
- Full-text search using PostgreSQL `tsvector` + `tsquery`

## Future Enhancements
- Recent search history storage
- Search suggestions/autocomplete endpoint
- Advanced filters (date range, posted by, location)
- Relevance scoring and sorting
- Search analytics