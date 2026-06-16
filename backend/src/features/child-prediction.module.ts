import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ChildPredictionController } from './child-prediction.controller';
import { ChildPredictionService } from './child-prediction.service';

@Module({
  imports: [HttpModule.register({ timeout: 120_000, maxRedirects: 3 })],
  controllers: [ChildPredictionController],
  providers: [ChildPredictionService],
})
export class ChildPredictionModule {}