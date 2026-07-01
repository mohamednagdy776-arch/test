import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportReport } from '../entities/support-report.entity';
import { CreateSupportReportDto } from '../dto/create-support-report.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportReport)
    private supportRepo: Repository<SupportReport>,
  ) {}

  // Persist a "Report a Problem" ticket (#50). userId is null for an anonymous
  // submission; attachments is the list of stored upload filenames (may be empty).
  async createReport(
    userId: string | null,
    dto: CreateSupportReportDto,
    attachments: string[] = [],
  ) {
    const report = this.supportRepo.create({
      userId: userId ?? null,
      type: dto.type,
      description: dto.description.trim(),
      email: dto.email?.trim() || null,
      attachments: attachments.length ? attachments : null,
      status: 'open',
    });
    return this.supportRepo.save(report);
  }
}
