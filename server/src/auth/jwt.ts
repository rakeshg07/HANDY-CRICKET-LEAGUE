import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
}

function getSecret(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET', devFallback: string): string {
  const secret = process.env[name];
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be set in production`);
  }
  return devFallback;
}

export function generateAccessToken(userId: string): string {
  const secret = getSecret('JWT_SECRET', 'secret');
  return jwt.sign({ userId }, secret, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string): string {
  const secret = getSecret('JWT_REFRESH_SECRET', 'refresh_secret');
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  const secret = getSecret('JWT_SECRET', 'secret');
  return jwt.verify(token, secret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const secret = getSecret('JWT_REFRESH_SECRET', 'refresh_secret');
  return jwt.verify(token, secret) as TokenPayload;
}
