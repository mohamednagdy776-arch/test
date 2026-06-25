import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { VideoQueryDto } from '../dto/video-query.dto';

// [Body_Sadek] #749 — GET /videos 500'd with no query params because the handler
// typed the query as an intersection (PaginationDto & {...}), whose runtime
// metatype is Object, so the ValidationPipe never applied page/limit defaults.
// A real DTO class restores the defaults + number transform.
describe('[Body_Sadek] VideoQueryDto (#749)', () => {
  it('defaults page=1 and limit=20 when no params are supplied', () => {
    const dto = plainToInstance(VideoQueryDto, {});
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
  });

  it('coerces string query params to numbers', () => {
    const dto = plainToInstance(VideoQueryDto, { page: '3', limit: '10', isReel: 'true' });
    expect(dto.page).toBe(3);
    expect(dto.limit).toBe(10);
    expect(dto.isReel).toBe('true');
  });

  it('rejects an invalid isReel value', async () => {
    const dto = plainToInstance(VideoQueryDto, { isReel: 'maybe' });
    const errors = await validate(dto);
    expect(errors.flatMap((e) => Object.keys(e.constraints ?? {}))).toContain('isIn');
  });
});
