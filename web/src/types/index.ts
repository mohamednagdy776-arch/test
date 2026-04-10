export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface User {
  id: string;
  email: string;
  phone: string;
  accountType: 'user' | 'guardian' | 'agent' | 'admin';
  status: 'active' | 'pending' | 'banned';
  createdAt: string;
}

export interface Profile {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  country: string;
  city: string;
  socialStatus?: string;
  childrenCount: number;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  score: number;
  status: 'pending' | 'accepted' | 'rejected' | 'chat';
  createdAt: string;
  // Additional fields returned by the API
  otherUserName?: string | null;
  otherUserAvatar?: string | null;
  user?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
    age?: number;
    location?: string;
    prayerLevel?: string;
  };
}

export interface Group {
  id: string;
  name: string;
  description: string;
  privacy: 'public' | 'private';
  createdBy: string;
  createdAt: string;
}

export interface Post {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  contentEncrypted: string;
  type: 'text' | 'voice' | 'video';
  createdAt: string;
}
