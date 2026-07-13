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
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(FamilyRelationship)
    private relRepo: Repository<FamilyRelationship>,
    private notifications: NotificationsService,
  ) {}

  async inviteGuardian(
    wardUserId: string,
    guardianUserId: string,
    type: RelationshipType,
  ): Promise<FamilyRelationship> {
    if (wardUserId === guardianUserId) {
      throw new BadRequestException('لا يمكنك تعيين نفسك ولي أمر لنفسك');
    }
    const rel = this.relRepo.create({
      wardUserId,
      guardianUserId,
      relationshipType: type,
    });
    const saved = await this.relRepo.save(rel);
    // The invited party had no notification and no endpoint to even discover
    // invitations addressed to them (getMyGuardians only returns invites the
    // CALLER sent) -- invitations were invisible to the invitee (#200).
    await this.notifications.notifyUser(guardianUserId, wardUserId, 'family_invite', 'invited you as a guardian', 'family_relationship', saved.id);
    return saved;
  }

  async acceptInvitation(
    relationshipId: string,
    guardianUserId: string,
  ): Promise<FamilyRelationship> {
    const rel = await this.relRepo.findOne({
      where: { id: relationshipId, guardianUserId },
    });
    if (!rel || rel.status !== RelationshipStatus.PENDING) {
      throw new NotFoundException('الدعوة غير موجودة');
    }
    await this.relRepo.update(relationshipId, {
      status: RelationshipStatus.ACTIVE,
      acceptedAt: new Date(),
    });
    const updated = await this.relRepo.findOne({ where: { id: relationshipId } });
    if (!updated) throw new NotFoundException('تعذّر العثور على العلاقة بعد التحديث');
    return updated;
  }

  async revokeRelationship(relationshipId: string, userId: string): Promise<void> {
    const rel = await this.relRepo.findOne({ where: { id: relationshipId } });
    if (!rel) throw new NotFoundException('العلاقة غير موجودة');
    if (rel.wardUserId !== userId && rel.guardianUserId !== userId) {
      throw new ForbiddenException('غير مصرح لك بهذا الإجراء');
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
    if (!rel) throw new ForbiddenException('لا توجد علاقة ولاية نشطة');
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

  // The invited party (guardian) had no way to list invitations addressed to
  // them at all -- mirror of getMyGuardians from the other side (#200).
  async getMyWards(guardianUserId: string): Promise<FamilyRelationship[]> {
    return this.relRepo.find({ where: { guardianUserId } });
  }
}
