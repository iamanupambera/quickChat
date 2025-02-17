import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser } from 'src/helpers/decorators/auth-user.decorator';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(
    @Body() createMessageDto: CreateMessageDto,
    @AuthUser('userId') userId: number,
  ) {
    return this.messageService.create(createMessageDto, userId);
  }

  @Get('conversation/:conversationId')
  findAll(
    @Param('conversationId') conversationId: string,
    @AuthUser('userId') userId: number,
  ) {
    return this.messageService.findAll(+conversationId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(+id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(+id);
  }
}
