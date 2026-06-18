import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Reaction } from '../entities/reaction.entity';

@Injectable()
export class ReactionRealtimeService {
  async getReactionBreakdown(
    postId: string,
    reactionsRepo: Repository<Reaction>,
  ): Promise<Record<string, number>> {
    const reactions = await reactionsRepo
      .createQueryBuilder('r')
      .select('r.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('r.post_id = :postId', { postId })
      .groupBy('r.type')
      .getRawMany();

    const breakdown: Record<string, number> = {};
    for (const r of reactions) {
      breakdown[r.type] = parseInt(r.count, 10);
    }
    return breakdown;
  }
}
