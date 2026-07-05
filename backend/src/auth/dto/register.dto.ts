import {
  IsEmail,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Gender } from '../entities/user.entity';

// Requires lower/upper/digit/special-char, but the old trailing character
// class was a strict whitelist that didn't include '.' (or any punctuation
// outside @$!%*?&) -- rejected otherwise-valid passwords like an email
// address with a digit/uppercase appended (#160). Match any char for length,
// just require *some* non-alphanumeric somewhere.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

// Arabic-first app: names must accept Arabic letters as well as Latin. The
// ranges cover the core Arabic block, Arabic Supplement, Extended-A and the
// presentation forms, plus Latin letters, spaces, hyphen and apostrophe (#54).
const NAME_REGEX = /^[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿a-zA-Z\s'-]+$/;

// Username: Arabic + Latin + digits + . _ - , but never spaces (#54).
const USERNAME_REGEX = /^[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿a-zA-Z0-9._-]+$/;

// Reject registrations from users under 18 (#55). dateOfBirth itself is
// required (@IsNotEmpty below) — this constraint only handles the
// too-young/malformed cases once a value is present.
@ValidatorConstraint({ name: 'isAtLeast18', async: false })
export class IsAtLeast18Constraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string' || !value) return true;
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return true; // @IsDateString reports bad format
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
    return age >= 18;
  }

  defaultMessage(): string {
    return 'You must be at least 18 years old to register';
  }
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{6,14}$/, { message: 'phone must be a valid phone number' })
  phone: string;

  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @Matches(NAME_REGEX, { message: 'first name contains invalid characters' })
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @Matches(NAME_REGEX, { message: 'last name contains invalid characters' })
  lastName?: string;

  // Username charset whitelist (Arabic + Latin + digits + . _ - , no spaces)
  // and length bounds (#54, #408, #409). This is the only place a username is set.
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  @Matches(USERNAME_REGEX, {
    message: 'username may only contain letters, numbers, and . _ -',
  })
  username?: string;

  // Required (#124) — was @IsOptional, so registration silently succeeded
  // with no date of birth at all.
  @IsNotEmpty()
  @IsDateString()
  @Validate(IsAtLeast18Constraint)
  dateOfBirth: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  // Affiliate referral code from a shared referral link (?ref=). Nothing
  // ever read this on registration, so referrals were never credited (#107).
  @IsString()
  @IsOptional()
  referralCode?: string;
}
