import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MatchesService } from '../matches/matches.service';
import { SwipeDirection } from '@prisma/client';

@Injectable()
export class SwipesService {
  constructor(
    private prisma: PrismaService,
    private matchesService: MatchesService,
  ) {}

  async swipe(userId: string, restaurantId: string, direction: SwipeDirection) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id: restaurantId, deletedAt: null },
    });
    if (!restaurant) throw new BadRequestException('Restaurant not found');

    const existing = await this.prisma.swipe.findUnique({
      where: {
        userId_restaurantId: { userId, restaurantId },
      },
    });
    if (existing) throw new ConflictException('Already swiped on this restaurant');

    const swipe = await this.prisma.swipe.create({
      data: { userId, restaurantId, direction },
      include: { restaurant: true },
    });

    if (direction === 'RIGHT') {
      const memberships = await this.prisma.groupMember.findMany({
        where: { userId },
        include: { group: true },
      });
      for (const m of memberships) {
        await this.matchesService.checkAndEmitMatch(m.groupId, restaurantId);
      }
    }

    return swipe;
  }

  async getSwipeHistory(userId: string, direction?: SwipeDirection, limit = 50) {
    const where: { userId: string; direction?: SwipeDirection } = { userId };
    if (direction) where.direction = direction;
    return this.prisma.swipe.findMany({
      where,
      include: { restaurant: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
