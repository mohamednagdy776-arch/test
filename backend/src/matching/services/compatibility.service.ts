import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompatibilityScore } from '../entities/compatibility-score.entity';

@Injectable()
export class CompatibilityService {
  constructor(
    @InjectRepository(CompatibilityScore) private scoresRepo: Repository<CompatibilityScore>,
  ) {}

  async getTopMatches(userId: string, limit = 20): Promise<CompatibilityScore[]> {
    return this.scoresRepo.find({
      where: [{ userIdA: userId }, { userIdB: userId }],
      order: { score: 'DESC' },
      take: limit,
    });
  }

  async upsertScore(
    userIdA: string,
    userIdB: string,
    score: number,
    breakdown: Record<string, number>,
  ): Promise<void> {
    const [a, b] = [userIdA, userIdB].sort();
    const existing = await this.scoresRepo.findOne({ where: { userIdA: a, userIdB: b } });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    if (existing) {
      await this.scoresRepo.update(existing.id, { score, breakdown, expiresAt, computedAt: new Date() });
    } else {
      await this.scoresRepo.save(this.scoresRepo.create({ userIdA: a, userIdB: b, score, breakdown, expiresAt }));
    }
  }
}
