import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { StoriesService } from '../services/stories.service';

// [Body_Sadek] #748 — empty Story create (201) and empty Post edit (200) were
// accepted. The service now rejects content with neither media nor text.

// StoriesService has 10 constructor deps; build with stubs and override the two
// repos the guards touch. The guards run before any repo call for the empty case.
function makeService(): any {
  return new (StoriesService as any)(...Array(10).fill({}));
}

describe('[Body_Sadek] empty-content guards (#748)', () => {
  it('createStory rejects a story with no media and no text', async () => {
    const svc = makeService();
    await expect(svc.createStory('u1', {})).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.createStory('u1', { text: '   ' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updatePost rejects an edit that blanks the post to nothing', async () => {
    const post: any = { id: 'p1', userId: 'u1', content: 'hello', mediaUrl: null, mediaUrls: [] };
    const svc = makeService();
    svc.postRepo = { findOne: async () => post, save: async (x: any) => x };
    await expect(svc.updatePost('p1', 'u1', { content: '   ' })).rejects.toBeInstanceOf(BadRequestException);
  });
});
