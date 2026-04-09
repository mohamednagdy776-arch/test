import { apiClient } from '@/lib/api-client';

export interface SearchParams {
  name?: string;
  gender?: string;
  country?: string;
  city?: string;
  sect?: string;
  lifestyle?: string;
  education?: string;
  minAge?: number;
  maxAge?: number;
  page?: number;
  limit?: number;
  cursor?: string;
  type?: 'all' | 'people' | 'groups' | 'pages' | 'events' | 'posts';
  q?: string;
}

export interface SearchResult {
  users?: any[];
  groups?: any[];
  pages?: any[];
  events?: any[];
  posts?: any[];
  hasMore?: boolean;
  nextCursor?: string;
  total?: number;
}

export interface SuggestionItem {
  type: 'user' | 'group' | 'page' | 'event';
  id: string;
  name: string;
  avatarUrl?: string;
  subtext?: string;
}

const RECENT_SEARCHES_KEY = 'recentSearches';
const MAX_RECENT = 10;

export const getRecentSearches = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

export const addRecentSearch = (query: string) => {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    const recent = getRecentSearches().filter((q) => q !== query);
    const updated = [query, ...recent].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {}
};

export const removeRecentSearch = (query: string) => {
  if (typeof window === 'undefined') return;
  try {
    const recent = getRecentSearches().filter((q) => q !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
  } catch {}
};

export const clearRecentSearches = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};

export const POPULAR_SEARCHES = [
  'مسلم ملتزم',
  'أخوة إسلامية',
  'مجتمع المسلمين',
  'تعارف وزواج',
  'شباب مسلم',
];

export const searchApi = {
  searchUsers: (params: SearchParams) =>
    apiClient.get('/users/search', { params }).then((r) => r.data),

  searchAll: async (params: SearchParams): Promise<SearchResult> => {
    const { type = 'all', q, cursor, limit = 12, ...rest } = params;
    const results: SearchResult = { hasMore: false, nextCursor: undefined };

    const categoryMap: Record<string, string> = {
      people: 'users',
      groups: 'groups',
      pages: 'pages',
      events: 'events',
      posts: 'posts',
    };
    const category = type === 'all' ? undefined : categoryMap[type];

    try {
      const res = await apiClient.get('/search', { params: { q, category, limit, cursor } });
      const data = res.data?.data ?? res.data ?? {};

      if (data.users) results.users = data.users;
      if (data.groups) results.groups = data.groups;
      if (data.pages) results.pages = data.pages;
      if (data.events) results.events = data.events;
      if (data.posts) results.posts = data.posts;
    } catch (e) {
      console.error('Search error:', e);
    }

    return results;
  },

  searchSuggestions: async (query: string): Promise<SuggestionItem[]> => {
    if (!query.trim()) return [];
    try {
      const res = await apiClient.get('/search/autocomplete', { params: { q: query } });
      const data = res.data?.data ?? res.data ?? {};
      const suggestions: SuggestionItem[] = [];

      (data.users ?? []).forEach((u: any) => {
        suggestions.push({ type: 'user', id: u.id, name: `${u.firstName} ${u.lastName}`, subtext: u.username });
      });
      (data.groups ?? []).forEach((g: any) => {
        suggestions.push({ type: 'group', id: g.id, name: g.name });
      });
      (data.pages ?? []).forEach((p: any) => {
        suggestions.push({ type: 'page', id: p.id, name: p.name });
      });
      (data.events ?? []).forEach((e: any) => {
        suggestions.push({ type: 'event', id: e.id, name: e.title });
      });

      return suggestions.slice(0, 10);
    } catch { return []; }
  },

  getUserProfile: (id: string) =>
    apiClient.get(`/users/${id}/profile`).then((r) => r.data),
};