import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname } from 'path';
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

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ── Current user ──────────────────────────────────────────────

  @Get('me')
  async getProfile(@CurrentUser() user: User) {
    return ok(await this.usersService.getProfile(user.id));
  }

  @Patch('me')
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileWithEntriesDto) {
    return ok(await this.usersService.updateProfile(user.id, dto), 'Profile updated');
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return ok(await this.usersService.updateAvatar(user.id, avatarUrl), 'Avatar uploaded');
  }

  @Post('me/cover')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/covers',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadCover(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    const coverUrl = `/uploads/covers/${file.filename}`;
    return ok(await this.usersService.updateCover(user.id, coverUrl), 'Cover uploaded');
  }

  // ── Search (must be before :id routes) ───────────────────────

  @Get('search')
  async search(@Query() dto: SearchUsersDto) {
    return ok(await this.usersService.searchUsers(dto));
  }

  // ── Public profile ────────────────────────────────────────────

  @Get(':id/profile')
  async getPublicProfile(@Param('id') id: string) {
    return ok(await this.usersService.getPublicProfile(id));
  }

  // ── Full profile with tabs ─────────────────────────────────────

  @Get(':id')
  async getFullProfile(@Param('id') id: string, @CurrentUser() user?: User) {
    return ok(await this.usersService.getFullProfile(id, user?.id));
  }

  // ── Profile tabs ───────────────────────────────────────────────

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
  async getActivityLog(@Param('id') id: string, @Query() dto: ActivityLogQueryDto) {
    return ok(await this.usersService.getActivityLog(id, dto));
  }

  // ── Admin ─────────────────────────────────────────────────────

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
