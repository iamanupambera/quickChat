import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateConversationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray({})
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  participantIds: number[];
}
