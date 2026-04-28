import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  signIn(username: string, password: string) {
    const expectedUser = this.config.get<string>('ADMIN_USERNAME');
    const expectedPass = this.config.get<string>('ADMIN_PASSWORD');
    if (
      !expectedUser ||
      !expectedPass ||
      username !== expectedUser ||
      password !== expectedPass
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: JwtPayload = { sub: username, role: 'admin' };
    const token = this.jwt.sign(payload);
    return { token, payload };
  }
}
