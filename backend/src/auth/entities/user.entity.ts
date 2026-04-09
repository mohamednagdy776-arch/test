import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';
import { randomBytes } from 'crypto';

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

  @Column({ name: 'verification_token', nullable: true })
  verificationToken: string;

  @Column({ name: 'verification_expires', nullable: true })
  verificationExpires: Date;

  @Column({ name: 'reset_token', nullable: true })
  resetToken: string;

  @Column({ name: 'reset_token_expires', nullable: true })
  resetTokenExpires: Date;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', nullable: true })
  lockedUntil: Date;

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

  @BeforeInsert()
  generateVerificationToken() {
    this.verificationToken = randomBytes(32).toString('hex');
    this.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
}
