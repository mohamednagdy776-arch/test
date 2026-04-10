# Database Seed Documentation

This document provides comprehensive documentation for seeding the database with Egyptian-context sample data.

---

## Table of Contents

1. [Database Entities](#1-database-entities)
2. [Relationships](#2-relationships)
3. [Egyptian Context Seed Data Requirements](#3-egyptian-context-seed-data-requirements)
4. [Sample Data for Each Feature](#4-sample-data-for-each-feature)
5. [Quantity Recommendations](#5-quantity-recommendations)

---

## 1. Database Entities

### 1.1 Auth Module (Users)

#### User Entity (`users`)

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | UUID | Primary key | Yes |
| email | string | Unique email address | Yes |
| phone | string | Unique phone number | Yes |
| passwordHash | string | Hashed password | Yes |
| firstName | string | User's first name | No |
| lastName | string | User's last name | No |
| username | string | Unique username | No |
| fullName | string | Full name | No |
| dateOfBirth | date | Date of birth | No |
| gender | enum | male/female/custom | No |
| isVerified | boolean | Email verification status | No |
| isDeactivated | boolean | Account deactivation flag | No |
| verificationToken | string | Email verification token | No |
| verificationExpires | date | Token expiration | No |
| resetToken | string | Password reset token | No |
| resetTokenExpires | date | Reset token expiration | No |
| failedLoginAttempts | number | Failed login count | No |
| lockedUntil | date | Account lock until | No |
| totpSecret | string | TOTP secret for 2FA | No |
| twoFactorEnabled | boolean | 2FA enabled status | No |
| twoFactorVerified | boolean | 2FA verified status | No |
| accountType | string | user/guardian/agent/admin | No |
| oauthProvider | string | google/github | No |
| oauthId | string | OAuth ID | No |
| status | string | active/pending/banned | No |
| createdAt | timestamp | Creation date | No |
| deletedAt | timestamp | Soft delete date | No |

#### Session Entity (`sessions`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| refreshTokenHash | string | Refresh token hash |
| deviceName | string | Device identifier |
| browser | string | Browser info |
| ipAddress | string | IP address |
| lastActive | timestamp | Last activity |
| isActive | boolean | Active status |
| createdAt | timestamp | Creation date |

---

### 1.2 Users Module (Profiles)

#### Profile Entity (`profiles`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| fullName | string | Full display name |
| age | number | Age |
| gender | string | Gender |
| country | string | Country (default: Egypt) |
| city | string | City |
| socialStatus | string | Marital status |
| childrenCount | number | Number of children |
| avatarUrl | string | Profile picture URL |
| coverUrl | string | Cover photo URL |
| bio | string | Bio/About text |
| website | string | Personal website |
| relationshipStatus | string | Relationship status |
| location | string | Current location |
| workplace | string | Current workplace |
| introVisibility | string | public/friends/only_me |
| education | string | Education level |
| jobTitle | string | Job title |
| financialLevel | string | Financial level |
| culturalLevel | string | Cultural level |
| lifestyle | string | Lifestyle description |
| sect | string | Religious sect |
| prayerLevel | string | Prayer commitment level |
| religiousCommitment | string | Religious commitment |
| minAge | number | Min partner age preference |
| maxAge | number | Max partner age preference |
| preferredCountry | string | Preferred country |
| relocateWilling | boolean | Willing to relocate |
| wantsChildren | boolean | Wants children |
| createdAt | timestamp | Creation date |

#### ProfileWork Entity (`profile_work`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| profileId | UUID | Foreign key to Profile |
| company | string | Company name |
| position | string | Job position |
| city | string | Work city |
| description | string | Work description |
| startDate | string | Start date |
| endDate | string | End date |
| isCurrent | boolean | Current job |

#### ProfileEducation Entity (`profile_education`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| profileId | UUID | Foreign key to Profile |
| school | string | School/University name |
| degree | string | Degree obtained |
| fieldOfStudy | string | Field of study |
| startYear | string | Start year |
| endYear | string | End year |

#### ActivityLog Entity (`activity_log`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| type | enum | post/like/comment/tag/friend_add/photo/video |
| description | string | Activity description |
| metadata | jsonb | Additional metadata |
| targetId | string | Target entity ID |
| isHidden | boolean | Hidden from timeline |
| createdAt | timestamp | Creation date |

---

### 1.3 Posts Module

#### Post Entity (`posts`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| groupId | UUID | Foreign key to Group (optional) |
| userId | UUID | Foreign key to User |
| content | text | Post content |
| mediaUrl | string | Main media URL |
| mediaType | string | Media type |
| mediaUrls | string[] | Multiple media URLs |
| postType | enum | text/photo/video/link/shared/event/checkin/poll/feeling |
| audience | enum | public/friends/friends_of_friends/only_me/custom |
| bgColor | string | Background color for text posts |
| isPinned | boolean | Pinned post |
| isArchived | boolean | Archived |
| commentsDisabled | boolean | Disable comments |
| scheduledAt | timestamp | Scheduled publish time |
| location | string | Check-in location |
| feeling | string | Feeling/activity |
| editedAt | timestamp | Last edit time |
| linkUrl | string | Shared link URL |
| linkTitle | string | Link title |
| linkDescription | string | Link description |
| linkImage | string | Link preview image |
| pollOptions | jsonb | Poll options with votes |
| originalPostId | UUID | Original post for shared posts |
| createdAt | timestamp | Creation date |
| updatedAt | timestamp | Last update |
| deletedAt | timestamp | Soft delete |

#### Story Entity (`stories`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| mediaUrl | string | Story media URL |
| mediaType | string | image/video |
| thumbnailUrl | string | Thumbnail |
| text | string | Story text overlay |
| bgColor | string | Background color |
| duration | number | Story duration (seconds) |
| isArchived | boolean | Archived |
| viewCount | number | View count |
| createdAt | timestamp | Creation date |
| deletedAt | timestamp | Soft delete |

#### StoryView Entity (`story_views`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| storyId | UUID | Foreign key to Story |
| userId | UUID | Foreign key to User |
| viewedAt | timestamp | View timestamp |

#### StoryHighlight Entity (`story_highlights`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| name | string | Highlight name |
| coverUrl | string | Cover image |
| storyIds | string[] | Story IDs in highlight |
| createdAt | timestamp | Creation date |
| deletedAt | timestamp | Soft delete |

#### SavedPost Entity (`saved_posts`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| postId | UUID | Foreign key to Post |
| savedAt | timestamp | Save timestamp |
| deletedAt | timestamp | Soft delete |

#### PostReport Entity (`post_reports`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| reporterId | UUID | Foreign key to User |
| postId | UUID | Foreign key to Post |
| reason | string | Report reason |
| description | string | Additional details |
| status | string | pending/reviewed/resolved |
| createdAt | timestamp | Creation date |

#### HiddenPost Entity (`hidden_posts`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| postId | UUID | Foreign key to Post |
| hideType | string | not_interested/snooze/unfollow |
| snoozeUntil | timestamp | Snooze expiration |
| createdAt | timestamp | Creation date |

---

### 1.4 Comments Module

#### Comment Entity (`comments`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| postId | UUID | Foreign key to Post |
| userId | UUID | Foreign key to User |
| parentId | UUID | Parent comment ID (for replies) |
| content | string | Comment text |
| isPinned | boolean | Pinned comment |
| editedAt | timestamp | Last edit |
| createdAt | timestamp | Creation date |
| updatedAt | timestamp | Last update |

#### CommentReaction Entity (`comment_reactions`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| commentId | UUID | Foreign key to Comment |
| userId | UUID | Foreign key to User |
| type | enum | like/love/haha/wow/sad/angry |
| createdAt | timestamp | Creation date |

---

### 1.5 Reactions Module

#### Reaction Entity (`reactions`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| postId | UUID | Foreign key to Post |
| userId | UUID | Foreign key to User |
| type | string | like/love/support |
| createdAt | timestamp | Creation date |

---

### 1.6 Friends Module

#### Friendship Entity (`friendships`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| requesterId | UUID | Foreign key to User (sender) |
| addresseeId | UUID | Foreign key to User (receiver) |
| status | enum | pending/accepted/declined/blocked |
| createdAt | timestamp | Request date |
| updatedAt | timestamp | Last update |
| deletedAt | timestamp | Soft delete |

#### FriendList Entity (`friend_lists`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| name | string | List name |
| type | enum | close_friends/acquaintances/family/custom |
| memberIds | string[] | List member IDs |
| createdAt | timestamp | Creation date |
| updatedAt | timestamp | Last update |

#### UserBlock Entity (`user_blocks`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| blockerId | UUID | Blocker's user ID |
| blockedId | UUID | Blocked user's ID |
| createdAt | timestamp | Block date |

#### UserRestriction Entity (`user_restrictions`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | User applying restriction |
| restrictedId | UUID | Restricted user ID |
| restrictPosts | boolean | Hide posts |
| restrictMessages | boolean | Block messages |
| createdAt | timestamp | Creation date |

---

### 1.7 Chat Module (Conversations & Messages)

#### Conversation Entity (`conversations`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| type | enum | one_to_one/group |
| name | string | Group name |
| avatar | string | Group avatar |
| createdBy | UUID | Foreign key to User |
| isGroup | boolean | Group chat flag |
| disappearingMode | boolean | Disappearing messages |
| createdAt | timestamp | Creation date |
| deletedAt | timestamp | Soft delete |

#### ConversationParticipant Entity (`conversation_participants`)

| Field | Type | Description |
|-------|------|-------------|
| conversationId | UUID | Primary key (composite) |
| userId | UUID | Primary key (composite) |
| role | enum | member/admin/creator |
| isMuted | boolean | Muted notifications |
| isAdmin | boolean | Admin status |
| joinedAt | timestamp | Join date |

#### Message Entity (`messages`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| conversationId | UUID | Foreign key to Conversation |
| senderId | UUID | Foreign key to User |
| contentEncrypted | string | Encrypted message content |
| type | enum | text/image/video/file/voice |
| mediaUrl | string | Media URL |
| replyToId | string | Reply to message ID |
| isEdited | boolean | Edited flag |
| editedAt | timestamp | Edit timestamp |
| isDeletedForEveryone | boolean | Delete for all |
| isStarred | boolean | Starred |
| createdAt | timestamp | Creation date |
| deletedAt | timestamp | Soft delete |

#### MessageReaction Entity (`message_reactions`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| messageId | UUID | Foreign key to Message |
| userId | UUID | Foreign key to User |
| emoji | string | Emoji reaction |
| createdAt | timestamp | Creation date |

---

### 1.8 Notifications Module

#### Notification Entity (`notifications`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| type | string | friend_request/friend_accepted/like/comment/tag/share/mention/birthday/group_invite/event_invite/memory/story_view |
| message | string | Notification message |
| entityType | string | Related entity type |
| entityId | string | Related entity ID |
| readStatus | boolean | Read status |
| createdAt | timestamp | Creation date |

---

### 1.9 Groups Module

#### Group Entity (`groups`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | string | Group name |
| description | string | Group description |
| privacy | string | public/private/secret |
| coverPhoto | string | Cover image URL |
| location | string | Group location |
| rules | string | Group rules |
| tags | string | Tags |
| createdBy | UUID | Foreign key to User |
| createdAt | timestamp | Creation date |

#### GroupMember Entity (`group_members`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| groupId | UUID | Foreign key to Group |
| userId | UUID | Foreign key to User |
| role | string | admin/moderator/member |
| isBanned | boolean | Banned status |
| joinedAt | timestamp | Join date |

---

### 1.10 Pages Module

#### Page Entity (`pages`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| username | string | Unique page username |
| name | string | Page name |
| description | string | Page description |
| category | string | Page category |
| privacy | string | public/private |
| profilePhoto | string | Profile photo |
| coverPhoto | string | Cover photo |
| website | string | Website URL |
| contactInfo | string | Contact information |
| location | string | Location |
| hours | string | Operating hours |
| createdBy | UUID | Foreign key to User |
| createdAt | timestamp | Creation date |

#### PageFollower Entity (`page_followers`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| pageId | UUID | Foreign key to Page |
| userId | UUID | Foreign key to User |
| followedAt | timestamp | Follow date |

#### PageLike Entity (`page_likes`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| pageId | UUID | Foreign key to Page |
| userId | UUID | Foreign key to User |
| likedAt | timestamp | Like date |

---

### 1.11 Events Module

#### Event Entity (`events`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | string | Event title |
| description | string | Event description |
| startDate | timestamp | Start date/time |
| endDate | timestamp | End date/time |
| timezone | string | Timezone |
| location | string | Event location |
| coverPhoto | string | Cover image |
| privacy | string | public/friends/private |
| coHosts | string[] | Co-host user IDs |
| recurring | string | daily/weekly/monthly/custom |
| createdBy | UUID | Foreign key to User |
| createdAt | timestamp | Creation date |

#### EventRSVP Entity (`event_rsvps`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| eventId | UUID | Foreign key to Event |
| userId | UUID | Foreign key to User |
| status | string | going/interested/not_going |
| rsvpedAt | timestamp | RSVP date |

---

### 1.12 Videos Module

#### Video Entity (`videos`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | string | Video title |
| description | string | Video description |
| url | string | Video URL |
| thumbnail | string | Thumbnail URL |
| views | number | View count |
| createdBy | UUID | Foreign key to User |
| createdAt | timestamp | Creation date |

---

### 1.13 Memories Module

#### SavedItem Entity (`saved_items`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| entityType | string | post/comment/video/story |
| entityId | string | Entity ID |
| savedAt | timestamp | Save date |

---

### 1.14 Settings Module

#### PrivacySettings Entity (`privacy_settings`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| whoCanSeePosts | string | public/friends/friends_of_friends/only_me |
| whoCanSeeFriends | string | Visibility setting |
| whoCanSendFriendRequests | string | Who can send requests |
| whoCanSeeProfilePicture | string | Visibility setting |
| whoCanSeeCoverPhoto | string | Visibility setting |
| whoCanSeeBio | string | Visibility setting |
| whoCanTagMe | string | Who can tag |
| allowSearchEngines | boolean | Allow search engines |

#### Block Entity (`blocks`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| blockerId | UUID | Foreign key to User |
| blockedId | UUID | Foreign key to User |
| blockedAt | timestamp | Block date |

---

### 1.15 Matching Module

#### Match Entity (`matches`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user1Id | UUID | First user |
| user2Id | UUID | Second user |
| score | number | Match score (0-100) |
| status | string | pending/accepted/rejected/chat |
| createdAt | timestamp | Creation date |

---

### 1.16 Reports Module

#### Report Entity (`reports`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| reportedBy | UUID | Foreign key to User |
| targetType | string | user/post/group |
| targetId | string | Target entity ID |
| reason | string | Report reason |
| status | string | pending/resolved/dismissed |
| createdAt | timestamp | Creation date |

---

### 1.17 Affiliates Module

#### Affiliate Entity (`affiliates`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| referralCode | string | Unique referral code |
| totalReferred | number | Total referred users |
| totalMarriages | number | Total successful marriages |
| commissionBalance | number | Commission balance |

---

### 1.18 Payments Module

#### Transaction Entity (`transactions`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| amount | decimal | Transaction amount |
| currency | string | Currency code |
| gateway | string | paymob/stripe |
| transactionId | string | Gateway transaction ID |
| status | string | pending/completed/failed |
| createdAt | timestamp | Creation date |

---

### 1.19 Subscriptions Module

#### Subscription Entity (`subscriptions`)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| plan | string | free/premium |
| startDate | timestamp | Subscription start |
| endDate | timestamp | Subscription end |
| status | string | active/expired/cancelled |

---

## 2. Relationships

### One-to-One Relationships

| Entity A | Entity B | Description |
|----------|----------|-------------|
| User | Profile | Each user has one profile |
| User | PrivacySettings | Each user has privacy settings |
| User | Affiliate | Each user can have affiliate profile |
| User | Session | User login session |

### One-to-Many Relationships

| Entity A | Entity B | Description |
|----------|----------|-------------|
| User | Post | A user can create many posts |
| User | Comment | A user can write many comments |
| User | Story | A user can have many stories |
| User | Friendship (requester) | User sent many friend requests |
| User | Friendship (addressee) | User received many friend requests |
| User | Group (created) | User can create many groups |
| User | GroupMember | User can join many groups |
| User | Event (created) | User can create many events |
| Event | EventRSVP | Many RSVPs per event |
| Group | GroupMember | Many members per group |
| Page | PageFollower | Many followers per page |
| Page | PageLike | Many likes per page |
| Post | Reaction | Many reactions per post |
| Post | Comment | Many comments per post |
| Conversation | Message | Many messages per conversation |
| Conversation | ConversationParticipant | Many participants per conversation |

### Many-to-Many Relationships

| Entity A | Entity B | Description |
|----------|----------|-------------|
| User | User (friendship) | Users can be friends (bilateral) |
| User | User (blocks) | Blocked users |
| User | Conversation | Member of multiple conversations |
| User | Event | RSVPs to multiple events |
| User | Page | Follow multiple pages |
| User | SavedItem | Save multiple items |

---

## 3. Egyptian Context Seed Data Requirements

### 3.1 Egyptian Cities

| Governorate | Arabic | Common Areas |
|------------|--------|-------------|
| Cairo | القاهرة | وسط المدينة، الزمالك، المعادي، مصر الجديدة، مدينة نصر، الجيزة، أكتوبر |
| Giza | الجيزة | أكتوبر، الشيخ زايد، الهرم، فيصل |
| Alexandria | الاسكندرية |وسط الإسكندرية، stanbul، غزالة، المنتزه |
| Tanta | طنطا | |
| Mansoura | المنصورة | |
| Port Said | بورسعيد | |
| Ismailia | الاسماعيلية | |
| Suez |السويس | |
| Luxor | الاقصر | |
| Aswan | اسوان | |
| Zagazig | الزقازيق | |
| Damanhour | دمنهور | |
| Minya | المنيا | |
| Sohag | سوهاج | |
| Qena | قنا | |
| Beni Suef | بني سويف | |
| Fayoum | الفيوم | |
| Banha | بنها | |
| Tahta |طهطا | |
| Shibin El Qanater | شبين القناطر | |

**Seed Data Format:**
```typescript
const egyptianCities = [
  { name: 'القاهرة', nameEn: 'Cairo', governorate: 'Cairo' },
  { name: 'الجيزة', nameEn: 'Giza', governorate: 'Giza' },
  { name: 'الاسكندرية', nameEn: 'Alexandria', governorate: 'Alexandria' },
  { name: 'طنطا', nameEn: 'Tanta', governorate: 'Gharbia' },
  { name: 'المنصورة', nameEn: 'Mansoura', governorate: 'Dakahlia' },
  { name: 'بورسعيد', nameEn: 'Port Said', governorate: 'Port Said' },
  { name: 'الاسماعيلية', nameEn: 'Ismailia', governorate: 'Ismailia' },
  { name: 'السويس', nameEn: 'Suez', governorate: 'Suez' },
  { name: 'الاقصر', nameEn: 'Luxor', governorate: 'Luxor' },
  { name: 'اسوان', nameEn: 'Aswan', governorate: 'Aswan' },
];
```

### 3.2 Egyptian Names

**Male First Names (أسماءذكور):**
```
أحمد، محمد، إبراهيم، خالد، عمرو، علي، يوسف، كريم، سامح، هشام، بلال، عمر، يزيد،马尾، طارق، 
محمود، حسام، رشيد، وليد، نادر، شريف، عمران، باسم، أيمن، رامي، شعبان، جلال، أسامة، 
إسلام، فتحي، منير، عاطف، كمال، حمدي، رضا، جودت، أنور، فريد، صلاح، حسيني، جواد
```

**Female First Names (أسماء إناث):**
```
فاطمة، مريم، آية، نور، سارة، هنا، ريهام، إيمان، دعاء، هناء، منى، رنا، إسلام، 
سلمى، نورين، سمية، رقية، هبة، إيلين، جنا، ملك، روان، سما، يمنى، إكرام، أميرة، 
زينب، كاملة، نادية، عائشة، حياة، مها، لينا، داليا، نسرين، سناء، نهى، هوية
```

**Family Names (أسماء عائلية):**
```
علي، أحمد، محمد، إبراهيم، سليمان، الشيخ، طنطاوي، منصور، خطاب، سلامة، السباعي، 
الشربيني، البهائي، الجوهري، النحاس، العطار، البحيري،hend، المصري، الحلواني، 
الرفاعي، القمري، الفيومي، المنصوري، العلمي، الغزالي، سيد، خطاب، المصري
```

**Seed Data Format:**
```typescript
const egyptianMaleNames = [
  'أحمد', 'محمد', 'إبراهيم', 'خالد', 'عمرو', 'علي', 'يوسف', 'كريم', 
  'هشام', 'بلال', 'عمر', 'زايد', 'طارق', 'محمود', 'حسام', 'رشيد'
];

const egyptianFemaleNames = [
  'فاطمة', 'مريم', 'آية', 'نور', 'سارة', 'هنا', 'ريهام', 'إيمان', 
  'دعاء', 'هناء', 'منى', 'رنا', 'إسلام', 'سلمى', 'نورين', 'سمية'
];

const egyptianFamilyNames = [
  'علي', 'أحمد', 'محمد', 'إبراهيم', 'السيد', 'المنصور', 'الخطاب', 
  'السلامة', 'الشيخ', 'الشربيني', 'المنصوري'
];
```

### 3.3 Egyptian Universities

| University | Arabic | Location | Specializations |
|------------|--------|----------|-----------------|
| Cairo University | جامعة القاهرة | الجيزة | All faculties |
| Ain Shams University | جامعة عين شمس | القاهرة | All faculties |
| Alexandria University | جامعة الاسكندرية | الاسكندرية | All faculties |
| Mansoura University | جامعة المنصورة | المنصورة | All faculties |
| Zagazig University | جامعة الزقازيق | الزقازيق | All faculties |
| Helwan University | جامعة حلوان | حلوان | All faculties |
| Al-Azhar University | جامعة الأزهر | القاهرة |Islamic studies, all faculties|
| Minya University | جامعة المنيا | المنيا | All faculties |
| Assiut University | جامعة اسيوط | اسيوط | All faculties |
| Fayoum University | جامعة الفيوم | الفيوم | All faculties |
| Beni Suef University | جامعة بني سويف | بني سويف | All faculties |
| Sohag University | جامعة سوهاج | سوهاج | All faculties |

**Seed Data Format:**
```typescript
const egyptianUniversities = [
  { name: 'جامعة القاهرة', nameEn: 'Cairo University', location: 'الجيزة', type: 'public' },
  { name: 'جامعة عين شمس', nameEn: 'Ain Shams University', location: 'القاهرة', type: 'public' },
  { name: 'جامعة الاسكندرية', nameEn: 'Alexandria University', location: 'الاسكندرية', type: 'public' },
  { name: 'جامعة المنصورة', nameEn: 'Mansoura University', location: 'المنصورة', type: 'public' },
  { name: 'جامعة الأزهر', nameEn: 'Al-Azhar University', location: 'القاهرة', type: 'public' },
  { name: 'جامعة حلوان', nameEn: 'Helwan University', location: 'حلوان', type: 'public' },
  { name: 'جامعة الزقازيق', nameEn: 'Zagazig University', location: 'الزقازيق', type: 'public' },
];
```

### 3.4 Egyptian Companies and Workplaces

**Government Institutions:**
```
وزارة الداخلية، وزارة الدفاع، محافظة القاهرة، بنك مصر، البنك الأهلي، شركة الكهرباء، 
مصر للتأمين، شركة الغاز، هيئة النقل العام، جامعة القاهرة، مستشفيات جامعة عين شمس
```

**Private Companies:**
```
شركة بالم هيلز، شركة مدينة筠، شركة تطوير، شركة الأتصالات، شركة دو، 
فودافون، أورانچ، اتصالات، المصرية للاتصالات، بنك璧ري، شركة Schlumberger
```

**Hospitals:**
```
مستشفى السلام، مستشفى الدرة، مستشفى الأطفال، مستشفى القبطي، مستشفىumacher
```

**Seed Data Format:**
```typescript
const egyptianWorkplaces = [
  // Government
  { name: 'بنك مصر', type: 'bank', category: 'government' },
  { name: 'البنك الأهلي المصري', type: 'bank', category: 'government' },
  { name: 'شركة الكهرباء القابضة', type: 'utility', category: 'government' },
  { name: 'قطاع البترول', type: 'oil', category: 'government' },
  // Private
  { name: 'شركة بالم هيلز للتطوير العقاري', type: 'real-estate', category: 'private' },
  { name: 'شركة اورانچ مصر', type: 'telecom', category: 'private' },
  { name: 'فودافون مصر', type: 'telecom', category: 'private' },
];
```

### 3.5 Egyptian Schools and Institutes

**International Schools:**
```
مدارس السلام الدولية، مدارس桂林، مدارس الكلية الجديدة، مدارس رواد الغد، 
مدارسStem، مدارسFuture Language School
```

**Technical Institutes:**
```
معهدالتقني العالي، معهدuben، معهدالقاهرة للتدريب
```

### 3.6 Cultural Values for Egyptian Context

**Religious Sect Options (طائفة):**
```
سني، شيعي، سنة، شيعة اثنا عشرية
```

**Prayer Level Options (مستوى الصلاة):**
```
ملتزم always_pray،偶尔，偶尔، لا اصلي
```

**Religious Commitment (التزم الديني):**
```
ملتزم جداً، ملتزم، متوسط، مت relaxes
```

**Social/Marital Status (الحالة الاجتماعية):**
```
أعزب، متزوج، مطلق، أرمل، منفصل
```

**Relationship Status (حالة العلاقة):**
```
عزب، متزوج، في علاقة، خطيب، منفصل، مطلق
```

---

## 4. Sample Data for Each Feature

### 4.1 Users with Profiles

```typescript
const sampleUsers = [
  {
    email: 'ahmed.mohamed@email.com',
    phone: '+201000000001',
    firstName: 'أحمد',
    lastName: 'محمد',
    username: 'ahmed_mohamed',
    dateOfBirth: new Date('1995-03-15'),
    gender: 'male',
    profile: {
      fullName: 'أحمد محمد',
      age: 28,
      gender: 'male',
      country: 'مصر',
      city: 'القاهرة',
      avatarUrl: '/uploads/avatars/male_1.jpg',
      bio: 'مهندس برمجيات، أهوى القراءة والتكنولوجيا',
      jobTitle: 'مهندس برمجيات',
      workplace: 'شركة بالم هيلز',
      education: 'جامعة القاهرة',
      sect: 'سني',
      prayerLevel: 'ملتزم',
      religiousCommitment: 'ملتزم',
      relationshipStatus: 'أعزب',
      wantsChildren: true,
      relocateWilling: false,
    }
  },
  {
    email: 'fatma.ahmed@email.com',
    phone: '+201000000002',
    firstName: 'فاطمة',
    lastName: 'أحمد',
    username: 'fatma_ahmed',
    dateOfBirth: new Date('1998-07-22'),
    gender: 'female',
    profile: {
      fullName: 'فاطمة أحمد',
      age: 25,
      gender: 'female',
      country: 'مصر',
      city: 'الجيزة',
      avatarUrl: '/uploads/avatars/female_1.jpg',
      bio: 'طبيبة أسنان، أهوى الطبخ والرسم',
      jobTitle: 'طبيبة أسنان',
      workplace: 'عيادة خاصة',
      education: 'جامعة عين شمس',
      sect: 'سني',
      prayerLevel: 'ملتزم',
      religiousCommitment: 'ملتزم',
      relationshipStatus: 'أعزب',
      wantsChildren: true,
      relocateWilling: true,
    }
  }
];
```

### 4.2 Posts with Comments and Reactions

```typescript
const samplePosts = [
  {
    userIndex: 0,
    content: 'الحمد لله على نعمه كل يوم،誇れないです 🙏',
    postType: 'text',
    audience: 'public',
    feeling: ' благодарен',
    location: 'القاهرة، مصر',
    reactions: ['like', 'love', 'support'],
    comments: [
      {
        userIndex: 1,
        content: 'يارب وفقك всегда',
        reactions: ['like', 'love']
      },
      {
        userIndex: 2,
        content: 'آمين يارب العالمين',
        reactions: ['like']
      }
    ]
  },
  {
    userIndex: 1,
    content: '今天参加了 conference للتميز في مجال طب الأسنان،很高兴认识各位同事',
    postType: 'photo',
    mediaUrl: '/uploads/posts/photo_1.jpg',
    audience: 'friends',
    location: 'الجيزة',
    reactions: ['like', 'love'],
    comments: []
  }
];
```

### 4.3 Friend Connections

```typescript
const sampleFriendships = [
  {
    requesterIndex: 0,
    addresseeIndex: 1,
    status: 'accepted',
    createdAt: new Date('2024-01-15')
  },
  {
    requesterIndex: 0,
    addresseeIndex: 2,
    status: 'pending',
    createdAt: new Date('2024-02-20')
  },
  {
    requesterIndex: 3,
    addresseeIndex: 0,
    status: 'accepted',
    createdAt: new Date('2024-01-10')
  }
];
```

### 4.4 Groups with Members

```typescript
const sampleGroups = [
  {
    name: 'ملتقى الشباب المصري',
    description: 'مجموعة لتواصل الشباب المصري ونشر الخير',
    privacy: 'public',
    location: 'القاهرة',
    coverPhoto: '/uploads/groups/cover_1.jpg',
    createdBy: 0,
    members: [
      { userIndex: 0, role: 'admin' },
      { userIndex: 1, role: 'moderator' },
      { userIndex: 2, role: 'member' }
    ]
  },
  {
    name: 'أهالي مدينة笋 للتنمية',
    description: 'مجموعة أهالي المدينة للتنمية والتطوير',
    privacy: 'private',
    location: 'المدينة المنورة',
    createdBy: 1,
    members: [
      { userIndex: 1, role: 'admin' },
      { userIndex: 0, role: 'member' }
    ]
  }
];
```

### 4.5 Pages with Likes

```typescript
const samplePages = [
  {
    username: 'egypt_marriage',
    name: 'زواج مصر',
    description: 'منصة زواج مصرية شرعية',
    category: 'dating',
    privacy: 'public',
    profilePhoto: '/uploads/pages/logo_1.jpg',
    coverPhoto: '/uploads/pages/cover_1.jpg',
    createdBy: 0,
    followers: [1, 2, 3],
    likes: [1, 2]
  },
  {
    username: 'islamic_advice',
    name: 'نصائح إسلامية',
    description: 'نصائح دينية وحياة',
    category: 'religion',
    privacy: 'public',
    createdBy: 2,
    followers: [0, 1, 2, 3],
    likes: [0, 1, 2]
  }
];
```

### 4.6 Events with RSVPs

```typescript
const sampleEvents = [
  {
    title: 'فعالية زواج جماعي',
    description: 'فعالية زواج جماعي لأبناء المحافظة',
    startDate: new Date('2024-06-15T18:00:00'),
    endDate: new Date('2024-06-15T23:00:00'),
    location: 'قاعة المؤتمرات، القاهرة',
    privacy: 'public',
    coverPhoto: '/uploads/events/photo_1.jpg',
    createdBy: 0,
    coHosts: [],
    rsvps: [
      { userIndex: 0, status: 'going' },
      { userIndex: 1, status: 'going' },
      { userIndex: 2, status: 'interested' }
    ]
  },
  {
    title: 'محاضرة عن الزواج في الإسلام',
    description: 'محاضرة دينية عن أهمية الزواج في الإسلام',
    startDate: new Date('2024-05-01T20:00:00'),
    location: 'مسجد السلام، الجيزة',
    privacy: 'public',
    createdBy: 2,
    rsvps: [
      { userIndex: 0, status: 'going' },
      { userIndex: 1, status: 'going' }
    ]
  }
];
```

### 4.7 Messages in Conversations

```typescript
const sampleConversations = [
  {
    type: 'one_to_one',
    participants: [0, 1],
    messages: [
      {
        senderIndex: 0,
        content: 'السلام عليكم ورحمة الله وبركاته',
        type: 'text'
      },
      {
        senderIndex: 1,
        content: 'وعليكم السلام ورحمة الله، أهلاً وسهلاً',
        type: 'text'
      },
      {
        senderIndex: 0,
        content: 'كيف حالك؟',
        type: 'text'
      }
    ]
  },
  {
    type: 'group',
    name: 'مجموعة研讨学习',
    isGroup: true,
    participants: [0, 1, 2],
    messages: [
      {
        senderIndex: 0,
        content: 'مرحباً everyone',
        type: 'text'
      },
      {
        senderIndex: 1,
        content: 'أهلاً everyone',
        type: 'text'
      }
    ]
  }
];
```

### 4.8 Notifications

```typescript
const sampleNotifications = [
  {
    userIndex: 0,
    type: 'friend_request',
    message: 'Ahmed Mohamed أرسل لك طلب صداقة',
    entityType: 'friendship',
    readStatus: false
  },
  {
    userIndex: 0,
    type: 'like',
    message: 'Fatma Ahmed اعجب بمنشورك',
    entityType: 'post',
    readStatus: true
  },
  {
    userIndex: 0,
    type: 'comment',
    message: 'Ali Hassan علق على منشورك: "ما شاء الله"',
    entityType: 'post',
    readStatus: false
  }
];
```

---

## 5. Quantity Recommendations

### Minimum Seed Quantities (for Development/Testing)

| Entity Type | Minimum | Notes |
|------------|---------|-------|
| Users | 20 | Minimum for testing |
| Profiles | 20 | One per user |
| Posts | 50 | Mix of types |
| Comments | 100 | Multiple per post |
| Reactions | 200 | Various types |
| Friendships | 40 | 20 connections |
| FriendLists | 30 | Various types |
| Groups | 5 | With members |
| GroupMembers | 20 | Distribution |
| Pages | 10 | Public/Private |
| PageFollowers | 30 | Per page |
| PageLikes | 30 | Per page |
| Events | 10 | Various dates |
| EventRSVPs | 40 | Per event |
| Conversations | 30 | 1:1 and group |
| Messages | 200 | Per conversation |
| MessageReactions | 50 | |
| Notifications | 100 | Various types |
| Videos | 10 | |
| SavedItems | 30 | |
| PrivacySettings | 20 | One per user |
| Blocks | 10 | |
| Matches | 50 | |
| Reports | 5 | |
| Subscriptions | 10 | Free/Premium |
| Transactions | 20 | |
| Affiliates | 10 | |
| Stories | 30 | Active stories |
| StoryViews | 100 | |
| ActivityLogs | 200 | |

### Recommended Seed Quantities (for Production Demo)

| Entity Type | Recommended | Notes |
|------------|------------|-------|
| Users | 500 | Good mix |
| Profiles | 500 | One per user |
| Posts | 2000 | Daily activity |
| Comments | 5000 | Per posts |
| Reactions | 10000 | Engagement |
| Friendships | 1500 | 3 per user avg |
| FriendLists | 500 | Categories |
| Groups | 50 | Active groups |
| GroupMembers | 500 | 10 per group |
| Pages | 100 | Various categories |
| PageFollowers | 2000 | 20 per page |
| PageLikes | 1500 | |
| Events | 100 | Upcoming |
| EventRSVPs | 1000 | Per event |
| Conversations | 2000 | Messaging |
| Messages | 20000 | Chat history |
| MessageReactions | 500 | |
| Notifications | 5000 | Activity |
| Videos | 100 | |
| SavedItems | 500 | |
| PrivacySettings | 500 | One per user |
| Blocks | 100 | |
| Matches | 2500 | Matching feature |
| Reports | 50 | Moderation |
| Subscriptions | 100 | Paid users |
| Transactions | 500 | Payment flow |
| Affiliates | 50 | Referral system |
| Stories | 500 | 24hr stories |
| StoryViews | 5000 | View tracking |
| ActivityLogs | 10000 | User activity |

### Maximum Seed Quantities (Stress Testing)

| Entity Type | Maximum | Notes |
|------------|---------|-------|
| Users | 10000 | Load test |
| Posts | 50000 | |
| Comments | 100000 | |
| Reactions | 200000 | |
| Friendships | 30000 | |
| Conversations | 30000 | |
| Messages | 500000 | |
| Notifications | 100000 | |

---

## Seed Execution Order

1. **Users** → Must be seeded first (dependencies)
2. **Profiles** → Depends on Users
3. **PrivacySettings** → Depends on Users
4. **Affiliates** → Depends on Users
5. **Subscriptions** → Depends on Users
6. **Groups** → Depends on Users
7. **GroupMembers** → Depends on Groups, Users
8. **Pages** → Depends on Users
9. **PageFollowers, PageLikes** → Depends on Pages, Users
10. **Events** → Depends on Users
11. **EventRSVPs** → Depends on Events, Users
12. **Posts** → Depends on Users, Groups
13. **Reactions** → Depends on Posts, Users
14. **Comments** → Depends on Posts, Users
15. **CommentReactions** → Depends on Comments, Users
16. **Stories** → Depends on Users
17. **StoryViews** → Depends on Stories, Users
18. **Friendships** → Depends on Users
19. **FriendLists** → Depends on Users
20. **Blocks** → Depends on Users
21. **UserBlocks, UserRestrictions** → Depends on Users
22. **Conversations** → Depends on Users
23. **ConversationParticipants** → Depends on Conversations, Users
24. **Messages** → Depends on Conversations, Users
25. **MessageReactions** → Depends on Messages, Users
26. **Notifications** → Depends on Users
27. **Videos** → Depends on Users
28. **SavedItems** → Depends on Users
29. **Matches** → Depends on Users
30. **Reports** → Depends on Users
31. **Transactions** → Depends on Users
32. **ActivityLogs** → Depends on Users
33. **ProfileWork** → Depends on Profiles
34. **ProfileEducation** → Depends on Profiles

---

## Egyptian Context Seed Guidelines

### City Distribution (Recommended)
- القاهرة: 30%
- الجيزة: 20%
- الاسكندرية: 15%
- باقي المدن: 35%

### Age Distribution
- 18-25: 25%
- 26-35: 45%
- 36-45: 25%
- 46+: 5%

### Gender Distribution
- Male: 50%
- Female: 50%

### Religious Distribution
- Sunni (سني): 90%
- Shia (شيعي): 10%

### Education Level Distribution
- High School: 20%
- University: 60%
- Masters/PhD: 15%
- Other: 5%