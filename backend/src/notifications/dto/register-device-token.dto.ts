import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { DevicePlatform } from '../entities/device-token.entity';

export class RegisterDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEnum(DevicePlatform)
  platform: DevicePlatform;
}
