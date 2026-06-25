import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSearch } from './saved-search.entity';

@Injectable()
export class SavedSearchesService {
  constructor(@InjectRepository(SavedSearch) private repo: Repository<SavedSearch>) {}

  list(userId: string) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  create(userId: string, name: string, filters: Record<string, any>) {
    return this.repo.save(this.repo.create({ userId, name: name.trim(), filters: filters ?? {} }));
  }

  async remove(userId: string, id: string) {
    const row = await this.repo.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('Saved search not found');
    await this.repo.delete(row.id);
    return { success: true };
  }
}
