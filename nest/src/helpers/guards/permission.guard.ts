import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersRepository } from 'src/modules/auth/users.repository';

// If permissions exist then accessible for all logged-in user.
// If permissions not exist then accessible for only admin.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly usersRepository: UsersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.user;

    const user = await this.usersRepository.findById(userId);

    if (!user) return false;
    // const requestRoutePath = request.route.path;
    // const requestMethod = request.method;

    // for (const permission of user.role.permissions) {
    //   if (
    //     permission?.path === requestRoutePath &&
    //     permission?.method === requestMethod
    //   ) {
    //     return true;
    //   }
    // }

    return false;
  }
}
