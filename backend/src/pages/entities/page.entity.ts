import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { PageFollower } from './page-follower.entity';

export type PagePrivacy = 'public' | 'private';

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column({ default: 'public' })
  privacy: PagePrivacy;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column({ nullable: true })
  coverPhoto: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  contactInfo: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  hours: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => PageFollower, follower => follower.page)
  followers: PageFollower[];
}