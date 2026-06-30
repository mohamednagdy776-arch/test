import { IsIn, IsOptional } from 'class-validator';

// Full set of supported reactions. The picker in the web client sends any of
// these; previously only like/love/support were whitelisted, so haha/wow/sad/
// angry were rejected with a 400 and never recorded (#14). 'support' is kept
// for backward-compatibility with already-stored rows.
export const REACTION_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'angry', 'support'] as const;

export class CreateReactionDto {
  @IsOptional()
  @IsIn(REACTION_TYPES as unknown as string[])
  type?: string;
}
