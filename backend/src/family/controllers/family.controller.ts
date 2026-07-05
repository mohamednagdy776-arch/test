import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FamilyService } from '../services/family.service';
import { RelationshipType } from '../entities/family-relationship.entity';

@Controller('family')
@UseGuards(AuthGuard('jwt'))
export class FamilyController {
  constructor(private service: FamilyService) {}

  @Post('invite-guardian')
  inviteGuardian(
    @Request() req: any,
    @Body() dto: { guardianUserId: string; type: RelationshipType },
  ) {
    return this.service.inviteGuardian(req.user.id, dto.guardianUserId, dto.type);
  }

  @Patch('invitation/:id/accept')
  accept(@Request() req: any, @Param('id') id: string) {
    return this.service.acceptInvitation(id, req.user.id);
  }

  @Delete('relationship/:id')
  revoke(@Request() req: any, @Param('id') id: string) {
    return this.service.revokeRelationship(id, req.user.id);
  }

  @Get('ward/:wardId/activity-summary')
  getSummary(@Request() req: any, @Param('wardId') wardId: string) {
    return this.service.getWardSummary(req.user.id, wardId);
  }

  @Get('my-guardians')
  getGuardians(@Request() req: any) {
    return this.service.getMyGuardians(req.user.id);
  }

  @Get('my-wards')
  getWards(@Request() req: any) {
    return this.service.getMyWards(req.user.id);
  }
}
