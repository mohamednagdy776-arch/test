import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Lab, LabStatus } from '../entities/lab.entity';
import { LabUser, LabUserRole } from '../entities/lab-user.entity';
import { LabReferralCode } from '../entities/lab-referral-code.entity';
import { LabInvoice } from '../entities/lab-invoice.entity';
import { Profile } from '../../users/entities/profile.entity';

@Injectable()
export class LabPortalService {
  constructor(
    @InjectRepository(Lab) private labsRepo: Repository<Lab>,
    @InjectRepository(LabUser) private labUsersRepo: Repository<LabUser>,
    @InjectRepository(LabReferralCode) private codesRepo: Repository<LabReferralCode>,
    @InjectRepository(LabInvoice) private invoicesRepo: Repository<LabInvoice>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    private jwtService: JwtService,
  ) {}

  async createLab(name: string, commercialRegistration: string): Promise<Lab> {
    const lab = this.labsRepo.create({ name, commercialRegistration });
    return this.labsRepo.save(lab);
  }

  async loginLabUser(email: string, password: string): Promise<{ token: string; labId: string; labName: string; role: string } | null> {
    const user = await this.labUsersRepo.findOne({
      where: { email, isActive: true },
      relations: ['lab'],
    });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    await this.labUsersRepo.update(user.id, { lastLoginAt: new Date() });
    const token = this.jwtService.sign({
      sub: user.id,
      labId: user.labId,
      role: user.role,
      type: 'lab',
    });
    return { token, labId: user.labId, labName: user.lab?.name ?? '', role: user.role };
  }

  async verifyLabToken(token: string): Promise<{ labId: string; role: string } | null> {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'lab') return null;
      return { labId: payload.labId, role: payload.role };
    } catch {
      return null;
    }
  }

  async createLabUser(labId: string, email: string, password: string, role: LabUserRole = LabUserRole.LAB_TECHNICIAN): Promise<LabUser> {
    const lab = await this.labsRepo.findOne({ where: { id: labId } });
    if (!lab) throw new NotFoundException('Lab not found');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.labUsersRepo.create({ labId, email, passwordHash, role });
    return this.labUsersRepo.save(user);
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
    if (referral.usedAt) return null;
    if (referral.expiresAt < new Date()) return null;
    return referral;
  }

  async scanAndVerify(code: string, labId: string): Promise<{ success: boolean; userId: string }> {
    const referral = await this.validateReferralCode(code, labId);
    if (!referral) throw new BadRequestException('Invalid, expired, or already used referral code');

    await this.codesRepo.update(referral.id, { usedAt: new Date() });

    // Mark the user's profile as health-verified
    const profile = await this.profilesRepo.findOne({ where: { user: { id: referral.userId } } });
    if (profile) {
      await this.profilesRepo.update(profile.id, { isHealthVerified: true });
    }

    return { success: true, userId: referral.userId };
  }

  async getAllLabs(): Promise<Lab[]> {
    return this.labsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateLabStatus(labId: string, status: LabStatus) {
    return this.labsRepo.update(labId, { status });
  }

  async submitResult(referralCode: string, labId: string, _resultType: string): Promise<{ success: boolean; pendingApprovalId: string }> {
    const result = await this.scanAndVerify(referralCode, labId);
    return { success: result.success, pendingApprovalId: referralCode };
  }

  async getLabInvoices(labId: string): Promise<LabInvoice[]> {
    return this.invoicesRepo.find({ where: { labId }, order: { createdAt: 'DESC' } });
  }

  async getAllInvoicesForLab(labId: string): Promise<LabInvoice[]> {
    return this.invoicesRepo.find({ where: { labId }, order: { createdAt: 'DESC' } });
  }

  async getActiveLabs(): Promise<Lab[]> {
    return this.labsRepo.find({
      where: { status: LabStatus.ACTIVE },
      select: ['id', 'name', 'commercialRegistration', 'status', 'createdAt'],
      order: { name: 'ASC' },
    });
  }

  async getMyReferralCodes(userId: string): Promise<LabReferralCode[]> {
    return this.codesRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
