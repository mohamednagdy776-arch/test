import {
  Controller, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../services/users.service';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';
import { memoryStorage } from 'multer';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class AvatarController {
  constructor(private usersService: UsersService) {}

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Only image files allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    // Convert to base64 data URL for storage (no S3 needed in dev)
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;

    const profile = await this.usersService.updateProfile(user.id, { avatarUrl: dataUrl });
    return ok({ avatarUrl: profile.avatarUrl }, 'Avatar uploaded');
  }
}
