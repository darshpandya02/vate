import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('restaurants')
@Controller('restaurants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RestaurantsController {
  constructor(
    private restaurants: RestaurantsService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get restaurant deck (filtered, excluding already swiped)' })
  async getDeck(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('radiusKm') radiusKm?: string,
  ) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId: user.id },
    });
    const lat = latitude ? parseFloat(latitude) : profile?.latitude ?? undefined;
    const lng = longitude ? parseFloat(longitude) : profile?.longitude ?? undefined;
    const radius = radiusKm ? parseInt(radiusKm, 10) : profile?.searchRadiusKm ?? 5;
    return this.restaurants.findMany({
      userId: user.id,
      latitude: lat,
      longitude: lng,
      radiusKm: radius,
      cuisineTypes: profile?.cuisinePreferences ?? undefined,
      priceMin: profile?.priceRangeMin ?? undefined,
      priceMax: profile?.priceRangeMax ?? undefined,
      limit: limit ? Math.min(parseInt(limit, 10) || 20, 50) : 20,
      cursor,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID' })
  getOne(@Param('id') id: string) {
    return this.restaurants.findById(id);
  }
}
