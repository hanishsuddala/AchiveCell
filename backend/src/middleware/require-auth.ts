import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error.js';
import { readAuthToken } from '../utils/auth-token.js';

export type AuthenticatedRequest = Request & { userId: number };

export function requireAuth(request: Request, _response: Response, next: NextFunction): void {
  const authorization = request.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : undefined;
  const userId = token ? readAuthToken(token) : null;
  if (!userId) {
    next(new AppError('Authentication is required.', 401, 'UNAUTHORIZED'));
    return;
  }
  (request as AuthenticatedRequest).userId = userId;
  next();
}
