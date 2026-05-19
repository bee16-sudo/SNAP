import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters long');
}

const ACCESS_EXPIRES  = process.env.JWT_EXPIRES_IN          ?? '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN ?? '7d';

export interface AccessTokenPayload {
  userId: string;
  email:  string;
}

// ─── ACCESS TOKEN ──────────────────────────────────────────────────
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  if (typeof decoded !== 'object' || !decoded.userId || !decoded.email) {
    throw new Error('Invalid token payload');
  }
  return { userId: decoded.userId as string, email: decoded.email as string };
}

// ─── REFRESH TOKEN ─────────────────────────────────────────────────
// Refresh tokens are opaque random bytes stored (hashed) in the DB.
// This avoids a second JWT secret and makes revocation trivial.

export function generateRefreshToken(): { raw: string; hash: string } {
  const raw  = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

export function hashRefreshToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function refreshTokenExpiresAt(): Date {
  // Parse REFRESH_EXPIRES — supports "7d", "30d", "1h"
  const match = REFRESH_EXPIRES.match(/^(\d+)([dhm])$/);
  if (!match) throw new Error(`Invalid REFRESH_TOKEN_EXPIRES_IN: ${REFRESH_EXPIRES}`);
  const [, num, unit] = match;
  const ms = parseInt(num) * ({ d: 864e5, h: 36e5, m: 6e4 } as Record<string, number>)[unit];
  return new Date(Date.now() + ms);
}
