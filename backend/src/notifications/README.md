# Notifications Module

This module handles user notifications in the application.

## Features

### Notification Types
- **friend_request**: When another user sends a friend request
- **friend_accepted**: When a friend request is accepted
- **like**: When someone likes your post
- **comment**: When someone comments on your post
- **tag**: When someone tags you in a post/comment
- **share**: When someone shares your content
- **mention**: When you are mentioned in a post or comment
- **birthday**: Birthday notifications
- **group_invite**: When invited to join a group
- **event_invite**: When invited to an event
- **memory**: Memory notifications
- **story_view**: When someone views your story

### Current Implementation
- RESTful API for notification management
- Real-time notification delivery (Socket.IO integration in progress)
- Pagination support for notification listing
- Mark as read / Mark all as read functionality

### Upcoming Features
- **Real-time notifications** via Socket.IO
- **Notification settings** (per-type toggles)
- **Email digest** (daily/weekly)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | Get all notifications for current user |
| GET | `/notifications/unread-count` | Get count of unread notifications |
| POST | `/notifications` | Create a notification |
| PATCH | `/notifications/:id/read` | Mark a notification as read |
| PATCH | `/notifications/read-all` | Mark all notifications as read |
| DELETE | `/notifications/:id` | Delete a notification |

## Entity

```typescript
Notification {
  id: string;
  user: User;
  type: NotificationType;
  message: string;
  entityType?: string;
  entityId?: string;
  readStatus: boolean;
  createdAt: Date;
}
```

## Module Structure

```
notifications/
├── controllers/
│   └── notifications.controller.ts
├── dto/
│   └── create-notification.dto.ts
├── entities/
│   └── notification.entity.ts
├── services/
│   └── notifications.service.ts
└── notifications.module.ts
```