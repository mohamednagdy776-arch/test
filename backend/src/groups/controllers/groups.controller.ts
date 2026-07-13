import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, UploadedFile, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { memoryStorage } from 'multer';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import sharp from 'sharp';
import { signMediaPath } from '../../common/utils/media-token';
import { GroupsService } from '../services/groups.service';
import { PostsService } from '../../posts/services/posts.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { CreatePostDto } from '../../posts/dto/create-post.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('groups')
export class GroupsController {
  constructor(
    private groupsService: GroupsService,
    private postsService: PostsService,
  ) {}

  // Accepts both a JSON-only body and a multipart form with an optional
  // `coverPhoto` file. FileInterceptor makes multer parse the multipart request
  // (otherwise @Body() is empty and ValidationPipe 400s on the missing `name` —
  // #33). The cover is validated/persisted exactly like the user avatar/cover
  // upload (sharp-validate bytes + write to uploads + signed media url).
  @Post()
  @UseInterceptors(FileInterceptor('coverPhoto', {
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
  async create(
    @Body() dto: CreateGroupDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: User,
  ) {
    if (file) {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      // Persist under the existing whitelisted `covers/` media type so the signed
      // url is actually servable by MediaController (which only allows a fixed set
      // of types). Same dir/treatment as the user cover upload.
      const destDir = join(process.cwd(), 'uploads', 'covers');
      mkdirSync(destDir, { recursive: true });
      // Decode the real bytes with sharp so a file that lies about being an
      // image fails as a clean 400 rather than a 500 (#750 pattern).
      let processed: Buffer;
      try {
        processed = await sharp(file.buffer)
          // withoutEnlargement -- sharp upscales by default when the source is
          // smaller than the target box, which visibly pixelates small cover
          // uploads instead of just cropping them to the right ratio (#158).
          .resize(1200, 375, { fit: 'cover', position: 'centre', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      } catch {
        throw new BadRequestException('File is not a valid image');
      }
      writeFileSync(join(destDir, filename), processed);
      const mediaPath = `covers/${filename}`;
      const token = signMediaPath(mediaPath);
      dto.coverPhoto = `/api/v1/media/${mediaPath}?t=${token}`;
    }
    const group = await this.groupsService.create(dto, user);
    return ok(group, 'Group created');
  }

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.groupsService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('search')
  async search(@Query('q') q: string, @CurrentUser() user: User) {
    const result = await this.groupsService.search(q, user.id);
    return ok(result);
  }

  @Get('autocomplete')
  async autocomplete(@Query('q') q: string) {
    const results = await this.groupsService.autocomplete(q);
    return ok(results);
  }

  @Get('my')
  async myGroups(@CurrentUser() user: User) {
    const groups = await this.groupsService.getMyGroups(user.id);
    return ok(groups);
  }

  // Static segments MUST be declared before @Get(':id'); otherwise they are
  // captured by the :id param and rejected as a non-UUID ("Invalid identifier
  // format").
  // `category` is read separately from the PaginationDto because the global
  // ValidationPipe whitelist strips properties not declared on the DTO (#37).
  @Get('public')
  async findPublic(@Query() query: PaginationDto, @Query('category') category?: string) {
    const { data, total } = await this.groupsService.findByPrivacy('public', query.page!, query.limit!, category);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('private')
  async findPrivate(@Query() query: PaginationDto, @Query('category') category?: string) {
    const { data, total } = await this.groupsService.findByPrivacy('private', query.page!, query.limit!, category);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('suggested')
  async suggested(@Query('limit') limit: string, @CurrentUser() user: User) {
    return ok(await this.groupsService.getSuggested(user.id, limit ? Number(limit) : 5));
  }

  @Get('pending')
  async pending(@CurrentUser() user: User) {
    return ok(await this.groupsService.getPendingRequests(user.id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const group = await this.groupsService.findOne(id, user.id);
    return ok(group);
  }

  // Group admins had no way to update the group at all -- no endpoint existed
  // (#192). Reuses the same cover-photo validation/persist pattern as create().
  @Patch(':id')
  @UseInterceptors(FileInterceptor('coverPhoto', {
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
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: User,
  ) {
    if (file) {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      const destDir = join(process.cwd(), 'uploads', 'covers');
      mkdirSync(destDir, { recursive: true });
      let processed: Buffer;
      try {
        processed = await sharp(file.buffer)
          // withoutEnlargement -- sharp upscales by default when the source is
          // smaller than the target box, which visibly pixelates small cover
          // uploads instead of just cropping them to the right ratio (#158).
          .resize(1200, 375, { fit: 'cover', position: 'centre', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      } catch {
        throw new BadRequestException('File is not a valid image');
      }
      writeFileSync(join(destDir, filename), processed);
      const mediaPath = `covers/${filename}`;
      const token = signMediaPath(mediaPath);
      dto.coverPhoto = `/api/v1/media/${mediaPath}?t=${token}`;
    }
    const group = await this.groupsService.update(id, user.id, dto);
    return ok(group, 'Group updated');
  }

  // No invite mechanism existed at all -- secret groups are invite-only and
  // aren't discoverable, so there was no way to grow one past its creator (#299).
  @Post(':id/members/:userId/invite')
  async inviteMember(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: User) {
    const member = await this.groupsService.inviteMember(id, userId, user.id);
    return ok(member, 'Member invited');
  }

  // Ban/unban existed in the service (with proper admin-role checks) but were
  // never wired to any route -- dead, unreachable code (#192).
  @Post(':id/members/:userId/ban')
  async banMember(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: User) {
    const member = await this.groupsService.banMember(id, userId, user.id);
    return ok(member, 'Member banned');
  }

  @Post(':id/members/:userId/unban')
  async unbanMember(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: User) {
    const member = await this.groupsService.unbanMember(id, userId, user.id);
    return ok(member, 'Member unbanned');
  }

  @Post(':id/members/:userId/approve')
  async approveJoinRequest(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: User) {
    const member = await this.groupsService.approveJoinRequest(id, userId, user.id);
    return ok(member, 'Join request approved');
  }

  @Post(':id/members/:userId/reject')
  async rejectJoinRequest(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: User) {
    await this.groupsService.rejectJoinRequest(id, userId, user.id);
    return ok(null, 'Join request rejected');
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @CurrentUser() user: User) {
    const group = await this.groupsService.join(id, user);
    return ok(group, 'Joined group');
  }

  @Delete(':id/leave')
  async leave(@Param('id') id: string, @CurrentUser() user: User) {
    await this.groupsService.leave(id, user.id);
    return ok(null, 'Left group');
  }

  @Get(':id/members')
  async getMembers(@Param('id') id: string, @Query() query: PaginationDto, @CurrentUser() user: User) {
    await this.assertCanViewContent(id, user.id);
    const members = await this.groupsService.getMembers(id, query.page!, query.limit!);
    return ok(members);
  }

  // Non-members could load any private/secret group's posts or member list by
  // UUID alone -- neither route checked membership at all (#300, #301). Secret
  // groups 404 via findOne() itself (not even meant to be discoverable);
  // private groups exist but deny content to non-members.
  private async assertCanViewContent(groupId: string, userId: string): Promise<void> {
    const group = await this.groupsService.findOne(groupId, userId);
    if (group.privacy === 'private' && !group.isMember) {
      throw new ForbiddenException('Join this group to view its content');
    }
  }

  // ── Group posts (H-09) ────────────────────────────────────────

  @Get(':id/posts')
  async getGroupPosts(@Param('id') id: string, @Query() query: PaginationDto, @CurrentUser() user: User) {
    await this.assertCanViewContent(id, user.id);
    const { data, total } = await this.postsService.findByGroup(
      id,
      query.page || 1,
      query.limit || 20,
    );
    return paginated(data, total, query.page || 1, query.limit || 20);
  }

  @Post(':id/posts')
  async createGroupPost(
    @Param('id') id: string,
    @Body() dto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    // Must be a member to post in the group (was unchecked — any user who knew
    // a group UUID could post in it, including private/secret groups).
    if (!(await this.groupsService.isMember(id, user.id))) {
      throw new ForbiddenException('You must be a member of this group to post');
    }
    const post = await this.postsService.create(id, dto, user);
    return ok(post, 'Post created');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    await this.groupsService.delete(id);
    return ok(null, 'Group deleted');
  }
}
