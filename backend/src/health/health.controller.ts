import { Controller, Get } from '@nestjs/common';

// Health check endpoint — used by Docker and load balancers
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'backend', timestamp: new Date().toISOString() };
  }
}
