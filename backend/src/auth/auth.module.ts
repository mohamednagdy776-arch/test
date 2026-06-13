import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { AuthService } from './services/auth.service';
import { MailService } from './services/mail.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      // Default token expiry so no code path can ever mint a non-expiring
      // token. Explicit expiresIn at sign() time (access 7d / refresh 30d)
      // still overrides this default.
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  providers: [AuthService, MailService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}

