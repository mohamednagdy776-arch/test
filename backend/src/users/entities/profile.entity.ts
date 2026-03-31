import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Basic info
  @Column({ name: 'full_name', default: '' })
  fullName: string;

  @Column({ default: 18 })
  age: number;

  @Column({ default: 'male' })
  gender: string;

  @Column({ default: '' })
  country: string;

  @Column({ default: '' })
  city: string;

  @Column({ name: 'social_status', nullable: true })
  socialStatus: string;

  @Column({ name: 'children_count', default: 0 })
  childrenCount: number;

  // Profile picture
  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  // Bio
  @Column({ nullable: true, type: 'text' })
  bio: string;

  // Profile details (from profile_details table — merged here for simplicity)
  @Column({ nullable: true })
  education: string;

  @Column({ name: 'job_title', nullable: true })
  jobTitle: string;

  @Column({ name: 'financial_level', nullable: true })
  financialLevel: string;

  @Column({ name: 'cultural_level', nullable: true })
  culturalLevel: string;

  @Column({ nullable: true })
  lifestyle: string;

  // Religious info
  @Column({ nullable: true })
  sect: string;

  @Column({ name: 'prayer_level', nullable: true })
  prayerLevel: string;

  @Column({ name: 'religious_commitment', nullable: true })
  religiousCommitment: string;

  // Preferences (from preferences table — merged here for simplicity)
  @Column({ name: 'min_age', nullable: true })
  minAge: number;

  @Column({ name: 'max_age', nullable: true })
  maxAge: number;

  @Column({ name: 'preferred_country', nullable: true })
  preferredCountry: string;

  @Column({ name: 'relocate_willing', nullable: true })
  relocateWilling: boolean;

  @Column({ name: 'wants_children', nullable: true })
  wantsChildren: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
