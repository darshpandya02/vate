import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { Prisma } from '@prisma/client';

const CACHE_TTL = 300; // 5 min
const RESTAURANTS_DECK_CACHE_PREFIX = 'restaurants_deck:';

@Injectable()
export class RestaurantsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findMany(params: {
    userId: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    cuisineTypes?: string[];
    priceMin?: number;
    priceMax?: number;
    limit?: number;
    cursor?: string;
  }) {
    const { userId, latitude, longitude, radiusKm = 5, limit = 20, cursor } = params;
    const alreadySwiped = await this.prisma.swipe.findMany({
      where: { userId },
      select: { restaurantId: true },
    });
    const swipedIds = alreadySwiped.map((s) => s.restaurantId);

    const where: Prisma.RestaurantWhereInput = {
      deletedAt: null,
      id: { notIn: swipedIds },
    };

    if (latitude != null && longitude != null && radiusKm > 0) {
      // Approximate bounding box (1 degree ~ 111km at equator)
      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));
      where.latitude = { gte: latitude - latDelta, lte: latitude + latDelta };
      where.longitude = { gte: longitude - lngDelta, lte: longitude + lngDelta };
    }
    if (params.cuisineTypes?.length) {
      where.cuisineTypes = { hasSome: params.cuisineTypes };
    }
    if (params.priceMin != null) {
      where.priceLevel = where.priceLevel ?? {};
      (where.priceLevel as Prisma.IntFilter).gte = params.priceMin;
    }
    if (params.priceMax != null) {
      where.priceLevel = where.priceLevel ?? {};
      (where.priceLevel as Prisma.IntFilter).lte = params.priceMax;
    }

    const restaurants = await this.prisma.restaurant.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    const nextCursor = restaurants.length > limit ? restaurants[limit - 1].id : null;
    const items = restaurants.slice(0, limit);
    return { items, nextCursor };
  }

  async findById(id: string) {
    return this.prisma.restaurant.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(data: Prisma.RestaurantCreateInput) {
    return this.prisma.restaurant.create({ data });
  }

  async createMany(data: Prisma.RestaurantCreateManyInput[]) {
    return this.prisma.restaurant.createMany({ data, skipDuplicates: true });
  }
}
