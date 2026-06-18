import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1/ai')
@UseGuards(AuthGuard('jwt'))
export class GeneticHealthController {
  @Get('genetic-alert/:targetUserId')
  async checkGeneticAlert(
    @Request() req: any,
    @Param('targetUserId') targetUserId: string,
  ) {
    // Returns only boolean — never exposes markers
    return {
      has_conflict: false,
      message: 'Genetic compatibility assessment requires medical data from both users',
    };
  }
}
