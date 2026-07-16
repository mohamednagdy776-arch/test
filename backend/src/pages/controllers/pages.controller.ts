import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import sharp from 'sharp';
import { signMediaPath } from '../../common/utils/media-token';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PagesService } from '../services/pages.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

const PAGE_IMAGE_FIELDS = FileFieldsInterceptor(
  [{ name: 'profilePhoto', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }],
  {
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
  },
);

@UseGuards(AuthGuard('jwt'))
@Controller('pages')
export class PagesController {
  constructor(private pagesService: PagesService) {}

  // Pages had create/read/follow/like but no way to ever set or change a
  // cover photo or avatar -- no file interceptor on create() and no PATCH
  // route at all (#372). Reuses the same sharp-validate + signed-media-url
  // pattern as group cover uploads; profilePhoto is square (avatar-style),
  // coverPhoto is a wide banner like the group cover.
  private async processPageImages(files?: { profilePhoto?: Express.Multer.File[]; coverPhoto?: Express.Multer.File[] }) {
    const result: { profilePhoto?: string; coverPhoto?: string } = {};
    const destDir = join(process.cwd(), 'uploads', 'covers');
    mkdirSync(destDir, { recursive: true });

    const avatarFile = files?.profilePhoto?.[0];
    if (avatarFile) {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      let processed: Buffer;
      try {
        // withoutEnlargement -- sharp upscales a smaller source by default,
        // visibly pixelating small uploads instead of just cropping (#158).
        processed = await sharp(avatarFile.buffer).resize(400, 400, { fit: 'cover', position: 'centre', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
      } catch {
        throw new BadRequestException('Profile photo is not a valid image');
      }
      writeFileSync(join(destDir, filename), processed);
      const mediaPath = `covers/${filename}`;
      result.profilePhoto = `/api/v1/media/${mediaPath}?t=${signMediaPath(mediaPath)}`;
    }

    const coverFile = files?.coverPhoto?.[0];
    if (coverFile) {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      let processed: Buffer;
      try {
        processed = await sharp(coverFile.buffer).resize(1200, 375, { fit: 'cover', position: 'centre', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
      } catch {
        throw new BadRequestException('Cover photo is not a valid image');
      }
      writeFileSync(join(destDir, filename), processed);
      const mediaPath = `covers/${filename}`;
      result.coverPhoto = `/api/v1/media/${mediaPath}?t=${signMediaPath(mediaPath)}`;
    }

    return result;
  }

  @Post()
  @UseInterceptors(PAGE_IMAGE_FIELDS)
  async create(
    @Body() dto: CreatePageDto,
    @UploadedFiles() files: { profilePhoto?: Express.Multer.File[]; coverPhoto?: Express.Multer.File[] },
    @CurrentUser() user: User,
  ) {
    Object.assign(dto, await this.processPageImages(files));
    const page = await this.pagesService.create(dto, user);
    return ok(page, 'Page created');
  }

  @Patch(':id')
  @UseInterceptors(PAGE_IMAGE_FIELDS)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @UploadedFiles() files: { profilePhoto?: Express.Multer.File[]; coverPhoto?: Express.Multer.File[] },
    @CurrentUser() user: User,
  ) {
    Object.assign(dto, await this.processPageImages(files));
    const page = await this.pagesService.update(id, user.id, dto);
    return ok(page, 'Page updated');
  }

  // `category` isn't a PaginationDto field, so it has to be bound with its
  // own @Query() decorator -- the global ValidationPipe's whitelist:true
  // silently strips any query param not declared on the DTO, and even if it
  // got through, findAll() below never accepted or filtered on it (#408).
  @Get()
  async findAll(@Query() query: PaginationDto, @Query('category') category?: string) {
    const { data, total } = await this.pagesService.findAll(query.page!, query.limit!, category);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('my')
  async myPages(@CurrentUser() user: User) {
    const pages = await this.pagesService.getMyPages(user.id);
    return ok(pages);
  }

  // Static segments MUST precede @Get(':id') or they get captured by :id and
  // rejected as a non-UUID ("Invalid identifier format"). `search` was
  // missing entirely, so GET /pages/search fell through to :id with
  // id="search" and 404'd (#123).
  @Get('search')
  async search(@Query('q') q: string) {
    return ok(await this.pagesService.search(q ?? ''));
  }

  @Get('created')
  async created(@CurrentUser() user: User) {
    return ok(await this.pagesService.getCreated(user.id));
  }

  @Get('suggested')
  async suggested(@Query('limit') limit: string, @CurrentUser() user: User) {
    return ok(await this.pagesService.getSuggested(user.id, limit ? Number(limit) : 5));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user?: User) {
    const page = await this.pagesService.findOne(id, user?.id);
    return ok(page);
  }

  @Get(':id/posts')
  async pagePosts(@Param('id') id: string, @Query() query: PaginationDto) {
    const { data, total } = await this.pagesService.getPosts(id, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Post(':id/posts')
  async createPagePost(@Param('id') id: string, @Body('content') content: string, @CurrentUser() user: User) {
    const post = await this.pagesService.createPost(id, user.id, content);
    return ok(post, 'Post created');
  }

  @Post(':id/follow')
  async follow(@Param('id') id: string, @CurrentUser() user: User) {
    const page = await this.pagesService.follow(id, user);
    return ok(page, 'Following page');
  }

  @Delete(':id/follow')
  async unfollow(@Param('id') id: string, @CurrentUser() user: User) {
    await this.pagesService.unfollow(id, user.id);
    return ok(null, 'Unfollowed page');
  }

  @Post(':id/like')
  async like(@Param('id') id: string, @CurrentUser() user: User) {
    const page = await this.pagesService.like(id, user);
    return ok(page, 'Liked page');
  }

  @Delete(':id/like')
  async unlike(@Param('id') id: string, @CurrentUser() user: User) {
    await this.pagesService.unlike(id, user.id);
    return ok(null, 'Unliked page');
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string, @CurrentUser() user?: User) {
    const page = await this.pagesService.findByUsername(username, user?.id);
    return ok(page);
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async verify(@Param('id') id: string) {
    const page = await this.pagesService.verify(id);
    return ok(page, 'Page verified');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async adminDelete(@Param('id') id: string) {
    await this.pagesService.adminDelete(id);
    return ok(null, 'Page deleted');
  }
}