import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { ok } from '../../common/response.helper';

// Unauthenticated endpoint exposing ONLY share-safe profile fields, so social
// crawlers (which have no session) can render Open Graph previews with the
// user's real name/photo instead of a placeholder (#400). Deliberately returns
// a minimal subset — never email/phone or other private data.
@Controller('public')
export class PublicProfileController {
  constructor(private usersService: UsersService) {}

  @Get('profile/:idOrUsername')
  async ogProfile(@Param('idOrUsername') idOrUsername: string) {
    const p: any = await this.usersService.getPublicProfile(idOrUsername);
    if (!p) return ok(null);
    return ok({
      fullName: p.fullName ?? null,
      username: p.username ?? null,
      avatarUrl: p.avatarUrl ?? null,
      coverUrl: p.coverUrl ?? null,
      bio: p.bio ?? null,
    });
  }
}
