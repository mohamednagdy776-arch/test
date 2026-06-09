export interface Memory {
  id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface SavedItem {
  id: string;
  entityType: 'post' | 'comment' | 'video' | 'story';
  entityId: string;
  savedAt: string;
  entity?: {
    id: string;
    content?: string;
    mediaUrl?: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
  };
}
