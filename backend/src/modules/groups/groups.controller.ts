import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { JoinGroupDto } from './dto/join-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('groups')
@Controller('groups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupsController {
  constructor(private groups: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a group' })
  create(@CurrentUser() user: User, @Body() dto: CreateGroupDto) {
    return this.groups.create(user.id, dto);
  }

  @Get('invite/:code')
  @ApiOperation({ summary: 'Get group by invite code (public)' })
  getByInviteCode(@Param('code') code: string) {
    return this.groups.findByInviteCode(code);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join group with invite code' })
  join(@CurrentUser() user: User, @Body() dto: JoinGroupDto) {
    return this.groups.join(user.id, dto.inviteCode);
  }

  @Delete(':groupId/leave')
  @ApiOperation({ summary: 'Leave group' })
  leave(@CurrentUser() user: User, @Param('groupId') groupId: string) {
    return this.groups.leave(user.id, groupId);
  }

  @Get('my')
  @ApiOperation({ summary: 'List my groups' })
  myGroups(@CurrentUser() user: User) {
    return this.groups.listForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group with members' })
  getOne(@Param('id') id: string) {
    return this.groups.getGroupWithMembers(id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get group swipe progress (restaurant like counts)' })
  getProgress(@Param('id') id: string) {
    return this.groups.getSwipeProgress(id);
  }
}
