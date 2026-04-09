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

export const settingsApi = {
  getPrivacySettings: () =>
    apiClient.get('/settings/privacy').then((r) => r.data),

  updatePrivacySettings: (data: Partial<PrivacySettings>) =>
    apiClient.patch('/settings/privacy', data).then((r) => r.data),

  getBlocks: () =>
    apiClient.get('/blocks').then((r) => r.data),

  blockUser: (blockedUserId: string) =>
    apiClient.post('/blocks', { blockedUserId }).then((r) => r.data),

  unblockUser: (blockId: string) =>
    apiClient.delete(`/blocks/${blockId}`).then((r) => r.data),
};
