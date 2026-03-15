import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  type: 'access';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'access') throw new UnauthorizedException();
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      include: { profile: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
