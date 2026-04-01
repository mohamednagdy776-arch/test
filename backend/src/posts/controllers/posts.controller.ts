import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PostsService } from '../services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideo = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (allowedImage.includes(file.mimetype) || allowedVideo.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'), false);
  }
};

@UseGuards(AuthGuard('jwt'))
@Controller('groups/:groupId/posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  async create(
    @Param('groupId') groupId: string,
    @Body() dto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    const post = await this.postsService.create(groupId, dto, user);
    return ok(post, 'Post created');
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } }))
  async createWithMedia(
    @Param('groupId') groupId: string,
    @Body() dto: CreatePostDto,
    @UploadedFile() file: any,
    @CurrentUser() user: User,
  ) {
    if (file) {
      dto.mediaUrl = `/uploads/${file.filename}`;
      dto.mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    }
    const post = await this.postsService.create(groupId, dto, user);
    return ok(post, 'Post created');
  }

  @Get()
  async findAll(@Param('groupId') groupId: string, @Query() query: PaginationDto) {
    const { data, total } = await this.postsService.findByGroup(groupId, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Delete(':postId')
  async delete(@Param('postId') postId: string) {
    await this.postsService.delete(postId);
    return ok(null, 'Post deleted');
  }
}
