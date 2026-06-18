import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FamilyRelationship,
  RelationshipStatus,
  RelationshipType,
} from '../entities/family-relationship.entity';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(FamilyRelationship)
    private relRepo: Repository<FamilyRelationship>,
  ) {}

  async inviteGuardian(
    wardUserId: string,
    guardianUserId: string,
    type: RelationshipType,
  ): Promise<FamilyRelationship> {
    if (wardUserId === guardianUserId) {
      throw new BadRequestException('Cannot set yourself as your own guardian');
    }
    const rel = this.relRepo.create({
      wardUserId,
      guardianUserId,
      relationshipType: type,
    });
    return this.relRepo.save(rel);
  }

  async acceptInvitation(
    relationshipId: string,
    guardianUserId: string,
  ): Promise<FamilyRelationship> {
    const rel = await this.relRepo.findOne({
      where: { id: relationshipId, guardianUserId },
    });
    if (!rel || rel.status !== RelationshipStatus.PENDING) {
      throw new NotFoundException('Invitation not found');
    }
    await this.relRepo.update(relationshipId, {
      status: RelationshipStatus.ACTIVE,
      acceptedAt: new Date(),
    });
    return this.relRepo.findOne({ where: { id: relationshipId } });
  }

  async revokeRelationship(relationshipId: string, userId: string): Promise<void> {
    const rel = await this.relRepo.findOne({ where: { id: relationshipId } });
    if (!rel) throw new NotFoundException();
    if (rel.wardUserId !== userId && rel.guardianUserId !== userId) {
      throw new ForbiddenException();
    }
    await this.relRepo.update(relationshipId, {
      status: RelationshipStatus.REVOKED,
    });
  }

  async getWardSummary(guardianUserId: string, wardUserId: string) {
    const rel = await this.relRepo.findOne({
      where: {
        guardianUserId,
        wardUserId,
        status: RelationshipStatus.ACTIVE,
      },
    });
    if (!rel) throw new ForbiddenException('No active guardian relationship');
    return {
      wardUserId,
      guardianUserId,
      permissions: rel.permissions,
      note: 'Activity summary requires production data',
    };
  }

  async getMyGuardians(wardUserId: string): Promise<FamilyRelationship[]> {
    return this.relRepo.find({ where: { wardUserId } });
  }
}
