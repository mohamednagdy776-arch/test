import { IsIn, IsOptional } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @IsIn(['pending', 'completed', 'failed', 'refunded'])
  status?: string;
}
