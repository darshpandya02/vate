import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../common/redis/redis.service';

const GROUP_ROOM_PREFIX = 'group:';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || '*' },
  path: '/ws',
  namespace: '/',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {
    this.subscribeRedis();
  }

  private subscribeRedis() {
    this.redis.subscribe('group_match', (message) => {
      try {
        const payload = JSON.parse(message);
        this.server.to(GROUP_ROOM_PREFIX + payload.groupId).emit('group_match', payload.data);
      } catch (e) {
        this.logger.warn('Invalid Redis message', e);
      }
    });
    this.redis.subscribe('group_member_joined', (message) => {
      try {
        const payload = JSON.parse(message);
        this.server.to(GROUP_ROOM_PREFIX + payload.groupId).emit('group_member_joined', payload.data);
      } catch (e) {
        this.logger.warn('Invalid Redis message', e);
      }
    });
    this.redis.subscribe('group_member_left', (message) => {
      try {
        const payload = JSON.parse(message);
        this.server.to(GROUP_ROOM_PREFIX + payload.groupId).emit('group_member_left', payload.data);
      } catch (e) {
        this.logger.warn('Invalid Redis message', e);
      }
    });
    this.redis.subscribe('group_progress', (message) => {
      try {
        const payload = JSON.parse(message);
        this.server.to(GROUP_ROOM_PREFIX + payload.groupId).emit('group_progress', payload.data);
      } catch (e) {
        this.logger.warn('Invalid Redis message', e);
      }
    });
  }

  async handleConnection(client: { handshake: { auth?: { token?: string }; query?: { token?: string } }; join: (room: string) => void; id: string; disconnect?: (close?: boolean) => void }) {
    const token = client.handshake?.auth?.token || client.handshake?.query?.token;
    if (!token) {
      if (typeof client.disconnect === 'function') client.disconnect(true);
      return;
    }
    try {
      const secret = this.config.get<string>('JWT_ACCESS_SECRET');
      const decoded = this.jwt.verify(token, { secret }) as { sub: string };
      (client as unknown as { userId: string }).userId = decoded.sub;
    } catch {
      if (typeof client.disconnect === 'function') client.disconnect(true);
    }
  }

  handleDisconnect(_client: unknown) {
    // Optional: leave all rooms is automatic on disconnect
  }

  @SubscribeMessage('join_group')
  handleJoinGroup(
    client: { join: (room: string) => void } & { userId?: string },
    payload: { groupId: string },
  ) {
    if (payload?.groupId) {
      client.join(GROUP_ROOM_PREFIX + payload.groupId);
    }
  }

  @SubscribeMessage('leave_group')
  handleLeaveGroup(
    client: { leave: (room: string) => void },
    payload: { groupId: string },
  ) {
    if (payload?.groupId) {
      client.leave(GROUP_ROOM_PREFIX + payload.groupId);
    }
  }

  async emitGroupMatch(groupId: string, match: unknown) {
    const data = { groupId, match };
    this.server?.to(GROUP_ROOM_PREFIX + groupId).emit('group_match', data);
    await this.redis.publish('group_match', JSON.stringify({ groupId, data }));
  }

  async emitMemberJoined(groupId: string, member: unknown) {
    const data = { groupId, member };
    this.server?.to(GROUP_ROOM_PREFIX + groupId).emit('group_member_joined', data);
    await this.redis.publish('group_member_joined', JSON.stringify({ groupId, data }));
  }

  async emitMemberLeft(groupId: string, userId: string) {
    const data = { groupId, userId };
    this.server?.to(GROUP_ROOM_PREFIX + groupId).emit('group_member_left', data);
    await this.redis.publish('group_member_left', JSON.stringify({ groupId, data }));
  }

  async emitProgress(groupId: string, progress: unknown) {
    const data = { groupId, progress };
    this.server?.to(GROUP_ROOM_PREFIX + groupId).emit('group_progress', data);
    await this.redis.publish('group_progress', JSON.stringify({ groupId, data }));
  }
}
