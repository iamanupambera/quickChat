import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthRegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from 'src/helpers/decorators/auth-user.decorator';
import { response } from 'src/helpers/interfaces';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Cookies } from 'src/helpers/guards/cookies.decorator';
import { Trim } from 'src/helpers/guards/trim.decorator';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Trim()
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiNotFoundResponse({
    description: 'Role not found. Please enter correct role!',
  })
  @ApiBadRequestResponse({
    description: 'User email already exist. Please enter another email!',
  })
  register(
    @Body() authRegisterDto: AuthRegisterDto,
    @Res() response: Response,
  ) {
    return this.authService.register(authRegisterDto, response);
  }

  @Post('login')
  @Trim()
  @ApiResponse({
    status: 201,
    description: 'User login successfully.',
  })
  @ApiUnauthorizedResponse({ description: 'Incorrect user details.' })
  @ApiBadRequestResponse({
    description: 'Login failed. Please try again!',
  })
  async login(
    @Body() authLoginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<response> {
    return this.authService.login(authLoginDto, res);
  }

  @Get('refresh-token')
  @ApiOperation({ summary: 'Generate a new access token' })
  @ApiResponse({ status: 200, description: 'Token generated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid input.' })
  refreshAccessToken(@Cookies('refresh-token') token: string) {
    return this.authService.refreshAccessToken(token);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'LoggedIn User details retrieved successfully.',
  })
  getLoggedUser(@AuthUser('userId') userId: number) {
    return this.authService.getLoggedUser(userId);
  }

  @Get('logout')
  @ApiOperation({ summary: 'Logout the user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  logout(@Res() res: Response) {
    res.clearCookie('refresh-token', { httpOnly: true, secure: true });
    return res.status(HttpStatus.OK).json({
      statusCode: 200,
      response: null,
      message: 'Logged out successfully',
    });
  }
}
