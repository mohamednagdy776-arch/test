# Module 15 — Watch (Video Hub)

## clone-prompt.md Reference
Reference: `.kiro/agents/fb-clone-frontend.agent.md` - Module 15: Watch (Video Hub)

## Implemented

### Components
- `VideoGrid.tsx` — Grid and card components for videos
- `VideoCard.tsx` — Card for displaying a video

### Pages
- `/watch` — Video feed page (implemented)

### Hooks
- `useVideos` — Hook for fetching videos
- `useVideo` — Hook for fetching a single video
- `useRecommendedVideos` — Hook for recommended videos
- `useTrendingVideos` — Hook for trending videos
- `useContinueWatching` — Hook for continue watching
- `useUploadVideo` — Hook for uploading videos
- `useDeleteVideo` — Hook for deleting videos
- `useLikeVideo` — Hook for liking videos
- `useUnlikeVideo` — Hook for unliking videos
- `useVideoComments` — Hook for video comments
- `useAddVideoComment` — Hook for adding video comments

### API
- `videosApi` — API for videos

## Backend
- Backend exists: `backend/src/videos/`
