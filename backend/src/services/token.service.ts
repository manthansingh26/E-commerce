import * as jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class TokenService {
  private readonly secret: string;
  private readonly expiry: string | number;

  constructor() {
    this.secret = config.jwt.secret;
    this.expiry = config.jwt.expiry;
  }

  generateToken(payload: TokenPayload): string {
    const tokenPayload = { userId: payload.userId, email: payload.email };
    // Using type assertion to work around strict typing
    return jwt.sign(tokenPayload, this.secret, { expiresIn: this.expiry } as any);
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, this.secret) as TokenPayload;
  }
}
