import { createHmac, timingSafeEqual } from 'node:crypto';

type TokenPayload = { sub: number; exp: number };
const secret = process.env.AUTH_TOKEN_SECRET ?? 'achievecell-local-development-secret-change-me';

function sign(value: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function createAuthToken(userId: number): string {
  const payload: TokenPayload = { sub: userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function readAuthToken(token: string): number | null {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;
  const expectedSignature = sign(encodedPayload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as TokenPayload;
    if (!Number.isSafeInteger(payload.sub) || payload.sub < 1 || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload.sub;
  } catch {
    return null;
  }
}
