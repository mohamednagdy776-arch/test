import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Match) private matchesRepo: Repository<Match>,
  ) {}

  async getMatches(userId: string, page: number, limit: number) {
    const [data, total] = await this.matchesRepo.findAndCount({
      where: [{ user1: { id: userId } }, { user2: { id: userId } }],
      order: { score: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async respondToMatch(matchId: string, userId: string, status: 'accepted' | 'rejected') {
    const match = await this.matchesRepo.findOneOrFail({ where: { id: matchId } });
    match.status = status;
    return this.matchesRepo.save(match);
  }
}
