import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { Post, PostType, Audience } from '../posts/entities/post.entity';
import { Friendship, FriendshipStatus } from '../friends/entities/friendship.entity';
import { Conversation, ConversationType } from '../chat/entities/conversation.entity';
import { Message, MessageType } from '../chat/entities/message.entity';
import { ConversationParticipant, ParticipantRole } from '../chat/entities/conversation-participant.entity';
import {
  egyptianCities,
  egyptianMaleNames,
  egyptianFemaleNames,
  egyptianFamilyNames,
  egyptianPosts,
} from './seed-data';
import { Gender } from '../auth/entities/user.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);
  private userIds: string[] = [];
  private postIds: string[] = [];

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Friendship)
    private friendshipRepository: Repository<Friendship>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(ConversationParticipant)
    private participantRepository: Repository<ConversationParticipant>,
  ) {}

  async seedAll() {
    this.logger.log('Starting seed process...');

    await this.seedUsers();
    await this.seedProfiles();
    await this.seedPosts();
    await this.seedFriendships();
    await this.seedConversations();

    this.logger.log('Seed completed successfully!');
    return { message: 'Seed completed successfully!' };
  }

  private async seedUsers() {
    this.logger.log('Seeding users...');

    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) {
      this.logger.log(`Users already exist (${existingUsers}). Skipping user creation.`);
      const users = await this.userRepository.find({ take: 20 });
      this.userIds = users.map((u: User) => u.id);
      return;
    }

    const users: Partial<User>[] = [];
    const numUsers = 20;

    for (let i = 0; i < numUsers; i++) {
      const isMale = i % 2 === 0;
      const firstName = isMale
        ? egyptianMaleNames[i % egyptianMaleNames.length]
        : egyptianFemaleNames[i % egyptianFemaleNames.length];
      const lastName = egyptianFamilyNames[i % egyptianFamilyNames.length];
      const gender = isMale ? Gender.MALE : Gender.FEMALE;

      const year = 1990 + Math.floor(Math.random() * 10);
      const month = 1 + Math.floor(Math.random() * 12);
      const day = 1 + Math.floor(Math.random() * 28);

      users.push({
        email: `user${i + 1}@example.com`,
        phone: `+2010000000${String(i + 1).padStart(2, '0')}`,
        passwordHash: '$2b$12$PgdVH.7CmqaAflur2IeVxeKIiTaerwF7i8TiV4.ZHd9y6GieFH2EG',
        firstName,
        lastName,
        username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
        fullName: `${firstName} ${lastName}`,
        dateOfBirth: new Date(`${year}-${month}-${day}`),
        gender,
        isVerified: true,
        status: 'active',
      });
    }

    const insertedUsers = await this.userRepository.save(users);
    this.userIds = insertedUsers.map((u: User) => u.id);
    this.logger.log(`Created ${this.userIds.length} users`);
  }

  private async seedProfiles() {
    this.logger.log('Seeding profiles...');

    const existingProfiles = await this.profileRepository.count();
    if (existingProfiles > 0) {
      this.logger.log('Profiles already exist. Skipping.');
      return;
    }

    const profiles: Partial<Profile>[] = [];

    for (let i = 0; i < this.userIds.length; i++) {
      const isMale = i % 2 === 0;
      const city = egyptianCities[i % egyptianCities.length];
      const firstName = isMale
        ? egyptianMaleNames[i % egyptianMaleNames.length]
        : egyptianFemaleNames[i % egyptianFemaleNames.length];
      const lastName = egyptianFamilyNames[i % egyptianFamilyNames.length];

      const birthYear = 1990 + Math.floor(Math.random() * 10);
      const age = 2024 - birthYear - 18;

      profiles.push({
        user: { id: this.userIds[i] } as User,
        fullName: `${firstName} ${lastName}`,
        age: age,
        gender: isMale ? 'male' : 'female',
        country: 'Egypt',
        city: city.nameEn,
        bio: `Software engineer from ${city.nameEn}`,
        jobTitle: 'Engineer',
        workplace: 'Private company',
        education: 'University graduate',
        sect: 'Sunni',
        prayerLevel: 'Committed',
        religiousCommitment: 'Committed',
        relationshipStatus: 'Single',
        wantsChildren: true,
        relocateWilling: i % 2 === 0,
        minAge: 22,
        maxAge: 35,
        preferredCountry: 'Egypt',
        introVisibility: 'public',
      });
    }

    await this.profileRepository.save(profiles);
    this.logger.log(`Created ${profiles.length} profiles`);
  }

  private async seedPosts() {
    this.logger.log('Seeding posts...');
    this.postIds = [];

    const existingPosts = await this.postRepository.count();
    if (existingPosts > 0) {
      this.logger.log(`Posts already exist (${existingPosts}). Skipping.`);
      const posts = await this.postRepository.find({ take: 20 });
      this.postIds = posts.map((p: Post) => p.id);
      return;
    }

    const posts: Partial<Post>[] = [];
    const numPosts = 30;

    for (let i = 0; i < numPosts; i++) {
      const userId = this.userIds[i % this.userIds.length];
      const city = egyptianCities[i % egyptianCities.length];
      const content = egyptianPosts[i % egyptianPosts.length];

      posts.push({
        user: { id: userId } as User,
        userId,
        content,
        postType: PostType.TEXT,
        audience: Audience.PUBLIC,
        feeling: 'happy',
        location: city.nameEn,
      });
    }

    const insertedPosts = await this.postRepository.save(posts);
    this.postIds = insertedPosts.map((p: Post) => p.id);
    this.logger.log(`Created ${this.postIds.length} posts`);
  }

  private async seedFriendships() {
    this.logger.log('Seeding friendships...');

    const existingFriendships = await this.friendshipRepository.count();
    if (existingFriendships > 0) {
      this.logger.log(`Friendships already exist (${existingFriendships}). Skipping.`);
      return;
    }

    const friendships: Partial<Friendship>[] = [];

    for (let i = 0; i < Math.min(10, this.userIds.length - 1); i++) {
      const requesterId = this.userIds[i];
      const addresseeId = this.userIds[i + 1];

      friendships.push({
        requester: { id: requesterId } as User,
        requesterId,
        addressee: { id: addresseeId } as User,
        addresseeId,
        status: FriendshipStatus.ACCEPTED,
      });
    }

    await this.friendshipRepository.save(friendships);
    this.logger.log(`Created ${friendships.length} friendships`);
  }

  private async seedConversations() {
    this.logger.log('Seeding conversations and messages...');

    const existingConversations = await this.conversationRepository.count();
    if (existingConversations > 0) {
      this.logger.log('Conversations already exist. Skipping.');
      return;
    }

    const conversations: Partial<Conversation>[] = [];
    const messages: Partial<Message>[] = [];
    const participants: Partial<ConversationParticipant>[] = [];

    const sampleMessages = [
      'Assalamualaikum! How are you?',
      'Waalaikumsalam! I am fine, alhamdulillah. How about you?',
      'Doing great! Have you found someone special yet?',
      'Not yet, still looking. What about you?',
      'I am still searching too. Let us keep making dua.',
      'Absolutely! May Allah make it easy for us.',
      'Which city are you from?',
      'I am from Cairo. You?',
      'Alexandria here. Nice to meet you!',
      'Nice to meet you too!',
    ];

    for (let i = 0; i < Math.min(10, this.userIds.length - 1); i++) {
      const user1Id = this.userIds[i];
      const user2Id = this.userIds[i + 1];

      const conversation = await this.conversationRepository.save({
        type: ConversationType.ONE_TO_ONE,
        createdBy: { id: user1Id } as User,
        isGroup: false,
      });
      conversations.push(conversation);

      participants.push({
        conversationId: conversation.id,
        userId: user1Id,
        role: ParticipantRole.MEMBER,
        isAdmin: false,
      });
      participants.push({
        conversationId: conversation.id,
        userId: user2Id,
        role: ParticipantRole.MEMBER,
        isAdmin: false,
      });

      for (let j = 0; j < 3; j++) {
        const msgIndex = (i * 3 + j) % sampleMessages.length;
        messages.push({
          conversation: { id: conversation.id } as Conversation,
          sender: { id: user1Id } as User,
          contentEncrypted: sampleMessages[msgIndex],
          type: MessageType.TEXT,
        });
      }
    }

    await this.participantRepository.save(participants);
    await this.messageRepository.save(messages);
    this.logger.log(`Created ${conversations.length} conversations with messages`);
  }

  async resetDatabase() {
    this.logger.log('Resetting database...');

    await this.participantRepository.delete({});
    await this.messageRepository.delete({});
    await this.conversationRepository.delete({});
    await this.friendshipRepository.delete({});
    await this.postRepository.delete({});
    await this.profileRepository.delete({});
    await this.userRepository.delete({});

    this.userIds = [];
    this.postIds = [];

    this.logger.log('Database reset complete');
    return { message: 'Database reset complete' };
  }

  async getSeedStatus() {
    const users = await this.userRepository.count();
    const profiles = await this.profileRepository.count();
    const posts = await this.postRepository.count();
    const friendships = await this.friendshipRepository.count();
    const conversations = await this.conversationRepository.count();
    const messages = await this.messageRepository.count();

    return {
      users,
      profiles,
      posts,
      friendships,
      conversations,
      messages,
      total: users + profiles + posts + friendships + conversations + messages,
    };
  }
}