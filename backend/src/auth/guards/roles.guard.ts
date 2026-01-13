import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user role matches any of the required roles
    // Normalize both sides to strings for comparison
    const userRole = String(user.role).toLowerCase().trim();
    const requiredRolesStrings = requiredRoles.map(r => String(r).toLowerCase().trim());
    
    console.log('RolesGuard: Checking role access', {
      userRole,
      userRoleType: typeof user.role,
      requiredRoles: requiredRolesStrings,
      userId: user.id,
      userEmail: user.email,
      isActive: user.isActive,
    });
    
    const hasRequiredRole = requiredRolesStrings.some((requiredRoleString) => {
      const matches = userRole === requiredRoleString;
      console.log(`RolesGuard: Comparing '${userRole}' with '${requiredRoleString}': ${matches}`);
      return matches;
    });

    if (!hasRequiredRole) {
      console.error(`RolesGuard: Access denied. User role '${userRole}' does not match required roles:`, requiredRolesStrings);
      throw new ForbiddenException(`Access denied. You have role '${userRole}' but need one of: ${requiredRolesStrings.join(', ')}`);
    }

    console.log('RolesGuard: Access granted for user:', user.email, 'with role:', userRole);
    return true;
  }
}
