# News Feed & Posts Module

## Module Number: 3 & 4

## Description
This module handles the news feed with ranked/chronological feeds, post creation with multiple types (text, photo, video, link, poll), stories, and content management features.

## clone-prompt.md Reference
- Lines: 87-121 (Module 3 — News Feed)
- Lines: 124-161 (Module 4 — Posts & Content Creation)

## Implemented Features

### 3.1 Feed Algorithm
- Ranked feed mixing: friends', group, page posts ✅
- Factors: recency, engagement, relationship closeness ✅
- "Most Recent" toggle for chronological feed ✅
- No sponsored/promoted posts ✅

### 3.2 Post Types
- Text posts (with background color/pattern) ✅
- Photo posts (single or multiple) ✅
- Video posts ✅
- Link previews (auto-generated) ✅
- Shared posts ✅
- Life events ❌
- Check-ins ❌
- Poll posts ✅

### 3.3 Feed Interactions
- Like ✅
- Reactions (Love, Haha, Wow, Sad, Angry) ✅
- Comment with nested replies ✅
- Share (to timeline, to friend, to group) ✅
- Save post (bookmarks) ✅
- Not interested / Snooze / Unfollow ✅
- Report post ✅

### 3.4 Stories
- Create stories: photo, video, text ✅
- Stories visible for 24 hours ✅
- Story viewer list (who viewed) ✅
- Reply to story (sends as DM) ✅
- Story highlights ❌
- Mute stories ❌

### 4.1 Post Composer
- Rich text input with emoji picker ✅
- Tag people (@mention) ✅
- Add location (check-in) ❌
- Feeling/Activity selector ❌
- Audience selector ✅
- Schedule post ❌
- Photo/video attachment ✅
- Background color/pattern selector ✅

### 4.2 Post Management
- Edit post ✅
- Delete post ✅
- Pin post to profile ❌
- Turn off commenting ✅
- Move to archive ❌
- Download media ❌

### 4.3 Media Upload
- Photos: JPEG, PNG, WEBP ✅
- Videos: MP4, MOV ✅
- Auto-generate video thumbnail ✅
- Image compression (Sharp.js) ✅
- Alt text for images ❌
- Photo albums ❌

### 4.4 Polls
- Create poll with question + options ❌
- Poll duration settings ❌
- Anonymous voting ❌
- Real-time vote updates ❌
- Voters list ❌

## API Endpoints

### Implemented
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/v1/feed | Ranked feed | ✅ |
| GET | /api/v1/feed/recent | Chronological feed | ✅ |
| GET | /api/v1/stories | Get stories | ✅ |
| POST | /api/v1/stories | Create story | ✅ |
| DELETE | /api/v1/stories/:id | Delete story | ✅ |
| POST | /api/v1/stories/:id/view | Log view | ✅ |
| GET | /api/v1/posts | Get posts | ✅ |
| POST | /api/v1/posts | Create post | ✅ |
| GET | /api/v1/posts/:id | Get single post | ✅ |
| PATCH | /api/v1/posts/:id | Update post | ✅ |
| DELETE | /api/v1/posts/:id | Delete post | ✅ |
| POST | /api/v1/posts/:id/like | Like post | ✅ |
| DELETE | /api/v1/posts/:id/like | Unlike post | ✅ |
| POST | /api/v1/posts/:id/react | React to post | ✅ |
| POST | /api/v1/posts/:id/comment | Comment on post | ✅ |
| GET | /api/v1/posts/:id/comments | Get comments | ✅ |
| POST | /api/v1/posts/:id/share | Share post | ✅ |
| POST | /api/v1/posts/:id/save | Save post | ✅ |
| DELETE | /api/v1/posts/:id/save | Unsave post | ✅ |
| POST | /api/v1/posts/:id/report | Report post | ✅ |
| POST | /api/v1/posts/upload | Upload media | ✅ |
| POST | /api/v1/posts/:id/media | Upload media to post | ✅ |

### To Implement
| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | /api/v1/feed/recent | Chronological feed | ✅ |
| GET | /api/v1/stories/:id/viewers | Get story viewers | ✅ |
| POST | /api/v1/stories/:id/highlight | Create highlight | ✅ |
| GET | /api/v1/highlights | Get highlights | ✅ |
| POST | /api/v1/posts/:id/poll/:optionId/vote | Vote on poll | ✅ |
| POST | /api/v1/posts/:id/checkin | Add check-in | ❌ |
| POST | /api/v1/posts/:id/feeling | Add feeling/activity | ✅ |
| POST | /api/v1/posts/:id/pin | Pin post | ✅ |
| DELETE | /api/v1/posts/:id/pin | Unpin post | ✅ |
| POST | /api/v1/posts/:id/commentsettings | Disable comments | ✅ |
| POST | /api/v1/posts/:id/archive | Archive post | ✅ |
| GET | /api/v1/posts/:id/download | Download media | ❌ |
| POST | /api/v1/posts/:id/schedule | Schedule post | ✅ |
| GET | /api/v1/scheduled | Get scheduled posts | ✅ |

## Implementation Notes

### Backend Status
- Feed controller provides ranked and chronological feeds
- Posts service handles CRUD operations
- Stories service manages 24-hour stories
- Media upload with compression implemented
- Reactions system fully implemented
- Comments with nested replies implemented

### Frontend Status
- Feed page displays ranked posts
- Post composer allows text, photo, video
- Stories UI implemented (create, view)
- Reactions UI implemented
- Comments UI implemented

### Gaps
1. Chronological "Most Recent" feed toggle
2. Story viewer list
3. Story highlights
4. Life events posts
5. Check-ins with map integration
6. Poll posts with voting
7. Feeling/Activity tags
8. Post pinning
9. Post archiving
10. Media download
11. Post scheduling
12. Alt text for images
13. Photo albums

(End of file)
