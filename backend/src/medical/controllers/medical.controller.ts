import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MedicalService } from '../services/medical.service';
import { InitiateMedicalUploadDto } from '../dto/initiate-medical-upload.dto';
import { ConfirmUploadDto } from '../dto/confirm-upload.dto';
import { MedicalFileValidationPipe } from '../pipes/medical-file-validation.pipe';

@UseGuards(AuthGuard('jwt'))
@Controller('medical')
export class MedicalController {
  constructor(private readonly medicalService: MedicalService) {}

  @Post('upload/initiate')
  async initiateUpload(
    @Body(MedicalFileValidationPipe) dto: InitiateMedicalUploadDto,
    @Req() req: any,
  ) {
    return this.medicalService.initiateUpload(
      req.user.id,
      dto.documentType,
      dto.fileSize,
      dto.mimeType,
    );
  }

  @Patch('upload/:id/confirm')
  async confirmUpload(
    @Param('id') id: string,
    @Body() dto: ConfirmUploadDto,
    @Req() req: any,
  ) {
    return this.medicalService.confirmUpload(id, req.user.id, dto.checksumSha256);
  }

  @Get('my')
  async getMyDocuments(@Req() req: any) {
    return this.medicalService.getMyDocuments(req.user.id);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string, @Req() req: any) {
    return this.medicalService.deleteDocument(id, req.user.id);
  }
}
