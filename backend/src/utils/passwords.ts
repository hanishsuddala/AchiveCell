import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const iterations = 120_000;
const digest = 'sha512';
const keyLength = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, iterations, keyLength, digest).toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedValue: string): boolean {
  const [algorithm, iterationText, salt, expectedHash] = storedValue.split('$');
  const storedIterations = Number(iterationText);
  if (algorithm !== 'pbkdf2' || !salt || !expectedHash || !Number.isSafeInteger(storedIterations)) return false;
  const computedHash = pbkdf2Sync(password, salt, storedIterations, keyLength, digest).toString('hex');
  const expected = Buffer.from(expectedHash, 'hex');
  const actual = Buffer.from(computedHash, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
