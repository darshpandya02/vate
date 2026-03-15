import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('matches')
@Controller('matches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchesController {
  constructor(private matches: MatchesService) {}

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get group match history' })
  getGroupMatches(@Param('groupId') groupId: string, @Query('limit') limit?: string) {
    return this.matches.getGroupMatchHistory(groupId, limit ? parseInt(limit, 10) : 50);
  }
}
