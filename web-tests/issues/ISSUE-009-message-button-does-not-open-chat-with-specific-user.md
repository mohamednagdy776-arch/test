# ISSUE-009: message button does not open chat with specific user

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Route / Page** | `/profile/[id]` |
| **Type** | Bug |
| **Component** | `ProfileHeader` |
| **File** | `web/src/features/profile/components/ProfileHeader.tsx:247` |
| **Status** | Open |

## Full location
- web/src/features/profile/components/ProfileHeader.tsx
- ProfileHeader component — viewer action buttons section
- `onClick={() => router.push('/chat')}`

## Description
The "رسالة" (Message) button on a user's public profile navigates to `/chat` with no context about which user you wanted to message. The user lands on the general chat list and must manually find the person — or the conversation doesn't exist yet with no way to start it from this flow.

## Failure details
```tsx
// ProfileHeader.tsx line 247 — no recipient info passed
<button
  onClick={() => router.push('/chat')}
  className="..."
>
  <ChatCircle size={16} />
  رسالة
</button>
```

The profile's `userId` (`profileUserId`) is available in the parent `ProfileView` component and is passed down through props, but it is never forwarded to this navigation call.

## Steps to reproduce
1. Log in as any user.
2. Navigate to another user's profile at `/profile/{userId}`.
3. Click the "رسالة" button.
4. Observe that you land on the generic `/chat` page with no conversation pre-selected or pre-opened.

## Expected behaviour
Clicking "رسالة" should open the chat screen with a conversation already addressed to that user, e.g. navigate to `/chat?userId={profileUserId}` or `/chat/{conversationId}`.

## Fix
Pass the target user ID to the route:
```diff
- onClick={() => router.push('/chat')}
+ onClick={() => router.push(`/chat?userId=${profile.userId}`)}
```
The chat page then reads `searchParams.userId` and opens or creates the conversation on mount.

> Code-review finding — not yet fixed.
