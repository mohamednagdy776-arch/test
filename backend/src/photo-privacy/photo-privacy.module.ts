import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoAccessRequest } from './entities/photo-access-request.entity';
import { Friendship } from '../friends/entities/friendship.entity';
import { Interest } from '../interests/entities/interest.entity';
import { PhotoPrivacyService } from './photo-privacy.service';
import { PhotoPrivacyController } from './photo-privacy.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([PhotoAccessRequest, Friendship, Interest]), NotificationsModule],
  providers: [PhotoPrivacyService],
  controllers: [PhotoPrivacyController],
  exports: [PhotoPrivacyService],
})
export class PhotoPrivacyModule {}
