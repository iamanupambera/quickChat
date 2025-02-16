import { Module } from '@nestjs/common';
import { PrismaReadService } from './prisma-read.service';
import { PrismaWriteService } from './prisma-write.service';

@Module({
  providers: [PrismaReadService, PrismaWriteService],
  exports: [PrismaReadService, PrismaWriteService],
})
export class PrismaModule {}
