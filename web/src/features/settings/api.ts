import { apiClient } from '@/lib/api-client';

export interface PrivacySettings {
  whoCanSeePosts: 'public' | 'friends' | 'friends_of_friends' | 'only_me';
  whoCanSeeFriends: 'public' | 'friends' | 'friends_of_friends' | 'only_me';
  whoCanSendFriendRequests: 'public' | 'friends' | 'friends_of_friends';
  whoCanSeeProfilePicture: 'public' | 'friends' | 'friends_of_friends' | 'only_me';
  whoCanSeeCoverPhoto: 'public' | 'friends' | 'friends_of_friends' | 'only_me';
  whoCanSeeBio: 'public' | 'friends' | 'friends_of_friends' | 'only_me';
  whoCanTagMe: 'public' | 'friends' | 'friends_of_friends' | 'only_me';
  allowSearchEngines: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  colorScheme: 'emerald' | 'blue' | 'purple' | 'pink' | 'orange';
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  fontFamily: string;
}

export interface NotificationSettings {
  notificationsEnabled: boolean;
  likesNotifications: boolean;
  commentsNotifications: boolean;
  friendRequestsNotifications: boolean;
  messagesNotifications: boolean;
  mentionsNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export interface NewsletterSettings {
  newsletterEnabled: boolean;
  weeklyDigest: boolean;
  newFeaturesUpdates: boolean;
  promotionsOffers: boolean;
  eventsAndCommunities: boolean;
  securityAlerts: boolean;
}

export const settingsApi = {
  // Privacy settings
  getPrivacySettings: () =>
    apiClient.get('/settings/privacy').then((r) => r.data),

  updatePrivacySettings: (data: Partial<PrivacySettings>) =>
    apiClient.patch('/settings/privacy', data).then((r) => r.data),

  // Appearance settings
  getAppearanceSettings: () =>
    apiClient.get('/settings/appearance').then((r) => r.data),

  updateAppearanceSettings: (data: Partial<AppearanceSettings>) =>
    apiClient.patch('/settings/appearance', data).then((r) => r.data),

  // Notification settings
  getNotificationSettings: () =>
    apiClient.get('/settings/notifications').then((r) => r.data),

  updateNotificationSettings: (data: Partial<NotificationSettings>) =>
    apiClient.patch('/settings/notifications', data).then((r) => r.data),

  // Newsletter settings
  getNewsletterSettings: () =>
    apiClient.get('/settings/newsletter').then((r) => r.data),

  updateNewsletterSettings: (data: Partial<NewsletterSettings>) =>
    apiClient.patch('/settings/newsletter', data).then((r) => r.data),

  // Block management
  getBlocks: () =>
    apiClient.get('/blocks').then((r) => r.data),

  blockUser: (blockedUserId: string) =>
    apiClient.post('/blocks', { blockedUserId }).then((r) => r.data),

  unblockUser: (blockId: string) =>
    apiClient.delete(`/blocks/${blockId}`).then((r) => r.data),

  // Incoming photo-access requests (#354) -- the endpoints already existed
  // server-side but nothing in the UI ever called them.
  getPhotoAccessRequests: () =>
    apiClient.get('/photo-requests').then((r) => r.data),

  respondToPhotoAccessRequest: (requestId: string, approve: boolean) =>
    apiClient.patch(`/photo-requests/${requestId}`, { approve }).then((r) => r.data),
};
