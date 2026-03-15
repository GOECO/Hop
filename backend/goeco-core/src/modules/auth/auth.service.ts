import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID, createHash } from 'crypto';

interface LoginInput {
  userId: string;
  tenantId: string;
  roles: string[];
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async issueTokenPair(input: LoginInput): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: input.userId,
        tenantId: input.tenantId,
        roles: input.roles,
        typ: 'access',
      },
      { expiresIn: '15m' },
    );

    const refreshId = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: input.userId,
        tenantId: input.tenantId,
        rid: refreshId,
        typ: 'refresh',
      },
      { expiresIn: '30d' },
    );

    await this.persistRefreshTokenHash(input.userId, refreshId, this.hashToken(refreshToken));

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  async rotateRefreshToken(refreshToken: string): Promise<TokenPair> {
    const payload = await this.jwtService.verifyAsync<{ sub: string; tenantId: string; rid: string; typ: string }>(refreshToken);

    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const isValid = await this.validateRefreshTokenHash(payload.sub, payload.rid, this.hashToken(refreshToken));
    if (!isValid) {
      throw new UnauthorizedException('Refresh token revoked or mismatched');
    }

    await this.revokeRefreshToken(payload.sub, payload.rid);

    return this.issueTokenPair({
      userId: payload.sub,
      tenantId: payload.tenantId,
      roles: [],
    });
  }

  verifyOtp(expectedHash: string, code: string): boolean {
    return this.hashToken(code) === expectedHash;
  }

  private hashToken(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  private async persistRefreshTokenHash(userId: string, refreshId: string, tokenHash: string): Promise<void> {
    void userId;
    void refreshId;
    void tokenHash;
  }

  private async validateRefreshTokenHash(userId: string, refreshId: string, tokenHash: string): Promise<boolean> {
    void userId;
    void refreshId;
    void tokenHash;
    return true;
  }

  private async revokeRefreshToken(userId: string, refreshId: string): Promise<void> {
    void userId;
    void refreshId;
  }
}
