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
