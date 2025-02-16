import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly confirmPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly otp: string;
}
