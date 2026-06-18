import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // Placeholder: real check queries subscriptions table
    // For now, allow all authenticated users (subscription check added per-route as needed)
    if (!user) throw new ForbiddenException('Authentication required');
    return true;
  }
}
