import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Profile } from '../../users/entities/profile.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  CUSTOM = 'custom',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Exclude()
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_deactivated', default: false })
  isDeactivated: boolean;

  @Exclude()
  @Column({ name: 'verification_token', nullable: true })
  verificationToken: string;

  @Exclude()
  @Column({ name: 'verification_expires', nullable: true })
  verificationExpires: Date;

  @Exclude()
  @Column({ name: 'reset_token', nullable: true })
  resetToken: string;

  @Exclude()
  @Column({ name: 'reset_token_expires', nullable: true })
  resetTokenExpires: Date;

  @Exclude()
  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Exclude()
  @Column({ name: 'locked_until', nullable: true })
  lockedUntil: Date;

  @Exclude()
  @Column({ name: 'totp_secret', nullable: true })
  totpSecret: string;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_verified', default: false })
  twoFactorVerified: boolean;

  @Column({ name: 'account_type', default: 'user' })
  accountType: 'user' | 'guardian' | 'agent' | 'admin';

  @Column({ name: 'oauth_provider', type: 'varchar', length: 50, nullable: true })
  oauthProvider: 'google' | 'github' | null;

  @Exclude()
  @Column({ name: 'oauth_id', nullable: true })
  oauthId: string;

  @Column({ default: 'pending' })
  status: 'active' | 'pending' | 'banned';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToOne(() => Profile, profile => profile.user)
  profile: Profile;

  // NOTE: verification-token generation is done in AuthService.register (which
  // stores a SHA-256 HASH of the token). A @BeforeInsert hook here used to
  // overwrite that with a fresh RAW token on save — undoing the hashing and
  // persisting a usable token in plaintext. Removed. (#121)
}
