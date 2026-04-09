import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivacySettings } from './entities/privacy-settings.entity';
import { Block } from './entities/block.entity';
import { SettingsService } from './services/settings.service';
import { SettingsController } from './controllers/settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PrivacySettings, Block])],
  providers: [SettingsService],
  controllers: [SettingsController],
})
export class SettingsModule {}