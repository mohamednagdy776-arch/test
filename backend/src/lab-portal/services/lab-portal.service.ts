import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Lab, LabStatus } from '../entities/lab.entity';
import { LabUser } from '../entities/lab-user.entity';
import { LabReferralCode } from '../entities/lab-referral-code.entity';
import { LabInvoice } from '../entities/lab-invoice.entity';

@Injectable()
export class LabPortalService {
  constructor(
    @InjectRepository(Lab) private labsRepo: Repository<Lab>,
    @InjectRepository(LabUser) private labUsersRepo: Repository<LabUser>,
    @InjectRepository(LabReferralCode) private codesRepo: Repository<LabReferralCode>,
    @InjectRepository(LabInvoice) private invoicesRepo: Repository<LabInvoice>,
  ) {}

  async createLab(name: string, commercialRegistration: string): Promise<Lab> {
    const lab = this.labsRepo.create({ name, commercialRegistration });
    return this.labsRepo.save(lab);
  }

  async loginLabUser(email: string, password: string): Promise<LabUser | null> {
    const user = await this.labUsersRepo.findOne({
      where: { email, isActive: true },
      relations: ['lab'],
    });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    await this.labUsersRepo.update(user.id, { lastLoginAt: new Date() });
    return user;
  }

  async generateReferralCode(userId: string, labId: string): Promise<LabReferralCode> {
    const code = randomBytes(16).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const referralCode = this.codesRepo.create({ userId, labId, code, expiresAt });
    return this.codesRepo.save(referralCode);
  }

  async validateReferralCode(code: string, labId: string): Promise<LabReferralCode | null> {
    const referral = await this.codesRepo.findOne({ where: { code, labId } });
    if (!referral) return null;
    if (referral.usedAt) return null; // already used
    if (referral.expiresAt < new Date()) return null; // expired
    return referral;
  }

  async getAllLabs(): Promise<Lab[]> {
    return this.labsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateLabStatus(labId: string, status: LabStatus) {
    return this.labsRepo.update(labId, { status });
  }

  async submitResult(
    referralCode: string,
    labId: string,
    _resultType: string,
  ): Promise<{ success: boolean; pendingApprovalId: string }> {
    const code = await this.validateReferralCode(referralCode, labId);
    if (!code) {
      throw new BadRequestException('Invalid, expired, or already used referral code');
    }

    // Mark code as used
    await this.codesRepo.update(code.id, { usedAt: new Date() });

    // In real implementation: store in pending_lab_results, notify user
    return { success: true, pendingApprovalId: code.id };
  }

  async getLabInvoices(labId: string): Promise<LabInvoice[]> {
    return this.invoicesRepo.find({
      where: { labId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllInvoicesForLab(labId: string): Promise<LabInvoice[]> {
    return this.invoicesRepo.find({
      where: { labId },
      order: { createdAt: 'DESC' },
    });
  }
}
