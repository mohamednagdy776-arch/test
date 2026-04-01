import { IsIn, IsOptional } from 'class-validator';

export class CreateReactionDto {
  @IsOptional()
  @IsIn(['like', 'love', 'support'])
  type?: string;
}
