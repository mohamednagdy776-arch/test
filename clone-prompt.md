# Facebook Clone — Full User Features Prompt
### Stack: Next.js (React) · Node.js · PostgreSQL
### Scope: All user-facing features — no ads, no payments, no monetization

---

## MASTER SYSTEM PROMPT

You are an expert full-stack developer. Your task is to build a feature-complete social media platform that replicates all user-facing functionality of Facebook. The project uses your current following stack


Do NOT implement anything related to: advertising, payments, billing, boosted posts, marketplace transactions, or any monetization feature.

---

## MODULE 1 — AUTHENTICATION & ACCOUNT MANAGEMENT

### 1.1 Registration
- Full name, email, password, date of birth, gender (male/female/custom)
- Email verification flow with tokenized confirmation link (expires in 24h)
- Password strength validation (min 8 chars, mixed case, number, symbol)
- Check for duplicate emails before account creation
- Store hashed passwords using bcrypt (salt rounds: 12)

### 1.2 Login
- Email + password login
- OAuth login via Google and GitHub (NextAuth.js providers)
- "Remember me" toggle (extend session to 30 days vs default 1 day)
- Failed login attempt tracking — lock account for 15 min after 5 failures
- Redirect to intended page after login

### 1.3 Account Recovery
- "Forgot password" flow: enter email → receive reset link (expires 1h)
- Token-based password reset with CSRF protection
- Confirmation email after successful password change
- Option to recover via linked phone number (OTP, optional)

### 1.4 Session & Security
- JWT access tokens (15 min expiry) + refresh tokens (7 days) stored in httpOnly cookies
- Active sessions list (device name, browser, IP, last active)
- Ability to revoke individual sessions or all sessions except current
- Two-factor authentication (TOTP via authenticator app)
- Login notifications via email for new device logins

### 1.5 Account Deactivation & Deletion
- Deactivation: hides profile and content, preservable data, re-activatable by logging back in
- Deletion: 30-day grace period before permanent removal, confirmation email sent
- Download your data feature (export JSON of posts, friends, messages)

---

## MODULE 2 — USER PROFILE

### 2.1 Profile Page (`/[username]` or `/profile/[id]`)
- Cover photo (upload, reposition, remove)
- Profile picture (upload, crop circular, remove)
- Display name, username (unique handle), bio (max 101 chars)
- Location (city/country), website URL, workplace, education (school, degree, year)
- Relationship status (single, in a relationship, engaged, married, etc.)
- Join date and "Friends in common" count for non-self viewers
- Intro section with configurable visibility per field (public/friends/only me)

### 2.2 Profile Tabs
- **Posts**: timeline of the user's posts and tagged posts
- **About**: detailed info (work, education, places lived, contact info, basic info)
- **Friends**: list of friends with mutual friend count, searchable
- **Photos**: grid of all uploaded photos, organized by albums
- **Videos**: grid of all uploaded videos
- **Check-ins**: places the user has checked in
- **More**: books, music, movies, sports, likes (pages liked)

### 2.3 Profile Editing
- Inline editing for each section (click to edit, save/cancel)
- Field-level privacy controls (who can see each info field)
- Work entries: company, position, city, description, start/end date, current job toggle
- Education entries: school, degree, field of study, start/end year
- Life events: first job, moved cities, got married, had a child, etc.

### 2.4 Activity Log
- Full chronological log of all user actions (posts, likes, comments, tags, friend adds)
- Filter by year, category (posts, photos, videos, likes, comments)
- Hide or delete individual items from profile/timeline
- Review tags before they appear on your timeline (tag review toggle)

---

## MODULE 3 — NEWS FEED

### 3.1 Feed Algorithm
- Ranked feed mixing: friends' posts, group posts, page posts, shared content
- Factors: recency, engagement (likes/comments/shares), relationship closeness, media type
- "Most Recent" toggle to see strictly chronological feed
- No sponsored/promoted posts (excluded entirely)

### 3.2 Post Types in Feed
- Text posts (with optional background color/pattern selector)
- Photo posts (single or multiple images with captions)
- Video posts (uploaded video with thumbnail selector)
- Link previews (auto-generated from URL using Open Graph metadata)
- Shared posts (with added commentary)
- Life events
- Check-ins
- Poll posts
- "Feeling/Activity" tagged posts

### 3.3 Feed Interactions
- Like (and full reaction set: Love, Haha, Wow, Sad, Angry)
- Comment (with nested replies up to 2 levels deep)
- Share (to timeline, to a friend, to a group, copy link)
- Save post (bookmarks)
- "Not interested" / Snooze for 30 days / Unfollow
- Report post

### 3.4 Stories
- Create stories: photo, video (max 20s), text with background
- Stories visible for 24 hours then auto-archived
- Story viewer list (who viewed your story)
- Reply to a story (sends as DM)
- Story highlights: save stories to permanent highlight collections on profile
- Mute someone's stories without unfriending

---

## MODULE 4 — POSTS & CONTENT CREATION

### 4.1 Post Composer
- Rich text input with emoji picker
- Tag people (@mention autocomplete from friends list)
- Add location (check-in with map pin via Google Maps / Mapbox API)
- Feeling/Activity selector (happy, sad, excited + activity subcategories)
- Audience selector: Public / Friends / Friends except... / Specific friends / Only me / Custom
- Schedule post (set future date/time for auto-publish)
- Photo/video attachment with drag-and-drop
- Background color/pattern selector for text-only posts

### 4.2 Post Management
- Edit post (with "Edited" label showing, edit history viewable by viewer)
- Delete post (soft delete, removed from all feeds immediately)
- Pin post to top of profile
- Turn off commenting on a specific post
- Move to archive (hidden from timeline but stored)
- Download photo/video from your own post

### 4.3 Media Upload
- Photos: JPEG, PNG, WEBP — max 25MB per file, up to 50 per post
- Videos: MP4, MOV — max 4GB, up to 240 min
- Auto-generate video thumbnail at multiple timestamps (user selects)
- Image compression and resizing on upload (via Sharp.js server-side)
- Alt text input for images (accessibility)
- Photo albums: create named albums, add/remove photos, set album cover

### 4.4 Polls
- Create poll with question + up to 4 options
- Set poll duration (1 day, 1 week, custom)
- Anonymous vs named voting option
- Real-time vote count update via Socket.IO
- Voters list visible to post author

---

## MODULE 5 — COMMENTS & REACTIONS

### 5.1 Comments
- Nested comments (post → comment → reply, max 2 levels)
- Rich text in comments: bold, italic, @mention, emoji
- Edit comment (with "Edited" indicator)
- Delete comment
- Like a comment (same 6 reactions)
- Pin a comment on your own post (1 pinned comment max)
- Report a comment

### 5.2 Reactions
- 6 reactions: Like 👍, Love ❤️, Haha 😂, Wow 😮, Sad 😢, Angry 😡
- Reaction picker on hover/long-press
- Reaction count breakdown (e.g., "128 reactions: 80 Like, 30 Love, 18 Haha")
- List of who reacted (filterable by reaction type)
- Notification to post author for first reaction of each type per post

---

## MODULE 6 — FRIENDS & CONNECTIONS

### 6.1 Friend Requests
- Send friend request
- Accept / Decline / Delete request
- Cancel sent request
- "People you may know" suggestions (based on mutual friends, location, workplace, school)
- "People you may know" uses collaborative filtering algorithm

### 6.2 Friend Management
- Friends list with search
- Unfriend
- Follow / Unfollow (see or stop seeing posts without unfriending)
- Block user (hides both profiles from each other, removes friendship, cancels pending requests)
- Restrict user (they can only see public posts, can't see when you're active)
- Add to Close Friends list (separate content audience option)
- Categorize into Friend Lists (custom lists for audience targeting)

### 6.3 Following
- Follow non-friends (see their public posts in your feed)
- Public figures / Pages can be followed without mutual approval
- Follower / Following counts on profile

### 6.4 Friend Requests Privacy
- Who can send you friend requests: Everyone / Friends of friends
- Who can see your friends list: Everyone / Friends / Only me

---

## MODULE 7 — MESSAGING (DIRECT MESSAGES)

### 7.1 Chat Interface
- Inbox with conversation list (sorted by most recent message)
- Unread message count badge
- Search conversations and people
- Message requests (messages from non-friends go here)
- Conversation preview (last message snippet + timestamp)

### 7.2 One-to-One Messaging
- Real-time messaging via Socket.IO
- Text messages with emoji support
- Send photos, videos, GIFs, voice notes, files (max 25MB)
- Sticker packs
- Reactions to individual messages (tap/hover to react with emoji)
- Reply to specific message (quoted reply threading)
- "Seen" receipts with timestamp
- Typing indicator ("John is typing...")
- Message delivered / seen status indicators

### 7.3 Group Chats
- Create group chat (up to 250 members)
- Group name and group photo
- Add / remove members (admin-only)
- Assign / remove admin roles
- Leave group
- Mute group notifications (for 1h, 8h, 24h, or until re-enabled)
- Mute / Archive / Delete conversation

### 7.4 Message Features
- Edit sent message (within 15 minutes, shows "Edited" label)
- Delete message for yourself / for everyone (within 10 minutes)
- Star/save important messages
- Forward message to another conversation
- Message search within a conversation
- Disappearing messages toggle (messages auto-delete after 24h / 7 days / 90 days)
- End-to-end encryption indicator (optional, configurable)

### 7.5 Video & Voice Calls (WebRTC)
- One-to-one voice call
- One-to-one video call
- Group video call (up to 8 participants)
- In-call controls: mute mic, disable camera, screen share, end call
- Missed call notification

---

## MODULE 8 — NOTIFICATIONS

### 8.1 Notification Types
- Friend request received
- Friend request accepted
- Someone liked / reacted to your post
- Someone commented on your post
- Someone replied to your comment
- Someone tagged you in a post or photo
- Someone shared your post
- Someone mentioned you in a post or comment
- Birthday reminders (friends' birthdays)
- Group invitations
- Event invitations
- Memory ("On this day") notification
- Someone viewed your story

### 8.2 Notification UI
- Bell icon with unread count badge
- Dropdown panel with grouped notifications (Today, Earlier, This Week)
- Mark all as read
- Click notification → navigate to relevant content
- Notification dot on specific content item until viewed

### 8.3 Notification Settings
- Per-type toggle (enable/disable each notification type)
- Per-channel settings: in-app, email, push (browser / mobile)
- Email digest frequency: immediately, daily summary, weekly summary, off
- Do Not Disturb schedule (e.g., 11pm–7am no notifications)

---

## MODULE 9 — GROUPS

### 9.1 Group Types
- Public group (visible and joinable by anyone)
- Private group (visible but requires approval to join)
- Secret group (not visible in search, invite-only)

### 9.2 Group Features
- Group name, description, cover photo, location, tags/topics
- Member list with roles (Admin, Moderator, Member)
- Group rules (admin-defined, shown at join time)
- Pin announcements
- Group feed (posts within the group)
- Group files section (shared documents/images)
- Group events (linked to Events module)
- Membership questions (up to 3 questions for approval-required groups)

### 9.3 Group Moderation
- Approve / decline join requests
- Approve / decline posts before they appear (admin toggle)
- Mute, remove, or ban members
- Remove or decline posts/comments
- Moderation activity log
- Report group to platform

### 9.4 Group Discovery
- "Groups you might like" suggestions
- Category-based browsing (Sports, Gaming, Technology, Local, etc.)
- Search groups by name or topic
- Groups joined listed on profile (configurable visibility)

---

## MODULE 10 — PAGES

### 10.1 Page Creation
- Create a page: name, category (Business, Artist, Public Figure, Community, etc.)
- Profile photo and cover photo
- Description, website URL, contact info, location, hours
- Username / vanity URL for the page

### 10.2 Page Features
- Post as the page (text, photo, video, poll)
- Page feed (posts by the page)
- Followers count
- "Like" and "Follow" a page (separate actions)
- Invite friends to like the page
- Page tabs: Posts, About, Photos, Videos, Reviews (optional), Events

### 10.3 Page Management
- Multiple admins/editors/moderators/analysts roles
- Page inbox (messages from followers)
- Post scheduling
- Page activity log

---

## MODULE 11 — EVENTS

### 11.1 Event Creation
- Event name, description, cover photo
- Date, time, timezone, end time (optional)
- Location (physical address via Maps API, or Online with URL)
- Privacy: Public / Friends / Private (invite-only)
- Co-hosts (other users as co-organizers)
- Recurring events (daily, weekly, monthly, custom)

### 11.2 Event Interactions
- RSVP: Going / Interested / Not Going
- Guest list viewable (public events: everyone; private: only guests)
- Invite friends to event
- Event discussion wall (posts visible to RSVP'd guests)
- Event reminders: 1 week before, 1 day before, 1 hour before
- "Events near me" discovery (location-based)
- Calendar export (ICS file download)

---

## MODULE 12 — SEARCH

### 12.1 Global Search
- Search across: people, pages, groups, events, posts, photos, videos, places
- Autocomplete suggestions as user types (debounced, 300ms)
- Recent searches (stored locally + server-side, clearable)
- Filter by category tabs (All, People, Photos, Videos, Posts, Pages, Groups, Events)

### 12.2 Search Results
- People results: name, mutual friends, shared groups/pages, Follow / Add Friend button
- Post results: full post preview, sortable by date or relevance
- Photo/Video results: grid view with post context on click
- Group/Page results: follower count, join/like button
- Location/Place results: map pin, address, linked events

### 12.3 Search Filters
- Date range filter for posts
- Posted by: anyone / friends / pages
- Tagged location filter

---

## MODULE 13 — PRIVACY & SETTINGS

### 13.1 Privacy Settings
- Default post audience (global default for new posts)
- Who can see your future posts / past posts (retroactive audience update)
- Who can see your friends list
- Who can see pages, groups, events you're part of
- Who can look you up by email / phone number
- Who can send you friend requests
- Do you want search engines to link to your profile? (toggle)
- Profile visibility to non-logged-in users

### 13.2 Blocking & Restricting
- Block list management (add/remove blocks)
- Restricted list management
- See what your profile looks like to a specific person (view as)
- View as: Public (logged out), or specific friend

### 13.3 Timeline & Tagging
- Who can post on your timeline
- Review posts before they appear on your timeline
- Review tags before they appear on your profile
- Who can see posts you're tagged in on your timeline
- Who can see what others post on your timeline

### 13.4 Account Settings
- Email address management (add / remove / set primary)
- Phone number (add / remove)
- Password change
- Connected apps (OAuth apps granted access — revoke individually)
- Active sessions list and remote logout
- Two-factor authentication setup / disable
- Language and region preferences
- Accessibility settings (font size, contrast, motion reduction)
- Notification preferences (see Module 8)

### 13.5 Off-Facebook Activity (Data Transparency)
- List of apps/websites that shared your activity with the platform
- Clear off-platform activity history
- Disconnect future off-platform activity from account

---

## MODULE 14 — MEMORIES & ARCHIVE

### 14.1 On This Day
- Daily digest: posts, photos, friend anniversaries from past years
- React to a memory (share it as a new post or story)
- Hide a memory (never show again)
- Mute memories from a specific time period

### 14.2 Saved Items (Bookmarks)
- Save any post, photo, video, or link
- Organize saved items into named collections (e.g., "Recipes", "Travel")
- Access saved items from sidebar
- Remove from saved

### 14.3 Archive
- Moved posts stored privately (not visible to others)
- Story archive (all past stories stored permanently)
- Browse and restore archived posts back to timeline

---

## MODULE 15 — WATCH (VIDEO HUB)

### 15.1 Video Feed
- Dedicated video discovery feed
- Suggested videos based on watch history and interests
- "Continue watching" section
- Videos from followed pages/people prioritized

### 15.2 Video Playback
- Inline autoplay in feed (muted, unmutes on click)
- Full-screen mode
- Playback speed control (0.5x, 1x, 1.25x, 1.5x, 2x)
- Auto-generated captions (via speech-to-text API)
- Chapter markers (if video includes timestamps in description)
- Like, comment, share on video player

### 15.3 Live Video
- Go live (webcam/screen via WebRTC)
- Live viewer count
- Real-time comments on live stream
- Live reactions (floating emoji overlay)
- Save live video to profile after broadcast ends
- Schedule a live video in advance

---

## DATABASE SCHEMA (PostgreSQL / Prisma)

```prisma
// Core models — expand per module above

model User {
  id             String    @id @default(uuid())
  email          String    @unique
  username       String    @unique
  passwordHash   String
  firstName      String
  lastName       String
  dob            DateTime
  gender         String
  bio            String?
  avatarUrl      String?
  coverUrl       String?
  isVerified     Boolean   @default(false)
  isDeactivated  Boolean   @default(false)
  deletedAt      DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  posts          Post[]
  sentRequests   FriendRequest[]  @relation("Sender")
  receivedReqs   FriendRequest[]  @relation("Receiver")
  friendshipsA   Friendship[]     @relation("UserA")
  friendshipsB   Friendship[]     @relation("UserB")
  notifications  Notification[]
  sessions       Session[]
  sentMessages   Message[]        @relation("Sender")
  groupMembers   GroupMember[]
  eventRsvps     EventRsvp[]
  reactions      Reaction[]
  comments       Comment[]
  stories        Story[]
  savedPosts     SavedPost[]
  blocks         Block[]          @relation("Blocker")
  blockedBy      Block[]          @relation("Blocked")
}

model Post {
  id           String    @id @default(uuid())
  authorId     String
  content      String?
  audience     Audience  @default(FRIENDS)
  bgColor      String?
  isPinned     Boolean   @default(false)
  isArchived   Boolean   @default(false)
  scheduledAt  DateTime?
  location     String?
  feeling      String?
  editedAt     DateTime?
  createdAt    DateTime  @default(now())
  deletedAt    DateTime?

  author       User        @relation(fields: [authorId], references: [id])
  media        PostMedia[]
  reactions    Reaction[]
  comments     Comment[]
  shares       Share[]
  tags         PostTag[]
  poll         Poll?
}

enum Audience {
  PUBLIC
  FRIENDS
  FRIENDS_EXCEPT
  SPECIFIC_FRIENDS
  ONLY_ME
  CUSTOM
}

model Friendship {
  id        String   @id @default(uuid())
  userAId   String
  userBId   String
  createdAt DateTime @default(now())
  userA     User     @relation("UserA", fields: [userAId], references: [id])
  userB     User     @relation("UserB", fields: [userBId], references: [id])
  @@unique([userAId, userBId])
}

model FriendRequest {
  id         String   @id @default(uuid())
  senderId   String
  receiverId String
  status     RequestStatus @default(PENDING)
  createdAt  DateTime @default(now())
  sender     User     @relation("Sender", fields: [senderId], references: [id])
  receiver   User     @relation("Receiver", fields: [receiverId], references: [id])
}

enum RequestStatus { PENDING ACCEPTED DECLINED }

model Message {
  id             String    @id @default(uuid())
  conversationId String
  senderId       String
  content        String?
  mediaUrl       String?
  replyToId      String?
  isEdited       Boolean   @default(false)
  deletedForAll  Boolean   @default(false)
  createdAt      DateTime  @default(now())
  editedAt       DateTime?
  sender         User         @relation("Sender", fields: [senderId], references: [id])
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  reactions      MessageReaction[]
}

model Conversation {
  id          String    @id @default(uuid())
  isGroup     Boolean   @default(false)
  name        String?
  avatarUrl   String?
  createdAt   DateTime  @default(now())
  messages    Message[]
  participants ConversationParticipant[]
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  actorId   String?
  entityId  String?
  entityType String?
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())
  user      User             @relation(fields: [userId], references: [id])
}

model Group {
  id          String      @id @default(uuid())
  name        String
  description String?
  coverUrl    String?
  privacy     GroupPrivacy @default(PUBLIC)
  createdAt   DateTime    @default(now())
  members     GroupMember[]
  posts       Post[]
}

enum GroupPrivacy { PUBLIC PRIVATE SECRET }

model Event {
  id          String    @id @default(uuid())
  name        String
  description String?
  coverUrl    String?
  startAt     DateTime
  endAt       DateTime?
  location    String?
  isOnline    Boolean   @default(false)
  onlineUrl   String?
  privacy     EventPrivacy @default(PUBLIC)
  hostId      String
  createdAt   DateTime  @default(now())
  rsvps       EventRsvp[]
}

enum EventPrivacy { PUBLIC FRIENDS PRIVATE }
```

---

## API ROUTES STRUCTURE (Next.js App Router)

```
/api/auth/[...nextauth]       → NextAuth.js handlers
/api/auth/register            → POST: create account
/api/auth/verify-email        → GET: confirm email token
/api/auth/forgot-password     → POST: send reset link
/api/auth/reset-password      → POST: reset with token

/api/users/[id]               → GET profile, PATCH update, DELETE account
/api/users/[id]/friends       → GET friends list
/api/users/[id]/follow        → POST follow, DELETE unfollow
/api/users/[id]/block         → POST block, DELETE unblock
/api/users/search             → GET search users

/api/posts                    → GET feed, POST create post
/api/posts/[id]               → GET, PATCH, DELETE
/api/posts/[id]/reactions     → GET, POST, DELETE
/api/posts/[id]/comments      → GET, POST
/api/posts/[id]/share         → POST
/api/posts/[id]/save          → POST, DELETE

/api/comments/[id]            → PATCH, DELETE
/api/comments/[id]/reactions  → GET, POST, DELETE

/api/friends/requests         → GET list, POST send request
/api/friends/requests/[id]    → PATCH accept/decline, DELETE cancel

/api/conversations            → GET list, POST create
/api/conversations/[id]       → GET, PATCH (name/avatar)
/api/conversations/[id]/messages → GET history, POST send
/api/messages/[id]            → PATCH edit, DELETE

/api/notifications            → GET list, PATCH mark all read
/api/notifications/[id]       → PATCH mark read

/api/groups                   → GET discover, POST create
/api/groups/[id]              → GET, PATCH, DELETE
/api/groups/[id]/members      → GET, POST join, DELETE leave
/api/groups/[id]/posts        → GET, POST

/api/pages                    → GET, POST create
/api/pages/[id]               → GET, PATCH, DELETE
/api/pages/[id]/follow        → POST, DELETE

/api/events                   → GET discover, POST create
/api/events/[id]              → GET, PATCH, DELETE
/api/events/[id]/rsvp         → POST going/interested/decline

/api/stories                  → GET feed, POST create
/api/stories/[id]             → GET, DELETE
/api/stories/[id]/view        → POST (log view)

/api/search                   → GET with ?q=&type=&page=

/api/upload                   → POST (media upload → S3/Cloudinary)

/api/settings/privacy         → GET, PATCH
/api/settings/notifications   → GET, PATCH
/api/settings/sessions        → GET list, DELETE [id]
/api/settings/2fa             → GET status, POST enable, DELETE disable

/api/memories                 → GET "on this day"
/api/saved                    → GET collections, POST save
/api/saved/[id]               → DELETE
```

---

## REAL-TIME EVENTS (Socket.IO)

```
// Server emits to user room: `user:{userId}`
new_message          → { conversationId, message }
message_seen         → { conversationId, messageId, seenAt }
message_reaction     → { messageId, reaction }
typing_start         → { conversationId, userId }
typing_stop          → { conversationId, userId }
new_notification     → { notification }
friend_request       → { from, requestId }
friend_accepted      → { userId }
post_reaction        → { postId, reaction, count }
live_viewer_count    → { streamId, count }
live_comment         → { streamId, comment }
call_incoming        → { from, callId, type: 'video'|'voice' }
call_ended           → { callId }
```

---

## FRONTEND PAGES / ROUTES (Next.js App Router)

```
/                          → Feed (authenticated)
/login                     → Login page
/register                  → Registration page
/forgot-password           → Password recovery
/reset-password/[token]    → Reset form

/[username]                → Profile page
/[username]/friends        → Friends list
/[username]/photos         → Photo grid
/[username]/videos         → Video grid

/messages                  → Inbox
/messages/[conversationId] → Chat thread

/notifications             → All notifications

/groups                    → Groups discovery
/groups/[id]               → Group page
/groups/[id]/members       → Members list
/groups/create             → Create group

/pages/[id]                → Page view
/pages/create              → Create page

/events                    → Events discovery
/events/[id]               → Event page
/events/create             → Create event

/watch                     → Video hub
/watch/[videoId]           → Video player

/search                    → Search results

/memories                  → On this day
/saved                     → Saved items

/settings                  → Account settings
/settings/privacy          → Privacy settings
/settings/notifications    → Notification settings
/settings/security         → Security & sessions
/settings/activity-log     → Activity log
```

---

## KEY IMPLEMENTATION NOTES

1. **Feed pagination**: Use cursor-based pagination (not offset) for infinite scroll. Use Redis to cache the ranked feed per user, invalidated on new posts from friends.

2. **Mutual friends calculation**: Precompute and cache friend-of-friend overlap using PostgreSQL CTEs or a materialized view for "people you may know."

3. **Notification fan-out**: For high-engagement posts, use a queue (Bull/BullMQ with Redis) to fan out notifications asynchronously rather than inline with the like/comment action.

4. **Media processing**: After upload to S3, trigger a Lambda / background job (via BullMQ) to generate thumbnails, transcode video to HLS (via FFmpeg), and extract dominant color for skeleton loaders.

5. **Privacy enforcement**: Create a `canView(viewerId, ownerId, contentAudience)` utility function that all feed and profile queries route through. Never expose content before checking this gate.

6. **Search**: Use PostgreSQL `tsvector` + `tsquery` with GIN indexes for full-text search. Add `pg_trgm` extension for fuzzy matching on names.

7. **WebRTC calls**: Use a STUN/TURN server (coturn, or Twilio STUN/TURN) for NAT traversal. Signaling via Socket.IO rooms.

8. **Rate limiting**: Apply per-route rate limits using `express-rate-limit` backed by Redis. Stricter limits on auth endpoints, message sending, and friend requests.

9. **Soft deletes**: Never hard-delete user content. Use `deletedAt` timestamps. Implement a cron job to permanently purge accounts flagged for deletion after the 30-day grace period.

10. **Indexes**: Add composite indexes on `(authorId, createdAt DESC)` for profile feeds, `(conversationId, createdAt DESC)` for messages, and `(userId, isRead, createdAt DESC)` for notifications.
```

---

*End of prompt — paste this into your AI assistant or use it as a project specification document.*
