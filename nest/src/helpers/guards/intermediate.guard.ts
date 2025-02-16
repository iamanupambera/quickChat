import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from './permission.guard';
import { RolesGuard } from './role.guard';

// For all logged-in user access.
@Injectable()
export class PermissionsAndRolesGuard implements CanActivate {
  constructor(
    private readonly permissionsGuard: PermissionsGuard,
    private readonly rolesGuard: RolesGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if PermissionsGuard allows access
    const permissionsPassed = await this.permissionsGuard.canActivate(context);

    if (permissionsPassed) {
      return true; // Permissions allow access
    }

    // If PermissionsGuard didn't allow access, check with RolesGuard
    return await this.rolesGuard.canActivate(context);
  }
}
