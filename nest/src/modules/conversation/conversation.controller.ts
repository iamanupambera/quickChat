import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthUser } from 'src/helpers/decorators/auth-user.decorator';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'LoggedIn User details retrieved successfully.',
  })
  create(
    @Body() createConversationDto: CreateConversationDto,
    @AuthUser('userId') userId: number,
  ) {
    return this.conversationService.create(createConversationDto, userId);
  }

  @Get()
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'LoggedIn User details retrieved successfully.',
  })
  findAll(@AuthUser('userId') userId: number) {
    return this.conversationService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @AuthUser('userId') userId: number,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationService.update(+id, updateConversationDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationService.remove(+id);
  }
}
