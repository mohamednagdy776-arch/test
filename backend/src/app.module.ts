import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
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
import { FollowsModule } from './follows/follows.module';
import { UploadModule } from './upload/upload.module';
import { PagesModule } from './pages/pages.module';
import { EventsModule } from './events/events.module';
import { SearchModule } from './search/search.module';
import { SettingsModule } from './settings/settings.module';
import { MemoriesModule } from './memories/memories.module';
import { VideosModule } from './videos/videos.module';
import { SeedModule } from './seed/seed.module';
import { ChildPredictionModule } from './features/child-prediction.module';
import { MediaModule } from './media/media.module';
import { ConsentModule } from './consent/consent.module';
import { MedicalModule } from './medical/medical.module';
import { LabPortalModule } from './lab-portal/lab-portal.module';
import { FamilyModule } from './family/family.module';
import { LinkPreviewModule } from './link-preview/link-preview.module';
import { InterestsModule } from './interests/interests.module';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    CommonModule,
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
    FollowsModule,
    UploadModule,
    PagesModule,
    EventsModule,
    SearchModule,
    SettingsModule,
    MemoriesModule,
    VideosModule,
    ChildPredictionModule,
    MediaModule,
    ConsentModule,
    MedicalModule,
    LabPortalModule,
    FamilyModule,
    LinkPreviewModule,
    InterestsModule,
    VerificationModule,
    ...(process.env.NODE_ENV !== 'production' ? [SeedModule] : []),
  ],
  providers: [
    // Globally serialize responses through class-transformer so @Exclude() on
    // sensitive entity columns (User.passwordHash, totpSecret, reset/verification
    // tokens, etc.) is honored on EVERY endpoint that returns those entities —
    // including the 11 that joined the raw User relation and leaked auth secrets
    // (#745). Default options keep all other fields (excludeExtraneousValues:false).
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
