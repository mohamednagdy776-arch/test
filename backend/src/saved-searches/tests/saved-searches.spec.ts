import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { SavedSearchesService } from '../saved-searches.service';

describe('[Body_Sadek] SavedSearchesService (#757)', () => {
  it('creates a saved search scoped to the user (trims name)', async () => {
    const saved: any[] = [];
    const repo = { create: (x: any) => x, save: async (x: any) => { saved.push(x); return { id: 's1', ...x }; } } as any;
    const svc = new SavedSearchesService(repo);
    const res: any = await svc.create('u1', '  Cairo singles  ', { city: 'Cairo' });
    expect(res.userId).toBe('u1');
    expect(res.name).toBe('Cairo singles');
    expect(res.filters).toEqual({ city: 'Cairo' });
  });

  it('only deletes a row owned by the user', async () => {
    const repo = { findOne: async ({ where }: any) => (where.id === 's1' && where.userId === 'u1' ? { id: 's1' } : null), delete: async () => undefined } as any;
    const svc = new SavedSearchesService(repo);
    await expect(svc.remove('u1', 's1')).resolves.toEqual({ success: true });
    await expect(svc.remove('other', 's1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
