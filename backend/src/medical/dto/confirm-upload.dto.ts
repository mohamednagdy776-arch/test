import { IsString, Length } from 'class-validator';

export class ConfirmUploadDto {
  @IsString()
  @Length(64, 64)
  checksumSha256: string;
}
