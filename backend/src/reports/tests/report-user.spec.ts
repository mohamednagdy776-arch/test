import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';

function makeService(existing: any = null) {
  const saved: any[] = [];
  const repo = {
    findOne: async () => existing,
    create: (x: any) => x,
    save: async (x: any) => { saved.push(x); return { id: 'r1', ...x }; },
  } as any;
  return { svc: new ReportsService(repo), saved };
}

describe('[Body_Sadek] ReportsService user reporting (#751)', () => {
  it('exposes a non-empty reason catalog', () => {
    const reasons = makeService().svc.getReasons();
    expect(reasons.length).toBeGreaterThan(3);
    expect(reasons.map((r) => r.id)).toContain('harassment');
  });

  it('rejects an unknown reason', async () => {
    await expect(makeService().svc.createReport('u1', 'user', 'u2', 'not_a_reason'))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects reporting yourself', async () => {
    await expect(makeService().svc.createReport('u1', 'user', 'u1', 'harassment'))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a report with a valid reason + details', async () => {
    const { svc, saved } = makeService();
    await svc.createReport('u1', 'user', 'u2', 'fake_profile', '  scam account  ');
    expect(saved[0]).toMatchObject({ targetType: 'user', targetId: 'u2', reason: 'fake_profile', details: 'scam account' });
  });

  it('collapses a duplicate pending report instead of creating a second', async () => {
    const { svc, saved } = makeService({ id: 'existing', status: 'pending' });
    const res: any = await svc.createReport('u1', 'user', 'u2', 'harassment');
    expect(res.id).toBe('existing');
    expect(saved).toHaveLength(0);
  });
});
