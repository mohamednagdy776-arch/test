import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendsController } from './controllers/friends.controller';
import { FriendsService } from './services/friends.service';
import { Friendship, FriendList, UserBlock, UserRestriction } from './entities/friendship.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friendship, FriendList, UserBlock, UserRestriction])],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService],
})
export class FriendsModule {}