import 'reflect-metadata';
import { describe, it, expect, beforeAll } from '@jest/globals';
import sharp from 'sharp';
import { BadRequestException } from '@nestjs/common';
import { ChildPredictionController } from '../child-prediction.controller';

// [Body_Sadek] #742 — the 3-4 min generation pipeline used to run on anything
// with an image MIME, including a 2x2 non-face PNG. The controller now validates
// real image bytes + a minimum resolution before calling the service.

let tiny: Buffer;
let valid: Buffer;
let notImage: Buffer;

beforeAll(async () => {
  tiny = await sharp({ create: { width: 2, height: 2, channels: 3, background: { r: 0, g: 0, b: 0 } } }).png().toBuffer();
  valid = await sharp({ create: { width: 200, height: 200, channels: 3, background: { r: 10, g: 20, b: 30 } } }).jpeg().toBuffer();
  notImage = Buffer.from('this is definitely not an image');
});

function makeController(predictImpl = async () => 'data:image/jpeg;base64,AAAA') {
  const svc = { predict: predictImpl } as any;
  return new ChildPredictionController(svc);
}

const file = (buf: Buffer) => ({ buffer: buf }) as any;

describe('[Body_Sadek] child-prediction image validation (#742)', () => {
  it('rejects a 2x2 image as too small before running the pipeline', async () => {
    let called = false;
    const c = makeController(async () => { called = true; return 'x'; });
    await expect(c.predict([file(tiny), file(valid)])).rejects.toBeInstanceOf(BadRequestException);
    expect(called).toBe(false); // pipeline never invoked
  });

  it('rejects non-image bytes', async () => {
    const c = makeController();
    await expect(c.predict([file(notImage), file(valid)])).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts two valid images and runs the pipeline', async () => {
    let called = false;
    const c = makeController(async () => { called = true; return 'data:image/jpeg;base64,AAAA'; });
    const res: any = await c.predict([file(valid), file(valid)]);
    expect(called).toBe(true);
    expect(res.success).toBe(true);
  });
});
