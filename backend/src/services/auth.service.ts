import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { createAuthToken } from '../utils/auth-token.js';
import { hashPassword, verifyPassword } from '../utils/passwords.js';

export type PublicUser = { id: number; name: string; email: string; education: string | null; year: number | null; targetRole: { id: number; name: string; category: string } | null };

const publicUserSelect = {
  id: true, name: true, email: true, education: true, year: true,
  targetRole: { select: { id: true, name: true, category: true } },
} as const;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateCredentials(name: string | undefined, email: unknown, password: unknown): void {
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100)) {
    throw new AppError('Name must be between 2 and 100 characters.', 400, 'INVALID_NAME');
  }
  if (typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizeEmail(email))) {
    throw new AppError('A valid email address is required.', 400, 'INVALID_EMAIL');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new AppError('Password must be between 8 and 128 characters.', 400, 'INVALID_PASSWORD');
  }
}

export async function registerStudent(input: { name?: unknown; email?: unknown; password?: unknown; education?: unknown; year?: unknown }): Promise<{ token: string; user: PublicUser }> {
  validateCredentials(input.name as string | undefined, input.email, input.password);
  const name = (input.name as string).trim();
  const email = normalizeEmail(input.email as string);
  const education = typeof input.education === 'string' ? input.education.trim().slice(0, 120) || null : null;
  const year = input.year === undefined || input.year === null ? null : Number(input.year);
  if (year !== null && (!Number.isInteger(year) || year < 1 || year > 8)) throw new AppError('Year must be an integer between 1 and 8.', 400, 'INVALID_YEAR');
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new AppError('An account with this email already exists.', 409, 'EMAIL_IN_USE');
  const user = await prisma.user.create({
  data: { name, email, education, year, passwordHash: hashPassword(input.password as string) },
    select: publicUserSelect,
  });
  return { token: createAuthToken(user.id), user };
}

export async function loginStudent(input: { email?: unknown; password?: unknown }): Promise<{ token: string; user: PublicUser }> {
  validateCredentials(undefined, input.email, input.password);
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(input.email as string) }, select: { ...publicUserSelect, passwordHash: true } });
  if (!user || !user.passwordHash || !verifyPassword(input.password as string, user.passwordHash)) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return { token: createAuthToken(user.id), user: publicUser };
}

export async function getAuthenticatedUser(userId: number): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');
  return user;
}
