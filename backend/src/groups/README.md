# Groups Module

Social group functionality with support for Public, Private, and Secret group types.

## Features

- **Group Types**: Public, Private, Secret
- **Group Creation**: Create groups with name, description, and privacy setting
- **Join/Leave**: Members can join public groups and leave any group
- **Member Roles**: Basic role management (Admin via roles decorator)
- **Group Posts/Comments**: Not implemented in current version
- **Member Management**: View group members, pagination support
- **Ban**: Not implemented in current version
- **Group Settings**: Privacy settings (public/private)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/groups` | Create a new group |
| GET | `/groups` | List all groups (paginated) |
| GET | `/groups/search` | Search groups by name/description |
| GET | `/groups/autocomplete` | Autocomplete group names |
| GET | `/groups/my` | Get user's joined groups |
| GET | `/groups/:id` | Get group details |
| POST | `/groups/:id/join` | Join a group |
| DELETE | `/groups/:id/leave` | Leave a group |
| GET | `/groups/:id/members` | Get group members |
| DELETE | `/groups/:id` | Delete group (admin only) |

## Entities

### Group
```typescript
{
  id: string;           // UUID
  name: string;
  description?: string;
  privacy: 'public' | 'private';
  createdBy: User;
  createdAt: Date;
}
```

### GroupMember
```typescript
{
  id: string;           // UUID
  group: Group;
  user: User;
  joinedAt: Date;
}
```

## DTO

### CreateGroupDto
```typescript
{
  name: string;           // Required
  description?: string;    // Optional
  privacy?: 'public' | 'private';  // Default: 'public'
}
```

## Guards

- `AuthGuard('jwt')` - All endpoints require authentication
- `RolesGuard` with `@Roles('admin')` - Delete endpoint only

## Service Methods

- `create(dto, user)` - Create group and auto-join creator
- `findAll(page, limit)` - Paginated group list
- `search(query, userId)` - Search with joined/other separation
- `autocomplete(query)` - Quick name search
- `findOne(groupId, userId)` - Group details with membership status
- `join(groupId, user)` - Join a group
- `leave(groupId, userId)` - Leave a group
- `getMyGroups(userId)` - User's groups
- `getMembers(groupId, page, limit)` - Paginated members
- `delete(groupId)` - Delete group and members