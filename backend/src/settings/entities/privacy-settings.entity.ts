import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type PrivacyVisibility = 'public' | 'friends' | 'friends_of_friends' | 'only_me';

@Entity('privacy_settings')
export class PrivacySettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'who_can_see_posts', default: 'friends' })
  whoCanSeePosts: PrivacyVisibility;

  @Column({ name: 'who_can_see_friends', default: 'friends' })
  whoCanSeeFriends: PrivacyVisibility;

  @Column({ name: 'who_can_send_friend_requests', default: 'public' })
  whoCanSendFriendRequests: PrivacyVisibility;

  @Column({ name: 'who_can_see_profile_picture', default: 'public' })
  whoCanSeeProfilePicture: PrivacyVisibility;

  @Column({ name: 'who_can_see_cover_photo', default: 'public' })
  whoCanSeeCoverPhoto: PrivacyVisibility;

  @Column({ name: 'who_can_see_bio', default: 'public' })
  whoCanSeeBio: PrivacyVisibility;

  @Column({ name: 'who_can_tag_me', default: 'friends' })
  whoCanTagMe: PrivacyVisibility;

  // Who may start a conversation with this user. Defaults to 'friends' so
  // strangers cannot cold-message on this Islamic matchmaking platform (#805/#771).
  @Column({ name: 'who_can_send_messages', default: 'friends' })
  whoCanSendMessages: PrivacyVisibility;

  // Who may follow this user (#480). Defaults to 'public' (unchanged behaviour).
  @Column({ name: 'who_can_follow', default: 'public' })
  whoCanFollow: PrivacyVisibility;

  @Column({ name: 'allow_search_engines', default: true })
  allowSearchEngines: boolean;
}