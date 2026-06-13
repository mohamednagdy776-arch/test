import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Affiliate } from '../entities/affiliate.entity';
import { CreateAffiliateDto } from '../dto/create-affiliate.dto';
import * as crypto from 'crypto';

@Injectable()
export class AffiliatesService {
  constructor(
    @InjectRepository(Affiliate) private affiliateRepo: Repository<Affiliate>,
  ) {}

  async findByUser(userId: string) {
    return this.affiliateRepo.findOne({ where: { user: { id: userId } } });
  }

  async findByReferralCode(code: string) {
    const affiliate = await this.affiliateRepo.findOne({ where: { referralCode: code }, relations: ['user'] });
    // Strip PII — this is reachable by any authenticated user who knows a code.
    if (affiliate?.user) {
      delete (affiliate.user as any).email;
      delete (affiliate.user as any).phone;
      delete (affiliate.user as any).passwordHash;
    }
    return affiliate;
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.affiliateRepo.findAndCount({
      order: { totalReferred: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
    return { data, total };
  }

  async create(userId: string, dto: CreateAffiliateDto) {
    const existing = await this.affiliateRepo.findOne({ where: { user: { id: userId } } });
    if (existing) throw new ConflictException('User already has an affiliate account');

    const referralCode = dto.referralCode || this.generateReferralCode();
    const affiliate = this.affiliateRepo.create({
      user: { id: userId } as any,
      referralCode,
    });
    return this.affiliateRepo.save(affiliate);
  }

  async recordReferral(affiliateId: string) {
    await this.affiliateRepo.increment({ id: affiliateId }, 'totalReferred', 1);
  }

  async recordMarriage(affiliateId: string) {
    await this.affiliateRepo.increment({ id: affiliateId }, 'totalMarriages', 1);
  }

  async addCommission(affiliateId: string, amount: number) {
    // Reject negative amounts — otherwise a caller could silently drain a
    // commission balance.
    if (!(amount > 0)) {
      throw new BadRequestException('Commission amount must be positive');
    }
    await this.affiliateRepo.increment({ id: affiliateId }, 'commissionBalance', amount);
  }

  private generateReferralCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }
}
