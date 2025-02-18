import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '../prisma/prisma-read.service';
import { PrismaWriteService } from '../prisma/prisma-write.service';

@Injectable()
export class ConversationRepository {
  constructor(
    private readonly dbRead: PrismaReadService,
    private readonly dbWrite: PrismaWriteService,
  ) {}

  async create(participantIds: number[], userId: number) {
    const type = participantIds.length > 2 ? 'GROUP' : 'DIRECT';

    const users = await this.dbRead.prisma.user.findMany({
      where: { user_id: { in: participantIds } },
    });

    return this.dbWrite.prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: {
          type,
          UserConversation: {
            createMany: {
              data: users.map(({ user_id }) => {
                return { user_id };
              }),
            },
          },
        },
      });

      if (type === 'GROUP') {
        await tx.group.create({
          data: {
            group_id: conversation.conversation_id,
            group_name: 'untitled',
            created_by: userId,
            members: {
              createMany: {
                data: users.map(({ user_id }) => {
                  return {
                    user_id,
                    role: user_id === userId ? 'ADMIN' : 'MEMBER',
                  };
                }),
              },
            },
          },
        });
      }
      return conversation;
    });
  }

  getUserConversations(user_id: number) {
    return this.dbRead.prisma.conversation.findMany({
      orderBy: { order_date: 'desc' },
      include: {
        UserConversation: {
          where: { user_id },
        },
        last_message: true,
      },
    });
  }

  findById(conversation_id: number) {
    return this.dbRead.prisma.conversation.findUnique({
      where: { conversation_id },
      include: {
        UserConversation: {
          include: {
            User: true,
          },
        },
        last_message: true,
        Group: {
          include: {
            members: true,
          },
        },
      },
    });
  }

  async updateById(
    conversation_id: number,
    participantIds: number[],
    userId: number,
  ) {
    const deletedUser = (
      await this.dbRead.prisma.userConversation.findMany({
        where: {
          conversation_id,
          user_id: { notIn: participantIds },
        },
        select: {
          id: true,
        },
      })
    ).map(({ id }) => id);

    const existUser = (
      await this.dbRead.prisma.userConversation.findMany({
        where: {
          conversation_id,
          user_id: { in: participantIds },
        },
        select: {
          user_id: true,
        },
      })
    ).map(({ user_id }) => user_id);

    const addedUser = participantIds.filter(
      (userId) => !existUser.includes(userId),
    );

    const users = await this.dbRead.prisma.user.findMany({
      where: { user_id: { in: addedUser } },
    });

    return await this.dbWrite.prisma.$transaction(async (tx) => {
      await tx.userConversation.deleteMany({
        where: { id: { in: deletedUser } },
      });

      for (const user of users) {
        await tx.userConversation.create({
          data: {
            conversation_id,
            user_id: user.user_id,
          },
        });
      }

      const userConversation = await tx.userConversation.findMany({
        where: { conversation_id },
      });

      if (userConversation.length > 2) {
        await tx.conversation.update({
          where: { conversation_id },
          data: {
            type: 'GROUP',
          },
        });

        await tx.group.create({
          data: {
            group_id: conversation_id,
            group_name: 'untitled',
            created_by: userId,
            members: {
              createMany: {
                data: userConversation.map(({ user_id }) => {
                  return {
                    user_id,
                    role: user_id === userId ? 'ADMIN' : 'MEMBER',
                  };
                }),
              },
            },
          },
        });
      }
    });
  }

  async gseUserConversationByUserIdAndConversationId(
    conversation_id: number,
    user_id: number,
  ) {
    return this.dbRead.prisma.userConversation.findFirst({
      where: { conversation_id, user_id },
    });
  }
}
