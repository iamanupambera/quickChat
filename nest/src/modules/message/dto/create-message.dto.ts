import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  conversationId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  messageContent: string;
}
