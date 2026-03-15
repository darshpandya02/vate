import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { randomBytes } from 'crypto';

function generateInviteCode(): string {
  return randomBytes(6).toString('base64').replace(/[/+=]/g, '').slice(0, 8).toUpperCase();
}

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateGroupDto) {
    let inviteCode = generateInviteCode();
    while (await this.prisma.group.findUnique({ where: { inviteCode } })) {
      inviteCode = generateInviteCode();
    }
    const group = await this.prisma.group.create({
      data: {
        name: dto.name,
        inviteCode,
        adminId: userId,
        matchThreshold: dto.matchThreshold ?? 100,
      },
      include: {
        admin: { select: { id: true, email: true, name: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } } },
      },
    });
    await this.prisma.groupMember.create({
      data: { groupId: group.id, userId },
    });
    return this.getGroupWithMembers(group.id);
  }

  async findByInviteCode(inviteCode: string) {
    const group = await this.prisma.group.findFirst({
      where: { inviteCode: inviteCode.toUpperCase(), deletedAt: null },
      include: {
        admin: { select: { id: true, name: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        _count: { select: { members: true } },
      },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async join(userId: string, inviteCode: string) {
    const group = await this.prisma.group.findFirst({
      where: { inviteCode: inviteCode.toUpperCase(), deletedAt: null },
    });
    if (!group) throw new NotFoundException('Group not found');
    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId } },
    });
    if (existing) throw new ConflictException('Already a member');
    await this.prisma.groupMember.create({
      data: { groupId: group.id, userId },
    });
    return this.getGroupWithMembers(group.id);
  }

  async leave(userId: string, groupId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
      include: { group: true },
    });
    if (!membership) throw new NotFoundException('Not a member');
    if (membership.group.adminId === userId) {
      throw new ForbiddenException('Admin cannot leave; transfer admin or delete group');
    }
    await this.prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });
    return { message: 'Left group' };
  }

  async getGroupWithMembers(groupId: string) {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, deletedAt: null },
      include: {
        admin: { select: { id: true, email: true, name: true, avatarUrl: true } },
        members: { include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } } },
        _count: { select: { members: true, matches: true } },
      },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async listForUser(userId: string) {
    return this.prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            admin: { select: { id: true, name: true, avatarUrl: true } },
            _count: { select: { members: true, matches: true } },
          },
        },
      },
    });
  }

  async getSwipeProgress(groupId: string) {
    const members = await this.prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    const memberIds = members.map((m) => m.userId);
    const rightSwipes = await this.prisma.swipe.groupBy({
      by: ['restaurantId'],
      where: {
        userId: { in: memberIds },
        direction: 'RIGHT',
      },
      _count: { restaurantId: true },
    });
    const totalMembers = memberIds.length;
    const threshold = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { matchThreshold: true },
    });
    const required = Math.ceil((totalMembers * (threshold?.matchThreshold ?? 100)) / 100);
    const progress = rightSwipes.map((r) => ({
      restaurantId: r.restaurantId,
      likeCount: r._count.restaurantId,
      totalMembers,
      required,
      isMatch: r._count.restaurantId >= required,
    }));
    return { progress, totalMembers, required };
  }
}
