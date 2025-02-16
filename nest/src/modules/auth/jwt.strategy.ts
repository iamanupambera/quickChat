import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUserInterface } from 'src/helpers/interfaces';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from './users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersRepository: UsersRepository,
    readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_SECRET'),
    });
  }

  async validate({ email, userId }: AuthUserInterface) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      });
    }

    if (user.phone_number !== email) {
      throw new ForbiddenException({
        statusCode: 419,
        message: 'Session Expired',
        error: 'Conflict Error',
      });
    }
    return {
      userId,
      email,
    };
  }
}
