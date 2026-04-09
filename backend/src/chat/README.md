# Module 7 - Messaging

Real-time messaging module supporting direct messages, group chats, and WebRTC audio/video calls.

## Features

- One-to-one and group messaging
- Real-time message delivery via Socket.IO
- Message reactions, replies, forwarding
- Read receipts and typing indicators
- Message editing and deletion
- Starred messages
- Group management (add/remove members, roles, mute)
- Disappearing messages
- Voice/video calls (WebRTC - separate implementation)

## Architecture

```
chat/
├── chat.module.ts           # NestJS module definition
├── chat.gateway.ts      # Socket.IO WebSocket gateway
├── controllers/
│   └── chat.controller.ts   # REST API endpoints
├── services/
│   └── chat.service.ts   # Business logic
├── entities/
│   ├── conversation.entity.ts
│   ├── message.entity.ts
│   ├── message-reaction.entity.ts
│   └── conversation-participant.entity.ts
└── dto/
    ├── send-message.dto.ts
    ├── message.dto.ts
    ├── group.dto.ts
    └── create-conversation.dto.ts
```

## REST API Endpoints

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/conversations` | Get all conversations for user |
| GET | `/chat/conversations/:conversationId/messages` | Get messages in conversation |
| GET | `/chat/unread` | Get unread message count |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/messages` | Send a new message |
| PUT | `/chat/messages/:messageId` | Edit message (within 15 min) |
| DELETE | `/chat/messages/:messageId` | Delete message |
| POST | `/chat/messages/:messageId/reactions` | Add reaction to message |
| DELETE | `/chat/messages/:messageId/reactions` | Remove reaction |
| POST | `/chat/messages/:messageId/star` | Toggle star on message |
| POST | `/chat/messages/:messageId/forward` | Forward message to another conversation |
| GET | `/chat/messages/:conversationId/search` | Search messages in conversation |

### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/groups` | Create a new group |
| PUT | `/chat/groups/:conversationId` | Update group info |
| POST | `/chat/groups/:conversationId/participants` | Add participant to group |
| DELETE | `/chat/groups/:conversationId/participants/:userId` | Remove participant |
| PUT | `/chat/groups/:conversationId/participants/:userId/role` | Update participant role |
| POST | `/chat/groups/:conversationId/leave` | Leave group |
| POST | `/chat/groups/:conversationId/mute` | Mute group notifications |
| POST | `/chat/groups/:conversationId/unmute` | Unmute group |
| POST | `/chat/groups/:conversationId/disappearing` | Toggle disappearing messages |

## Request/Response Examples

### Get Conversations

```bash
GET /chat/conversations
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Group Name",
      "avatar": null,
      "isGroup": true,
      "lastMessage": {
        "content": "Hello!",
        "createdAt": "2024-01-15T10:30:00Z",
        "senderId": "uuid"
      },
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Send Message

```bash
POST /chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversationId": "uuid",
  "content": "Hello, world!",
  "type": "text",
  "replyToId": "uuid (optional)",
  "mediaUrl": "url (optional)"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "conversationId": "uuid",
    "senderId": "uuid",
    "content": "Hello, world!",
    "type": "text",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Message sent"
}
```

### React to Message

```bash
POST /chat/messages/:messageId/reactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "emoji": "👍"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "emoji": "👍"
  },
  "message": "Reaction added"
}
```

### Create Group

```bash
POST /chat/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Group",
  "participantIds": ["uuid1", "uuid2", "uuid3"]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "My Group"
  },
  "message": "Group created"
}
```

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `joinConversation` | `{ conversationId, userId }` | Join conversation room |
| `leaveConversation` | `{ conversationId }` | Leave conversation room |
| `sendMessage` | `{ conversationId, senderId, content, type?, replyToId?, mediaUrl? }` | Send message in real-time |
| `typing` | `{ conversationId, userId, isTyping }` | Send typing indicator |
| `markSeen` | `{ conversationId, userId, messageId }` | Mark message as seen |
| `addReaction` | `{ messageId, userId, emoji }` | Add reaction |
| `removeReaction` | `{ messageId, userId }` | Remove reaction |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `newMessage` | `{ id, conversationId, content, type, senderId, replyToId, mediaUrl, createdAt }` | New message received |
| `userTyping` | `{ conversationId, userId, isTyping }` | User typing indicator |
| `messageSeen` | `{ conversationId, userId, messageId, seenAt }` | Message seen receipt |
| `reactionAdded` | `{ messageId, emoji, userId }` | Reaction added |
| `reactionRemoved` | `{ messageId, userId }` | Reaction removed |

### Socket.IO Rooms

- Room format: `conversation:{conversationId}`
- Used for broadcasting messages to all participants in a conversation

## Message Types

Supported message types (enum `MessageType`):
- `TEXT` - Plain text messages
- `IMAGE` - Image messages
- `VIDEO` - Video messages
- `FILE` - File attachments
- `VOICE` - Voice notes

## Conversation Types

Supported conversation types (enum `ConversationType`):
- `ONE_TO_ONE` - Direct messages between two users
- `GROUP` - Group chats with multiple members

## Data Models

### Conversation Entity

```typescript
{
  id: string;           // UUID
  type: ConversationType;
  name: string;        // Group name (null for 1:1)
  avatar: string;     // Group avatar URL
  createdBy: User;
  isGroup: boolean;
  disappearingMode: boolean;
  createdAt: Date;
  deletedAt: Date;
}
```

### Message Entity

```typescript
{
  id: string;                    // UUID
  conversation: Conversation;
  sender: User;
  contentEncrypted: string;   // Encrypted content
  type: MessageType;
  mediaUrl: string;         // Media URL for media types
  replyToId: string;        // Parent message ID for replies
  isEdited: boolean;
  editedAt: Date;
  isDeletedForEveryone: boolean;
  isStarred: boolean;
  reactions: MessageReaction[];
  createdAt: Date;
  deletedAt: Date;
}
```

### MessageReaction Entity

```typescript
{
  id: string;
  message: Message;
  user: User;
  emoji: string;
}
```

## Business Rules

1. **Message Editing**: Messages can be edited within 15 minutes of sending. Edited messages display an "Edited" label.

2. **Message Deletion**: 
   - Delete for yourself: Available anytime
   - Delete for everyone: Only within 10 minutes of sending (creator only)

3. **Group Management**:
   - Maximum 250 members per group
   - Only admins can add/remove members
   - Only group creator can assign admin roles
   - Creator cannot leave without transferring ownership

4. **Disappearing Messages**:
   - Toggle available to group admins
   - When enabled, messages auto-delete after configured duration
   - Feature flag on conversation level

5. **Typing Indicators**: Real-time typing status broadcasted to conversation participants

6. **Read Receipts**: "Seen" status with timestamp when user views messages

## WebRTC Integration

Voice and video calls are implemented separately via WebRTC. The chat gateway does not handle call signaling - that's managed by a dedicated call gateway/service.

## Security

- All endpoints require JWT authentication via `AuthGuard('jwt')`
- Socket connections validated via `userId` from handshake query
- Participants verified before accessing conversation messages
- Content encrypted at rest (using `contentEncrypted` field)