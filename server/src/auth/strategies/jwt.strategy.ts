import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

export const ACCESS_TOKEN_COOKIE = 'j00n0_token';

export type JwtPayload = { sub: string; role: 'admin' };

function fromCookie(req: Request): string | null {
  const value = req?.cookies?.[ACCESS_TOKEN_COOKIE];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromCookie]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'dev-secret',
    });
  }

  async validate(payload: JwtPayload) {
    return { username: payload.sub, role: payload.role };
  }
}
