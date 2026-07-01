import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ContentAction } from '../entities/report.entity';

// Catalog of user-report reasons (#751). id is stored; label is shown to the user.
export const REPORT_REASONS: { id: string; label: string }[] = [
  { id: 'fake_profile', label: 'ملف مزيّف / منتحل' },
  { id: 'harassment', label: 'تحرّش أو إساءة' },
  { id: 'inappropriate', label: 'محتوى غير لائق' },
  { id: 'scam', label: 'احتيال أو ابتزاز مالي' },
  { id: 'underage', label: 'حساب لقاصر' },
  { id: 'impersonation', label: 'انتحال شخصية' },
  { id: 'off_platform', label: 'طلب التواصل خارج المنصة' },
  { id: 'other', label: 'أخرى' },
];
const REASON_IDS = new Set(REPORT_REASONS.map((r) => r.id));

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportsRepo: Repository<Report>,
  ) {}

  getReasons() {
    return REPORT_REASONS;
  }

  // Create a report from a normal user (#751). Generic over target type so it
  // covers user/post/group; the user-report route passes targetType='user'.
  async createReport(
    reporterId: string,
    targetType: 'user' | 'post' | 'group' | 'video' | 'comment',
    targetId: string,
    reason: string,
    details?: string,
  ) {
    if (!REASON_IDS.has(reason)) {
      throw new BadRequestException('Invalid report reason');
    }
    if (targetType === 'user' && targetId === reporterId) {
      throw new BadRequestException('You cannot report yourself');
    }
    // Don't let one reporter spam duplicate open reports for the same target;
    // collapse to the existing pending report instead.
    const existing = await this.reportsRepo.findOne({
      where: { reportedBy: { id: reporterId }, targetType, targetId, status: 'pending' },
    });
    if (existing) return existing;

    const report = this.reportsRepo.create({
      reportedBy: { id: reporterId } as any,
      targetType,
      targetId,
      reason,
      details: details?.trim() || null,
      status: 'pending',
    });
    return this.reportsRepo.save(report);
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.reportsRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['reportedBy'],
    });
    return { data, total };
  }

  async resolve(id: string) {
    const report = await this.reportsRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    report.status = 'resolved';
    return this.reportsRepo.save(report);
  }

  async dismiss(id: string) {
    const report = await this.reportsRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    report.status = 'dismissed';
    return this.reportsRepo.save(report);
  }

  async takeAction(
    id: string,
    adminId: string,
    action: ContentAction,
    adminNote?: string,
  ) {
    const report = await this.reportsRepo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');

    report.actionTaken = action;
    report.reviewedByAdminId = adminId;
    report.status = 'resolved';
    if (adminNote) report.adminNote = adminNote;

    return this.reportsRepo.save(report);
  }
}
