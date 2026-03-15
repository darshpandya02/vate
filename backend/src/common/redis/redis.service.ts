import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly subscriber: Redis;
  private readonly publisher: Redis;

  constructor() {
    const url = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
    const options: { maxRetriesPerRequest: number; retryStrategy: (times: number) => number; lazyConnect: boolean; password?: string } = {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      lazyConnect: true,
    };
    if (process.env.REDIS_PASSWORD) {
      options.password = process.env.REDIS_PASSWORD;
    }
    this.client = new Redis(url, options);
    this.subscriber = new Redis(url, options);
    this.publisher = new Redis(url, options);
  }

  getClient(): Redis {
    return this.client;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  getPublisher(): Redis {
    return this.publisher;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.publisher.publish(channel, message);
  }

  subscribe(channel: string, callback: (message: string) => void): void {
    this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) callback(message);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
    await this.publisher.quit();
  }
}
