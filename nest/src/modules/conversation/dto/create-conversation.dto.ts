import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray({})
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  participantIds: number[];
}
