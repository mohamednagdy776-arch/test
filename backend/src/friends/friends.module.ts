import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsController } from './controllers/friends.controller';
import { FriendsService } from './services/friends.service';
import { Friendship, FriendList, UserBlock, UserRestriction } from './entities/friendship.entity';
import { Follow } from '../follows/entities/follow.entity';
import { Block } from '../settings/entities/block.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  // Block is the table the user-facing POST /blocks writes to. Enforcement used
  // to read the orphaned user_blocks table, so blocks did nothing (#758).
  imports: [TypeOrmModule.forFeature([Friendship, FriendList, UserBlock, UserRestriction, Follow, Block]), NotificationsModule],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}