import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CommonErrors } from 'src/helpers/error';
import { response } from 'src/helpers/interfaces';
import { RedisService } from '../redis/redis.service';
import { ConversationRepository } from '../conversation/conversation.repository';
import { MessageRepository } from './message.repository';

@Injectable()
export class MessageService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly messageRepository: MessageRepository,
    private readonly redisService: RedisService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    userId: number,
  ): Promise<response> {
    const { conversationId, messageContent } = createMessageDto;

    const conversation =
      await this.conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new BadRequestException(CommonErrors.ConversationNotFound);
    }

    const message = await this.messageRepository.create(
      { conversationId, messageContent },
      userId,
    );

    await this.redisService.redis.publish(
      `message:new:${conversationId}`,
      JSON.stringify(message),
    );

    return {
      statusCode: 201,
      response: message,
      message: 'message send successfully',
    };
  }

  async findAll(conversationId: number, userId: number): Promise<response> {
    const conversation =
      await this.conversationRepository.gseUserConversationByUserIdAndConversationId(
        conversationId,
        userId,
      );

    if (!conversation) {
      throw new BadRequestException(CommonErrors.ConversationNotFound);
    }

    const messages =
      this.messageRepository.findByConversationId(conversationId);

    return {
      statusCode: 201,
      response: messages,
      message: 'Conversation all message',
    };
  }

  async findOne(id: number): Promise<response> {
    const message = await this.messageRepository.findById(id);

    if (!message) {
      throw new BadRequestException(CommonErrors.MessageNotFound);
    }

    return {
      statusCode: 200,
      response: message,
      message: 'message details',
    };
  }

  async update(id: number, { status }: UpdateMessageDto): Promise<response> {
    const isExist = await this.messageRepository.findById(id);

    if (!isExist) {
      throw new BadRequestException(CommonErrors.MessageNotFound);
    }

    const message = await this.messageRepository.updateById(id, status);

    await this.redisService.redis.publish(
      `message:update:${message.conversation_id}`,
      JSON.stringify(message),
    );

    return {
      statusCode: 200,
      response: message,
      message: 'update successfully',
    };
  }

  async remove(id: number): Promise<response> {
    return {
      statusCode: 200,
      response: { id },
      message: 'delete successfully',
    };
  }
}
