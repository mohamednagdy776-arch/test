import { IsOptional, IsString, Length } from 'class-validator';

export class CreateAffiliateDto {
  @IsOptional()
  @IsString()
  @Length(4, 16)
  referralCode?: string;
}
