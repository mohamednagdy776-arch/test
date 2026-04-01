import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  currency: string;

  @IsIn(['paymob', 'stripe'])
  gateway: string;

  @IsString()
  transactionId: string;

  @IsOptional()
  @IsIn(['pending', 'completed', 'failed'])
  status?: string;
}
