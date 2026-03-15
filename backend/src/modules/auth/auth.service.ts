import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import { User } from '@prisma/client';
import { randomBytes } from 'crypto';

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  async signUp(dto: SignUpDto) {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
    });
    if (existing) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name,
        role: 'USER',
      },
      include: { profile: true },
    });
    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
      include: { profile: true },
    });
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user);
  }

  async refresh(user: User) {
    const full = await this.prisma.user.findFirst({
      where: { id: user.id, deletedAt: null },
      include: { profile: true },
    });
    if (!full?.refreshTokenHash) throw new UnauthorizedException();
    return this.issueTokens(full);
  }

  async googleLogin(profile: { googleId: string; email: string; name?: string; avatarUrl?: string }) {
    let user = await this.prisma.user.findFirst({
      where: { googleId: profile.googleId, deletedAt: null },
      include: { profile: true },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId: profile.googleId,
          email: profile.email.toLowerCase(),
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          emailVerified: true,
          role: 'USER',
        },
        include: { profile: true },
      });
    }
    return this.issueTokens(user);
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
    });
    if (!user) return { message: 'If the email exists, a reset link will be sent' };
    const token = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.prisma.passwordReset.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });
    // In production: send email with link containing token
    return { message: 'If the email exists, a reset link will be sent', resetToken: process.env.NODE_ENV === 'development' ? token : undefined };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resets = await this.prisma.passwordReset.findMany({
      where: { usedAt: null },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    for (const r of resets) {
      if (r.expiresAt < new Date()) continue;
      const valid = await bcrypt.compare(dto.token, r.tokenHash);
      if (valid) {
        const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
        await this.prisma.user.update({
          where: { id: r.userId },
          data: { passwordHash },
        });
        await this.prisma.passwordReset.update({
          where: { id: r.id },
          data: { usedAt: new Date() },
        });
        return { message: 'Password reset successful' };
      }
    }
    throw new BadRequestException('Invalid or expired reset token');
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
    return { message: 'Logged out' };
  }

  private async issueTokens(user: User & { profile?: unknown }) {
    const payload = { sub: user.id, email: user.email, type: 'access' as const };
    const refreshPayload = { sub: user.id, email: user.email, type: 'refresh' as const };
    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
    const refreshToken = this.jwt.sign(refreshPayload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
    const refreshHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: refreshHash },
    });
    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 min in seconds
      user: this.sanitizeUser(user),
    };
  }

  sanitizeUser(user: User & { profile?: unknown }) {
    const { passwordHash, refreshTokenHash, ...rest } = user;
    return rest;
  }
}
