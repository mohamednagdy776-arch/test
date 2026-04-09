import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Conversation } from './conversation.entity';

export enum ParticipantRole {
  MEMBER = 'member',
  ADMIN = 'admin',
  CREATOR = 'creator',
}

@Entity('conversation_participants')
export class ConversationParticipant {
  @PrimaryColumn('uuid')
  conversationId: string;

  @PrimaryColumn('uuid')
  userId: string;

  @ManyToOne(() => Conversation, (conv) => conv.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ParticipantRole, default: ParticipantRole.MEMBER })
  role: ParticipantRole;

  @Column({ default: false })
  isMuted: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}