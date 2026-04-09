import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Group } from './group.entity';
import { User } from '../../auth/entities/user.entity';

export type MemberRole = 'admin' | 'moderator' | 'member';

@Entity('group_members')
@Unique(['group', 'user'])
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 'member' })
  role: MemberRole;

  @Column({ default: false })
  isBanned: boolean;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
