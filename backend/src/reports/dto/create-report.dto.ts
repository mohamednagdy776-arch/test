import { IsEnum, IsString, IsUUID } from 'class-validator';

export class CreateReportDto {
  @IsEnum(['user', 'post', 'group'])
  targetType: 'user' | 'post' | 'group';

  @IsUUID()
  targetId: string;

  @IsString()
  reason: string;
}
