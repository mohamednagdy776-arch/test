import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupsService } from './services/groups.service';
import { GroupsController } from './controllers/groups.controller';
import { PostsModule } from '../posts/posts.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember]), PostsModule, NotificationsModule],
  providers: [GroupsService],
  controllers: [GroupsController],
})
export class GroupsModule {}
