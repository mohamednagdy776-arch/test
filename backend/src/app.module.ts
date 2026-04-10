import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MatchingModule } from './matching/matching.module';
import { ChatModule } from './chat/chat.module';
import { GroupsModule } from './groups/groups.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AffiliatesModule } from './affiliates/affiliates.module';
import { HealthModule } from './health/health.module';
import { ReportsModule } from './reports/reports.module';
import { FriendsModule } from './friends/friends.module';
import { UploadModule } from './upload/upload.module';
import { PagesModule } from './pages/pages.module';
import { EventsModule } from './events/events.module';
import { SearchModule } from './search/search.module';
import { SettingsModule } from './settings/settings.module';
import { MemoriesModule } from './memories/memories.module';
import { VideosModule } from './videos/videos.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // PostgreSQL connection via env
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Feature modules
    AuthModule,
    UsersModule,
    MatchingModule,
    ChatModule,
    GroupsModule,
    PostsModule,
    CommentsModule,
    ReactionsModule,
    SubscriptionsModule,
    PaymentsModule,
    NotificationsModule,
    AffiliatesModule,
    HealthModule,
    ReportsModule,
    FriendsModule,
    UploadModule,
    PagesModule,
    EventsModule,
    SearchModule,
    SettingsModule,
    MemoriesModule,
    VideosModule,
    SeedModule,
  ],
})
export class AppModule {}
