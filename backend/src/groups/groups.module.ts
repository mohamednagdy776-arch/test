import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupsService } from './services/groups.service';
import { GroupsController } from './controllers/groups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Group])],
  providers: [GroupsService],
  controllers: [GroupsController],
})
export class GroupsModule {}
