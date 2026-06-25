import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCommentDto } from '../../comments/dto/create-comment.dto';
import { UpdateProfileDto } from '../../users/dto/update-profile.dto';

async function errorsFor(cls: any, payload: any): Promise<string[]> {
  const dto = plainToInstance(cls, payload);
  const errors = await validate(dto as object);
  return errors.flatMap((e) => Object.keys(e.constraints ?? {}));
}

describe('[Body_Sadek] content validation (#744, #733)', () => {
  it('rejects whitespace-only comments (#744)', async () => {
    expect(await errorsFor(CreateCommentDto, { content: '   ' })).toContain('isNotEmpty');
    expect(await errorsFor(CreateCommentDto, { content: '' })).toContain('isNotEmpty');
  });

  it('accepts a real comment', async () => {
    expect(await errorsFor(CreateCommentDto, { content: 'Salam' })).toHaveLength(0);
  });

  it('rejects a whitespace-only profile name and an out-of-range age (#733)', async () => {
    expect(await errorsFor(UpdateProfileDto, { fullName: '   ' })).toContain('isNotEmpty');
    expect(await errorsFor(UpdateProfileDto, { age: 999 })).toContain('max');
    expect(await errorsFor(UpdateProfileDto, { age: 5 })).toContain('min');
  });

  it('accepts a valid profile update', async () => {
    expect(await errorsFor(UpdateProfileDto, { fullName: 'Eleen', age: 27 })).toHaveLength(0);
  });
});
