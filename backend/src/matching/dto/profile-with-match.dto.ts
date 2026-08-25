import { IsOptional, IsNumber, IsArray, IsObject } from 'class-validator';

export class ProfileBasicDto {
  id: string;
  email: string;
  phone: string;
  accountType: 'user' | 'guardian' | 'agent' | 'admin';
  status: 'active' | 'pending' | 'banned';
  createdAt: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female';
  age?: number;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  sect?: string;
  lifestyle?: string;
  education?: string;
  occupation?: string;
  bio?: string;
  avatar?: string;
  prayerLevel?: string;
  lookingFor?: string;
  religiousCommitment?: string;
  culturalLevel?: string;
  maritalStatus?: string;
  childrenCount?: number;
  relocateWilling?: boolean;
  settleCountry?: string;
  quranMemorization?: string;
}

export class ProfileWithMatchDto {
  @IsObject()
  user: ProfileBasicDto;

  @IsNumber()
  matchScore: number;

  @IsOptional()
  @IsArray()
  matchReasons?: string[];
}
