import { Injectable } from '@nestjs/common';
import type { User, Prisma } from '@prisma/client';
import { PrismaReadService } from '../prisma/prisma-read.service';
import { PrismaWriteService } from '../prisma/prisma-write.service';
import { AuthRegisterDto } from './dto/register.dto';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly dbRead: PrismaReadService,
    private readonly dbWrite: PrismaWriteService,
  ) {}

  async create(user: AuthRegisterDto) {
    return this.dbWrite.prisma.user.create({
      data: {
        ...user,
      },
    });
  }

  async findById(userId: number) {
    return this.dbRead.prisma.user.findUnique({
      where: {
        user_id: userId,
      },
    });
  }

  async findByIds(userIds: number[]) {
    return this.dbRead.prisma.user.findMany({
      where: {
        user_id: {
          in: userIds,
        },
      },
    });
  }

  async findByEmail(phone_number: string) {
    return this.dbRead.prisma.user.findUnique({
      where: {
        phone_number,
      },
    });
  }

  async update(userId: number, updateData: Partial<AuthRegisterDto>) {
    return this.dbWrite.prisma.user.update({
      where: { user_id: userId },
      data: updateData,
    });
  }

  async updateByEmail(
    phone_number: string,
    updateData: Prisma.UserUpdateInput,
  ) {
    return this.dbWrite.prisma.user.update({
      where: { phone_number },
      data: updateData,
    });
  }

  async delete(userId: number): Promise<User> {
    return this.dbWrite.prisma.user.delete({
      where: { user_id: userId },
    });
  }
}
