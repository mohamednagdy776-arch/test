import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Match } from '../../matching/entities/match.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
  ) {}

  async getMessages(matchId: string, page: number, limit: number) {
    const [data, total] = await this.messagesRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('sender.profile', 'profile')
      .where('message.match_id = :matchId', { matchId })
      .orderBy('message.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async sendMessage(matchId: string, senderId: string, content: string, type?: string): Promise<Message> {
    const msg = this.messagesRepo.create({
      match: { id: matchId } as any,
      sender: { id: senderId } as any,
      contentEncrypted: content,
      type: type || 'text',
    } as any) as unknown as Message;
    const saved = await this.messagesRepo.save(msg as any);
    return saved as unknown as Message;
  }

  async createConversation(userId: string, targetUserId: string) {
    const existingMatch = await this.matchRepo
      .createQueryBuilder('match')
      .where(
        '(match.user1_id = :userId AND match.user2_id = :targetId) OR (match.user1_id = :targetId AND match.user2_id = :userId)',
        { userId, targetId: targetUserId },
      )
      .andWhere('match.status = :status', { status: 'chat' })
      .getOne();

    if (existingMatch) {
      return {
        matchId: existingMatch.id,
        userId: targetUserId,
        createdAt: existingMatch.createdAt,
      };
    }

    const match = this.matchRepo.create({
      user1: { id: userId } as any,
      user2: { id: targetUserId } as any,
      status: 'chat' as any,
      score: 0,
    } as any);
    const savedMatch = await this.matchRepo.save(match as any);

    return {
      matchId: (savedMatch as any).id,
      userId: targetUserId,
      createdAt: (savedMatch as any).createdAt,
    };
  }
}
