import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '../prisma/prisma-read.service';
import { PrismaWriteService } from '../prisma/prisma-write.service';

@Injectable()
export class GroupRepository {
  constructor(
    private readonly dbRead: PrismaReadService,
    private readonly dbWrite: PrismaWriteService,
  ) {}

  updateById(
    group_id: number,
    data: {
      group_name?: string;
      profile_picture_url?: string;
    },
  ) {
    return this.dbWrite.prisma.group.update({
      where: { group_id },
      data,
    });
  }
}
