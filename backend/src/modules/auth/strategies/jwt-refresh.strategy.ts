import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface JwtRefreshPayload {
  sub: string;
  email: string;
  type: 'refresh';
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtRefreshPayload) {
    if (payload.type !== 'refresh') throw new UnauthorizedException();
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
    });
    if (!user?.refreshTokenHash) throw new UnauthorizedException();
    const token = req.body?.refreshToken;
    if (!token) throw new UnauthorizedException();
    const valid = await bcrypt.compare(token, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException();
    return user;
  }
}
