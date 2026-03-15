import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway.js';

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async checkAndEmitMatch(groupId: string, restaurantId: string): Promise<boolean> {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, deletedAt: null },
      include: { members: { select: { userId: true } } },
    });
    if (!group) return false;
    const memberIds = group.members.map((m) => m.userId);
    const required = Math.ceil((memberIds.length * group.matchThreshold) / 100);
    const likeCount = await this.prisma.swipe.count({
      where: {
        restaurantId,
        userId: { in: memberIds },
        direction: 'RIGHT',
      },
    });
    if (likeCount < required) return false;

    const existing = await this.prisma.groupMatch.findUnique({
      where: { groupId_restaurantId: { groupId, restaurantId } },
    });
    if (existing) return false;

    const [match] = await this.prisma.$transaction([
      this.prisma.groupMatch.create({
        data: { groupId, restaurantId },
        include: { restaurant: true, group: true },
      }),
    ]);

    await this.notificationsGateway.emitGroupMatch(groupId, match);
    return true;
  }

  async getGroupMatchHistory(groupId: string, limit = 50) {
    return this.prisma.groupMatch.findMany({
      where: { groupId },
      include: { restaurant: true },
      orderBy: { matchedAt: 'desc' },
      take: limit,
    });
  }
}
