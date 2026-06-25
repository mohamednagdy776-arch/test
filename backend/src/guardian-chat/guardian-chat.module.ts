import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuardianOversight } from './guardian-oversight.entity';
import { User } from '../auth/entities/user.entity';
import { GuardianChatService } from './guardian-chat.service';
import { GuardianChatController } from './guardian-chat.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [TypeOrmModule.forFeature([GuardianOversight, User]), ChatModule],
  providers: [GuardianChatService],
  controllers: [GuardianChatController],
})
export class GuardianChatModule {}
