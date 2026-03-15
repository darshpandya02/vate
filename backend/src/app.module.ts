import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { SwipesModule } from './modules/swipes/swipes.module';
import { GroupsModule } from './modules/groups/groups.module';
import { MatchesModule } from './modules/matches/matches.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      },
    ]),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    RestaurantsModule,
    SwipesModule,
    GroupsModule,
    MatchesModule,
    NotificationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
