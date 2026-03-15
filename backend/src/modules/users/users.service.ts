import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, refreshTokenHash, ...rest } = user;
    return rest;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, refreshTokenHash, ...rest } = user;
    return rest;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {},
    });
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        searchRadiusKm: dto.searchRadiusKm ?? 5,
        priceRangeMin: dto.priceRangeMin,
        priceRangeMax: dto.priceRangeMax,
        dietaryPreferences: dto.dietaryPreferences ?? [],
        cuisinePreferences: dto.cuisinePreferences ?? [],
      },
      update: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        searchRadiusKm: dto.searchRadiusKm,
        priceRangeMin: dto.priceRangeMin,
        priceRangeMax: dto.priceRangeMax,
        dietaryPreferences: dto.dietaryPreferences,
        cuisinePreferences: dto.cuisinePreferences,
      },
    });
    return profile;
  }
}
