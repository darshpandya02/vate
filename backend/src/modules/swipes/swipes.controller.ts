import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SwipesService } from './swipes.service';
import { CreateSwipeDto } from './dto/create-swipe.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('swipes')
@Controller('swipes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SwipesController {
  constructor(private swipes: SwipesService) {}

  @Post()
  @ApiOperation({ summary: 'Swipe left or right on a restaurant' })
  create(@CurrentUser() user: User, @Body() dto: CreateSwipeDto) {
    return this.swipes.swipe(user.id, dto.restaurantId, dto.direction as 'LEFT' | 'RIGHT');
  }

  @Get('history')
  @ApiOperation({ summary: 'Get swipe history' })
  getHistory(
    @CurrentUser() user: User,
    @Query('direction') direction?: 'LEFT' | 'RIGHT',
    @Query('limit') limit?: string,
  ) {
    return this.swipes.getSwipeHistory(user.id, direction, limit ? parseInt(limit, 10) : 50);
  }
}
