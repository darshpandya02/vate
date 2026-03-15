import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '../../common/redis/redis.module';


@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
      }),
      inject: [ConfigService],
    }),
    RedisModule,
  ],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
