import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UploadedFile, UseInterceptors, BadRequestException, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import sharp from 'sharp';
import { UsersService } from '../services/users.service';
import { UpdateProfileWithEntriesDto } from '../dto/update-profile.dto';
import { SearchUsersDto } from '../dto/search-users.dto';
import { ActivityLogQueryDto } from '../dto/activity-log.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';
import { sanitizeUserContent } from '../../common/utils/sanitize';
import { signMediaPath } from '../../common/utils/media-token';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: User) {
    return ok(await this.usersService.getProfile(user.id));
  }

  @Patch('me')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // cap profile-update floods (#414)
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileWithEntriesDto) {
    if ((dto as any).bio) (dto as any).bio = sanitizeUserContent((dto as any).bio);
    return ok(await this.usersService.updateProfile(user.id, dto), 'Profile updated');
  }

  @Post('me/avatar')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // cap upload floods / storage exhaustion (#427)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const okExt = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname);
      const okMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype);
      if (!okExt || !okMime) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const destDir = join(process.cwd(), 'uploads', 'avatars');
    mkdirSync(destDir, { recursive: true });
    const processed = await sharp(file.buffer)
      .resize(512, 512, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 88 })
      .toBuffer();
    writeFileSync(join(destDir, filename), processed);
    const mediaPath = `avatars/${filename}`;
    const token = signMediaPath(mediaPath);
    const avatarUrl = `/api/v1/media/${mediaPath}?t=${token}`;
    return ok(await this.usersService.updateAvatar(user.id, avatarUrl), 'Avatar uploaded');
  }

  @Post('me/cover')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // cap upload floods / storage exhaustion (#427)
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const okExt = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname);
      const okMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype);
      if (!okExt || !okMime) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadCover(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const destDir = join(process.cwd(), 'uploads', 'covers');
    mkdirSync(destDir, { recursive: true });
    const processed = await sharp(file.buffer)
      .resize(1200, 375, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 85 })
      .toBuffer();
    writeFileSync(join(destDir, filename), processed);
    const mediaPath = `covers/${filename}`;
    const token = signMediaPath(mediaPath);
    const coverUrl = `/api/v1/media/${mediaPath}?t=${token}`;
    return ok(await this.usersService.updateCover(user.id, coverUrl), 'Cover uploaded');
  }

  @Delete('me/avatar')
  async removeAvatar(@CurrentUser() user: User) {
    return ok(await this.usersService.removeAvatar(user.id), 'Avatar removed');
  }

  @Delete('me/cover')
  async removeCover(@CurrentUser() user: User) {
    return ok(await this.usersService.removeCover(user.id), 'Cover removed');
  }

  @Get('search')
  async search(@Query() dto: SearchUsersDto) {
    return ok(await this.usersService.searchUsers(dto));
  }

  @Get(':id/profile')
  async getPublicProfile(@Param('id') id: string) {
    return ok(await this.usersService.getPublicProfile(id));
  }

  @Get(':id')
  async getFullProfile(@Param('id') id: string, @CurrentUser() user?: User) {
    const [profile, friendshipStatus] = await Promise.all([
      this.usersService.getFullProfile(id, user?.id),
      user?.id && user.id !== id
        ? this.usersService.getFriendshipStatus(id, user.id)
        : Promise.resolve(null),
    ]);
    return ok({ ...profile, friendshipStatus });
  }

  @Get(':id/posts')
  async getUserPosts(@Param('id') id: string, @Query() query: PaginationDto) {
    const { data, total } = await this.usersService.getUserPosts(id, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get(':id/friends')
  async getFriends(@Param('id') id: string, @Query() query: PaginationDto) {
    return ok(await this.usersService.getFriends(id, query.page!, query.limit!));
  }

  @Get(':id/photos')
  async getPhotos(@Param('id') id: string, @Query() query: PaginationDto) {
    return ok(await this.usersService.getPhotos(id, query.page!, query.limit!));
  }

  @Get(':id/videos')
  async getVideos(@Param('id') id: string, @Query() query: PaginationDto) {
    return ok(await this.usersService.getVideos(id, query.page!, query.limit!));
  }

  @Get(':id/activity')
  async getActivityLog(@Param('id') id: string, @Query() dto: ActivityLogQueryDto, @CurrentUser() user: User) {
    // A user's activity log is private to them (was readable by any user — IDOR).
    if (id !== user.id) throw new ForbiddenException('Access denied');
    return ok(await this.usersService.getActivityLog(id, dto));
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.usersService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Patch(':id/ban')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async ban(@Param('id') id: string) {
    return ok(await this.usersService.ban(id), 'User banned');
  }

  @Patch(':id/unban')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async unban(@Param('id') id: string) {
    return ok(await this.usersService.unban(id), 'User unbanned');
  }
}
