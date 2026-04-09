# Module 13 — Privacy & Settings

Backend module for user privacy controls, blocking management, and account settings.

## Features

### 13.1 Privacy Settings
- Default post audience (global default for new posts)
- Who can see your future posts / past posts
- Who can see your friends list
- Who can see profile picture, cover photo, and bio
- Who can tag you
- Search engine visibility toggle

### 13.2 Blocking Management
- Block list management (add/remove blocks)
- View blocked users
- Check if user is blocked

### 13.3 Account Settings (Routes Exist)
- Email address management
- Phone number management
- Password change
- Active sessions and remote logout
- Two-factor authentication
- Language and region preferences
- Notification preferences

## Entities

### PrivacySettings
| Field | Type | Default |
|-------|------|---------|
| whoCanSeePosts | Visibility | friends |
| whoCanSeeFriends | Visibility | friends |
| whoCanSendFriendRequests | Visibility | public |
| whoCanSeeProfilePicture | Visibility | public |
| whoCanSeeCoverPhoto | Visibility | public |
| whoCanSeeBio | Visibility | public |
| whoCanTagMe | Visibility | friends |
| allowSearchEngines | boolean | true |

### Block
| Field | Type |
|-------|------|
| id | uuid |
| blocker | User |
| blocked | User |
| blockedAt | Date |

## Visibility Options

- `public` — Everyone
- `friends` — Friends only
- `friends_of_friends` — Friends of friends
- `only_me` — Only yourself

## API Endpoints

### Privacy Settings

```
GET    /settings/privacy
PATCH  /settings/privacy
```

**Request Body (Patch)**
```json
{
  "whoCanSeePosts": "friends",
  "whoCanSeeFriends": "public",
  "whoCanSendFriendRequests": "friends_of_friends",
  "whoCanSeeProfilePicture": "public",
  "whoCanSeeCoverPhoto": "friends",
  "whoCanSeeBio": "public",
  "whoCanTagMe": "friends",
  "allowSearchEngines": true
}
```

### Blocking

```
GET    /blocks
POST   /blocks
DELETE /blocks/:id
```

**Request Body (Post)**
```json
{
  "blockedUserId": "uuid-of-user-to-block"
}
```

## Module Structure

```
settings/
├── settings.module.ts
├── controllers/
│   └── settings.controller.ts
├── services/
│   └── settings.service.ts
├── entities/
│   ├── privacy-settings.entity.ts
│   └── block.entity.ts
└── dto/
    └── update-privacy.dto.ts
```

## Dependencies

- `@nestjs/typeorm` — Database ORM
- `typeorm` — Entity management
- `class-validator` — DTO validation
- `AuthGuard('jwt')` — Authentication middleware
