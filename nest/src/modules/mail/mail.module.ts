import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import * as fs from 'fs/promises';

// const certFilePath = resolve(__dirname, 'path_to_your_cert.pem');

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow('MAIL_HOST'),
          port: Number(config.getOrThrow('MAIL_PORT')),
          secure: true,
          auth: {
            user: config.getOrThrow('MAIL_USER'),
            pass: config.getOrThrow('MAIL_PASSWORD'),
          },
          tls: {
            rejectUnauthorized: false,
            // ca: [await fs.readFile(certFilePath)], // Todo add ssl service
          },
        },
        defaults: {
          from: `"${config.getOrThrow('MAIL_FROM_NAME')}" <${config.getOrThrow(
            'MAIL_FROM',
          )}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
