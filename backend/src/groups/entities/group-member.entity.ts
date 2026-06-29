import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Group } from './group.entity';
import { User } from '../../auth/entities/user.entity';

export type MemberRole = 'admin' | 'moderator' | 'member';
// 'active' = a full member; 'pending' = a join request awaiting admin approval
// (private groups). Pending rows are NOT counted as members and don't appear in
// "my groups" — they surface under pending requests until approved (#36).
export type MemberStatus = 'active' | 'pending';

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

  @Column({ default: 'active' })
  status: MemberStatus;

  @Column({ default: false })
  isBanned: boolean;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
