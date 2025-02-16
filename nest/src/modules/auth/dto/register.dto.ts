import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthRegisterDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'First Name is required.' })
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Last Name is required.' })
  @IsString()
  readonly lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter correct email' })
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password is required.' })
  @IsString({ message: 'Password must be a string.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  readonly password: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Phone number is required.' })
  @IsString()
  readonly phone_number: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly role: string;
}
