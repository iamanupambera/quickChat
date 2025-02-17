import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsEnum(MessageStatus)
  status: MessageStatus;
}
