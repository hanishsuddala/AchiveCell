import type { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/require-auth.js';
import { getAuthenticatedUser, loginStudent, registerStudent } from '../services/auth.service.js';

export async function register(request: Request, response: Response): Promise<void> {
  response.status(201).json(await registerStudent(request.body ?? {}));
}

export async function login(request: Request, response: Response): Promise<void> {
  response.status(200).json(await loginStudent(request.body ?? {}));
}

export async function getMe(request: Request, response: Response): Promise<void> {
  response.status(200).json(await getAuthenticatedUser((request as AuthenticatedRequest).userId));
}
