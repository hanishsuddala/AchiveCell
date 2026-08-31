import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function getHealth(_request: Request, response: Response): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
  response.status(200).json({ status: 'ok', service: 'achievecell-api', database: 'connected' });
}
