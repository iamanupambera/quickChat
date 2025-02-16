import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendUserConfirmation(user: User, otp: string) {
    await this.mailerService.sendMail({
      to: user.phone_number,
      subject: 'Welcome to F-jobs! You have successfully signed up!',
      template: './welcome',
      context: {
        apiUrl: this.configService.getOrThrow<string>('BE_URL'),
        url: this.configService.getOrThrow<string>('FE_URL'),
        name: user.name,
        urlQueryParams:
          'email=' + encodeURIComponent(user.phone_number) + '&key=' + otp,
      },
    });
  }

  async notifyChangePassword(user: User) {
    await this.mailerService.sendMail({
      to: user.phone_number,
      subject: 'Password Changed!',
      template: './changePassword',
      context: {
        apiUrl: this.configService.getOrThrow<string>('BE_URL'),
        name: user.name,
      },
    });
  }

  async notifyChangeEmail(user: User) {
    await this.mailerService.sendMail({
      to: user.phone_number,
      subject: 'Email changed successfully!',
      template: './emailChange',
      context: {
        apiUrl: this.configService.getOrThrow<string>('BE_URL'),
        name: user.name,
      },
    });
  }

  async sendOtp(user: User, otp: string) {
    await this.mailerService.sendMail({
      to: user.phone_number,
      subject: 'OTP to reset password',
      template: './resetPassword',
      context: {
        apiUrl: this.configService.getOrThrow<string>('BE_URL'),
        name: user.name,
        otp,
      },
    });
  }
}
