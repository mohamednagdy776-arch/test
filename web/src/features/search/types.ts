export interface SearchFiltersState {
  name: string;
  gender: string;
  country: string;
  city: string;
  minAge: string;
  maxAge: string;
  sect: string;
  lifestyle: string;
  education: string;
  prayerLevel: string;
}

export type SearchType = 'all' | 'people' | 'groups' | 'pages' | 'events' | 'posts';
export type TabType = 'people' | 'groups' | 'pages' | 'events' | 'posts';

export const emptyFilters: SearchFiltersState = {
  name: '', gender: '', country: '', city: '',
  minAge: '', maxAge: '', sect: '', lifestyle: '', education: '', prayerLevel: '',
};