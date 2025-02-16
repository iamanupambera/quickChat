import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthUserInterface, response } from 'src/helpers/interfaces';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UsersRepository } from './users.repository';
import { CommonErrors } from 'src/helpers/error';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    authRegisterDto: AuthRegisterDto,
    res: Response,
  ): Promise<response> {
    const { phone_number } = authRegisterDto;

    const isExist = await this.usersRepository.findByEmail(phone_number);

    if (isExist) {
      throw new BadRequestException(CommonErrors.EmailExist);
    }

    const user = await this.usersRepository.create(authRegisterDto);

    const tokenPayload: AuthUserInterface = {
      email: user.phone_number,
      userId: user.user_id,
    };
    const token = this.jwtService.sign(tokenPayload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(tokenPayload);
    user.password = undefined;

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
    });

    return {
      statusCode: 201,
      response: { ...user, token, password: undefined },
      message: 'registration successfully',
    };
  }

  async login({ email, password }: LoginDto, res: Response): Promise<response> {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(CommonErrors.UserNotFound);
    }

    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      throw new UnauthorizedException(CommonErrors.Unauthorized);
    }

    const tokenPayload: AuthUserInterface = {
      email: user.phone_number,
      userId: user.user_id,
    };
    const token = this.jwtService.sign(tokenPayload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(tokenPayload);
    user.password = undefined;

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
    });

    return {
      statusCode: 200,
      response: { ...user, token, password: undefined },
      message: '',
    };
  }

  async refreshAccessToken(
    token: string,
  ): Promise<response<{ readonly accessToken: string }>> {
    if (!token) {
      throw new UnauthorizedException(CommonErrors.LoginSessionOut);
    }
    let auth: AuthUserInterface;
    try {
      auth = this.jwtService.verify(token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      throw new UnauthorizedException(CommonErrors.LoginSessionOut);
    }
    const { email, userId } = auth;
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException(CommonErrors.UserNotFound);
    }

    if (user.phone_number !== email) {
      throw new UnauthorizedException(CommonErrors.Unauthorized);
    }

    const tokenPayload: AuthUserInterface = {
      email: user.phone_number,
      userId: user.user_id,
    };
    const accessToken = this.jwtService.sign(tokenPayload, {
      expiresIn: '1d',
    });

    return {
      statusCode: 200,
      response: { accessToken },
      message: '',
    };
  }

  async getLoggedUser(userId: number): Promise<response> {
    const loggedUser = await this.usersRepository.findById(userId);

    loggedUser.password = undefined;
    return {
      statusCode: 200,
      response: loggedUser,
      message: '',
    };
  }
}
