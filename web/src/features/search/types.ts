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
  // Communities (groups) tab (#352) -- was reusing the People filters above,
  // which are irrelevant to groups.
  groupCategory: string;
  groupLocation: string;
  // Pages tab (#352).
  pageCategory: string;
  // Events tab (#352).
  eventLocation: string;
  eventDateFrom: string;
  eventDateTo: string;
  // Posts tab (#352).
  postType: string;
  postDateFrom: string;
  postDateTo: string;
}

export type SearchType = 'all' | 'people' | 'groups' | 'pages' | 'events' | 'posts';
export type TabType = 'people' | 'groups' | 'pages' | 'events' | 'posts';

export const emptyFilters: SearchFiltersState = {
  name: '', gender: '', country: '', city: '',
  minAge: '', maxAge: '', sect: '', lifestyle: '', education: '', prayerLevel: '',
  groupCategory: '', groupLocation: '',
  pageCategory: '',
  eventLocation: '', eventDateFrom: '', eventDateTo: '',
  postType: '', postDateFrom: '', postDateTo: '',
};