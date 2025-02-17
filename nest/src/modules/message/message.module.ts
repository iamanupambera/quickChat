import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { RedisModule } from '../redis/redis.module';
import { MessageRepository } from './message.repository';
import { ConversationRepository } from '../conversation/conversation.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [RedisModule, PrismaModule],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository, ConversationRepository],
})
export class MessageModule {}
