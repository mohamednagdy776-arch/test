import {
  Controller, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from '../services/users.service';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class AvatarController {
  constructor(private usersService: UsersService) {}

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req: any, file: any, cb: any) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Only image files allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadAvatar(
    @UploadedFile() file: any,
    @CurrentUser() user: User,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    // Store as base64 data URL (no S3 needed in dev)
    const dataUrl = `data:${file.mimetype};base64,${(file.buffer as Buffer).toString('base64')}`;
    const profile = await this.usersService.updateProfile(user.id, { avatarUrl: dataUrl });
    return ok({ avatarUrl: profile.avatarUrl }, 'Avatar uploaded');
  }
}
