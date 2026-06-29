import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { GroupMember } from './group-member.entity';

export type GroupPrivacy = 'public' | 'private' | 'secret';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'public' })
  privacy: GroupPrivacy;

  // Persisted group category. Was never a column, so categories sent on create
  // were dropped and the category filter had nothing to match (#37).
  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  coverPhoto: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  rules: string;

  @Column({ nullable: true })
  tags: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => GroupMember, member => member.group)
  members: GroupMember[];
}
