import {
  Body, Controller, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VerificationService } from './verification.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { ok, paginated } from '../common/response.helper';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('verification/identity')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  // Submit identity verification: a selfie + a government-ID image (#755).
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'selfie', maxCount: 1 }, { name: 'idDocument', maxCount: 1 }],
      { storage: memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } },
    ),
  )
  async submit(
    @CurrentUser() user: User,
    @UploadedFiles() files: { selfie?: Express.Multer.File[]; idDocument?: Express.Multer.File[] },
  ) {
    const selfie = files?.selfie?.[0];
    const idDocument = files?.idDocument?.[0];
    if (!selfie || !idDocument) {
      throw new BadRequestException('Both a selfie and an ID document are required');
    }
    return ok(await this.verificationService.submit(user.id, selfie.buffer, idDocument.buffer));
  }

  @Get('status')
  async status(@CurrentUser() user: User) {
    return ok(await this.verificationService.getMyStatus(user.id));
  }

  // ---- Admin review queue ----
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async pending(@Query() query: PaginationDto) {
    const { data, total } = await this.verificationService.getPending(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async approve(@Param('id') id: string, @CurrentUser() user: User) {
    return ok(await this.verificationService.approve(id, user.id), 'Identity verified');
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async reject(@Param('id') id: string, @Body('reason') reason: string | undefined, @CurrentUser() user: User) {
    return ok(await this.verificationService.reject(id, user.id, reason), 'Verification rejected');
  }
}
