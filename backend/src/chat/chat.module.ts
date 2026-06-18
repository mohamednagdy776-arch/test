import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/conversation-participant.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { TranslationService } from './services/translation.service';
import { Match } from '../matching/entities/match.entity';
import { User } from '../auth/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';
import { FriendsModule } from '../friends/friends.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Conversation,
      ConversationParticipant,
      MessageReaction,
      Match,
      User,
      Profile,
    ]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    // For friend-scoped presence broadcasts (#148).
    FriendsModule,
    // For messaging-privacy enforcement (#457).
    SettingsModule,
  ],
  providers: [ChatGateway, ChatService, TranslationService],
  controllers: [ChatController],
  exports: [ChatService, TranslationService],
})
export class ChatModule {}