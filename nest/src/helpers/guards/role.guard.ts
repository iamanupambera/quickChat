import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersRepository } from 'src/modules/auth/users.repository';

// This guard is only for predefined roles, access.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.user;

    const user = await this.usersRepository.findById(userId);

    if (!user) return false;

    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles.length) {
      return false;
    }

    return this.validateRoles(roles, '');
  }

  private validateRoles(roles: string[], userRoles: string) {
    return roles.some((role) => userRoles.includes(role));
  }
}
