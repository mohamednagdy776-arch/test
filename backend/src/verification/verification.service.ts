import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import sharp from 'sharp';
import { IdentityVerification } from './entities/identity-verification.entity';
import { Profile } from '../users/entities/profile.entity';
import { signMediaPath } from '../common/utils/media-token';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(IdentityVerification) private verRepo: Repository<IdentityVerification>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
  ) {}

  // Validate the bytes are a real, reasonably-sized image and store a normalized
  // JPEG under the token-protected media path (not publicly listable).
  private async storeImage(buffer: Buffer, kind: string): Promise<string> {
    let processed: Buffer;
    try {
      const meta = await sharp(buffer).metadata();
      if (!meta.width || !meta.height || meta.width < 200 || meta.height < 200) {
        throw new Error('too small');
      }
      processed = await sharp(buffer).rotate().jpeg({ quality: 88 }).toBuffer();
    } catch {
      throw new BadRequestException(`${kind} must be a clear image (min 200x200)`);
    }
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const dir = join(process.cwd(), 'uploads', 'verification');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, filename), processed);
    return `verification/${filename}`;
  }

  async submit(userId: string, selfie: Buffer, idDocument: Buffer) {
    const current = await this.getLatest(userId);
    if (current?.status === 'approved') {
      throw new BadRequestException('Your identity is already verified');
    }
    if (current?.status === 'pending') {
      throw new BadRequestException('You already have a verification under review');
    }
    const selfieUrl = await this.storeImage(selfie, 'Selfie');
    const idDocumentUrl = await this.storeImage(idDocument, 'ID document');

    const submission = this.verRepo.create({ userId, selfieUrl, idDocumentUrl, status: 'pending' });
    await this.verRepo.save(submission);
    return { status: 'pending' as const, message: 'تم استلام طلب التوثيق وسيُراجَع قريباً' };
  }

  private getLatest(userId: string) {
    return this.verRepo.findOne({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getMyStatus(userId: string) {
    const v = await this.getLatest(userId);
    if (!v) return { status: 'unverified' as const };
    return { status: v.status, rejectionReason: v.rejectionReason ?? null, submittedAt: v.createdAt };
  }

  // ---- Admin review ----
  async getPending(page = 1, limit = 20) {
    const [data, total] = await this.verRepo.findAndCount({
      where: { status: 'pending' },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    // Admins DO need the document URLs to review; sign them for fetching.
    return {
      data: data.map((v) => ({
        id: v.id,
        userId: v.userId,
        status: v.status,
        createdAt: v.createdAt,
        selfieUrl: `/api/v1/media/${v.selfieUrl}?t=${signMediaPath(v.selfieUrl)}`,
        idDocumentUrl: `/api/v1/media/${v.idDocumentUrl}?t=${signMediaPath(v.idDocumentUrl)}`,
      })),
      total,
    };
  }

  async approve(id: string, adminId: string) {
    const v = await this.verRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Verification not found');
    v.status = 'approved';
    v.reviewedByAdminId = adminId;
    await this.verRepo.save(v);
    await this.profilesRepo.update({ user: { id: v.userId } }, { isIdentityVerified: true });
    return { status: 'approved' as const };
  }

  async reject(id: string, adminId: string, reason?: string) {
    const v = await this.verRepo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Verification not found');
    v.status = 'rejected';
    v.reviewedByAdminId = adminId;
    v.rejectionReason = reason?.trim() || null;
    await this.verRepo.save(v);
    return { status: 'rejected' as const };
  }
}
