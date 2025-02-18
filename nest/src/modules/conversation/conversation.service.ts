import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { CommonErrors } from 'src/helpers/error';
import { ConversationRepository } from './conversation.repository';
import { response } from 'src/helpers/interfaces';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly redisService: RedisService,
  ) {}
  async create(
    { participantIds }: CreateConversationDto,
    userId: number,
  ): Promise<response> {
    if (!participantIds.includes(userId)) {
      participantIds.push(userId);
    }

    if (participantIds.length < 2) {
      throw new BadRequestException(CommonErrors.InvalidConversationDetails);
    }

    const conversation = await this.conversationRepository.create(
      participantIds,
      userId,
    );

    // Publish event to Redis
    await this.redisService.redis.publish(
      `conversation:new:${userId}`,
      JSON.stringify(conversation),
    );

    return {
      statusCode: 201,
      response: conversation,
      message: 'conversation create successfully',
    };
  }

  async findAll(userId: number): Promise<response> {
    const conversations =
      await this.conversationRepository.getUserConversations(userId);

    return {
      statusCode: 200,
      response: conversations,
      message: 'all conversation',
    };
  }

  async findOne(id: number): Promise<response> {
    const conversation = await this.conversationRepository.findById(id);

    return {
      statusCode: 200,
      response: conversation,
      message: 'Conversation details',
    };
  }

  async update(
    id: number,
    { participantIds }: UpdateConversationDto,
    userId: number,
  ): Promise<response> {
    const isExist = await this.conversationRepository.findById(id);

    if (!isExist) {
      throw new BadRequestException(CommonErrors.ConversationNotFound);
    }

    const conversation = this.conversationRepository.updateById(
      id,
      participantIds,
      userId,
    );

    return {
      statusCode: 200,
      response: conversation,
      message: 'Conversation update successfully',
    };
  }

  async remove(id: number): Promise<response> {
    return {
      statusCode: 200,
      response: { id },
      message: 'conversation delete successfully',
    };
  }
}
