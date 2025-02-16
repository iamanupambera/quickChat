import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  public redis: Redis;
  private readonly logger = new Logger('RedisService');

  constructor(readonly configService: ConfigService) {
    const dbUrl = configService.getOrThrow<string>('REDIS_URL', {
      infer: true,
    });

    this.redis = new Redis(dbUrl);
  }

  async onModuleDestroy() {
    try {
      await this.redis.quit();
    } catch (err) {
      this.logger.error(err);
    }
  }
}
