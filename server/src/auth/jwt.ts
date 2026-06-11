import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
}

export function generateAccessToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.sign({ userId }, secret, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET || 'secret';
  return jwt.verify(token, secret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
  return jwt.verify(token, secret) as TokenPayload;
}
