import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '../prisma/prisma-read.service';
import { PrismaWriteService } from '../prisma/prisma-write.service';
import { MessageStatus } from '@prisma/client';

@Injectable()
export class MessageRepository {
  constructor(
    private readonly dbRead: PrismaReadService,
    private readonly dbWrite: PrismaWriteService,
  ) {}

  async create({ conversationId, messageContent }: any, userId: number) {
    const date = new Date();
    const message = await this.dbWrite.prisma.message.create({
      data: {
        conversation_id: conversationId,
        message_type: 'TEXT',
        status: 'SENT',
        message_content: messageContent,
        sender_id: userId,
        sent_at: date.toISOString(),
      },
    });

    await this.dbWrite.prisma.conversation.update({
      where: {
        conversation_id: conversationId,
      },
      data: {
        last_message_id: message.message_id,
        order_date: date.toISOString(),
      },
    });

    return message;
  }

  findById(message_id: number) {
    return this.dbRead.prisma.message.findUnique({
      where: { message_id },
    });
  }

  async updateById(message_id: number, status: MessageStatus) {
    return this.dbRead.prisma.message.update({
      where: { message_id },
      data: { status },
    });
  }

  findByConversationId(conversation_id: number) {
    return this.dbRead.prisma.message.findMany({
      where: { conversation_id },
      orderBy: { sent_at: 'asc' },
    });
  }
}
