# Module 15 — Watch (Video Hub)

## Overview

This module provides the video streaming and discovery functionality for the platform, similar to Facebook Watch. It enables users to discover, watch, and interact with videos, as well as broadcast live video streams.

## Features

### 15.1 Video Feed

- Dedicated video discovery feed with recommended, trending, and following sections
- Suggested videos based on watch history and interests
- "Continue watching" section for resuming previously viewed videos
- Videos from followed pages/people prioritized in the feed

### 15.2 Video Playback

- Inline autoplay in feed (muted by default, unmutes on click)
- Full-screen mode for immersive viewing
- Playback speed control (0.5x, 1x, 1.25x, 1.5x, 2x)
- Auto-generated captions via speech-to-text API
- Chapter markers (if video includes timestamps in description)
- Like, comment, and share directly on video player

### 15.3 Live Video

- Go live functionality via webcam or screen sharing using WebRTC
- Live viewer count display
- Real-time comments on live stream
- Live reactions with floating emoji overlay
- Save live video to profile after broadcast ends
- Schedule a live video in advance

## Structure

```
videos/
├── controllers/    # HTTP request handlers
├── dto/           # Data transfer objects
├── entities/      # Database entities
├── services/      # Business logic
└── videos.module.ts
```

## Related Modules

- **Posts Module**: Videos can be posted as feed items
- **Comments Module**: Video comments
- **Reactions Module**: Video likes/reactions
- **Upload Module**: Video file uploads
- **Notifications Module**: Video-related notifications

## Dependencies

- WebRTC for live streaming
- Speech-to-text API for captions
- Video encoding/transcoding service