import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { Post } from '../posts/entities/post.entity';
import { Friendship } from '../friends/entities/friendship.entity';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';
import { ConversationParticipant } from '../chat/entities/conversation-participant.entity';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      Post,
      Friendship,
      Conversation,
      Message,
      ConversationParticipant,
    ]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
  exports: [SeedService],
})
export class SeedModule {}