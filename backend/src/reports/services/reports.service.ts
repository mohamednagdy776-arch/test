import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportsRepo: Repository<Report>,
  ) {}

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
}
