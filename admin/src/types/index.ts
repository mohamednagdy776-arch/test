// Shared TypeScript types across the admin dashboard

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  phone: string;
  accountType: 'user' | 'guardian' | 'agent' | 'admin';
  status: 'active' | 'pending' | 'banned';
  createdAt: string;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  score: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
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

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  gateway: string;
  status: string;
  createdAt: string;
}

// Search parameters for user search
export interface SearchParams {
  name?: string;
  gender?: string;
  country?: string;
  city?: string;
  sect?: string;
  lifestyle?: string;
  education?: string;
  prayerLevel?: string;
  minAge?: number;
  maxAge?: number;
  page?: number;
  limit?: number;
}

// User profile with extended details
export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  accountType: 'user' | 'guardian' | 'agent' | 'admin';
  status: 'active' | 'pending' | 'banned';
  createdAt: string;
  // Extended profile fields
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female';
  age?: number;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  sect?: string;
  lifestyle?: string;
  education?: string;
  occupation?: string;
  bio?: string;
  avatar?: string;
  prayerLevel?: 'never' | 'sometimes' | 'always';
  lookingFor?: string;
}

// Profile with match score
export interface ProfileWithMatch {
  user: UserProfile;
  matchScore: number;
  matchReasons?: string[];
  compatibilityDetails?: {
    criteria: string;
    score: number;
    weight: number;
  }[];
}

// Chat and Conversation types
export interface Conversation {
  id: string;
  conversationId: string;
  userId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  isOwn: boolean;
  type: 'text' | 'image' | 'video';
  createdAt: string;
}
