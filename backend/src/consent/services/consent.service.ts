import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Or } from 'typeorm';
import { ConsentRequest, ConsentStatus, ConsentType } from '../entities/consent-request.entity';
import { ConsentAuditLog, ConsentAuditAction } from '../entities/consent-audit-log.entity';
import { CreateConsentRequestDto } from '../dto/create-consent-request.dto';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(ConsentRequest)
    private consentRepo: Repository<ConsentRequest>,
    @InjectRepository(ConsentAuditLog)
    private auditRepo: Repository<ConsentAuditLog>,
  ) {}

  async requestConsent(
    requesterId: string,
    targetId: string,
    type: ConsentType,
    ip: string,
  ): Promise<ConsentRequest> {
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    const request = this.consentRepo.create({
      requesterUserId: requesterId,
      targetUserId: targetId,
      consentType: type,
      status: ConsentStatus.PENDING,
      expiresAt,
    });

    const saved = await this.consentRepo.save(request);

    await this.saveAuditLog(saved.id, ConsentAuditAction.REQUESTED, requesterId, ip);

    return saved;
  }

  async respondToConsent(
    consentId: string,
    userId: string,
    accept: boolean,
    ip: string,
  ): Promise<ConsentRequest> {
    const request = await this.consentRepo.findOne({ where: { id: consentId } });
    if (!request) throw new NotFoundException('Consent request not found');

    if (request.targetUserId !== userId) {
      throw new ForbiddenException('Only the target user can respond to this consent request');
    }

    if (request.status !== ConsentStatus.PENDING) {
      throw new ForbiddenException('This consent request is no longer pending');
    }

    if (request.expiresAt < new Date()) {
      await this.consentRepo.update(consentId, { status: ConsentStatus.EXPIRED });
      throw new ForbiddenException('This consent request has expired');
    }

    const newStatus = accept ? ConsentStatus.ACCEPTED : ConsentStatus.DECLINED;
    const respondedAt = new Date();

    await this.consentRepo.update(consentId, { status: newStatus, respondedAt });

    const auditAction = accept ? ConsentAuditAction.ACCEPTED : ConsentAuditAction.DECLINED;
    await this.saveAuditLog(consentId, auditAction, userId, ip);

    return this.consentRepo.findOne({ where: { id: consentId } }) as Promise<ConsentRequest>;
  }

  async revokeConsent(
    consentId: string,
    userId: string,
    ip: string,
  ): Promise<ConsentRequest> {
    const request = await this.consentRepo.findOne({ where: { id: consentId } });
    if (!request) throw new NotFoundException('Consent request not found');

    const isParty = request.requesterUserId === userId || request.targetUserId === userId;
    if (!isParty) {
      throw new ForbiddenException('Only parties to the consent can revoke it');
    }

    if (request.status !== ConsentStatus.ACCEPTED) {
      throw new ForbiddenException('Only accepted consent can be revoked');
    }

    const revokedAt = new Date();
    await this.consentRepo.update(consentId, {
      status: ConsentStatus.REVOKED,
      revokedAt,
    });

    await this.saveAuditLog(consentId, ConsentAuditAction.REVOKED, userId, ip);

    return this.consentRepo.findOne({ where: { id: consentId } }) as Promise<ConsentRequest>;
  }

  async hasActiveConsent(
    userA: string,
    userB: string,
    type: ConsentType,
  ): Promise<boolean> {
    const now = new Date();
    const count = await this.consentRepo.count({
      where: [
        {
          requesterUserId: userA,
          targetUserId: userB,
          consentType: type,
          status: ConsentStatus.ACCEPTED,
        },
        {
          requesterUserId: userB,
          targetUserId: userA,
          consentType: type,
          status: ConsentStatus.ACCEPTED,
        },
      ],
    });

    if (count === 0) return false;

    // Verify none have expired
    const valid = await this.consentRepo
      .createQueryBuilder('cr')
      .where(
        '((cr.requesterUserId = :a AND cr.targetUserId = :b) OR (cr.requesterUserId = :b AND cr.targetUserId = :a))',
        { a: userA, b: userB },
      )
      .andWhere('cr.consentType = :type', { type })
      .andWhere('cr.status = :status', { status: ConsentStatus.ACCEPTED })
      .andWhere('cr.expiresAt > :now', { now })
      .getCount();

    return valid > 0;
  }

  async getMyConsentRequests(userId: string): Promise<ConsentRequest[]> {
    return this.consentRepo.find({
      where: [
        { requesterUserId: userId },
        { targetUserId: userId },
      ],
      order: { requestedAt: 'DESC' },
    });
  }

  private async saveAuditLog(
    consentRequestId: string,
    action: ConsentAuditAction,
    actorUserId: string,
    ipAddress: string,
  ): Promise<void> {
    const log = this.auditRepo.create({
      consentRequestId,
      action,
      actorUserId,
      ipAddress,
    });
    await this.auditRepo.save(log);
  }
}
