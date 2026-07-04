import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivacySettings } from './entities/privacy-settings.entity';
import { Block } from './entities/block.entity';
import { Friendship } from '../friends/entities/friendship.entity';
import { SettingsService } from './services/settings.service';
import { SettingsController } from './controllers/settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PrivacySettings, Block, Friendship])],
  providers: [SettingsService],
  controllers: [SettingsController],
  // Exported so the chat layer (#457) and posts layer (#456) can use it.
  exports: [SettingsService],
})
export class SettingsModule {}