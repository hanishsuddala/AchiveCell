import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function getSkills(_request: Request, response: Response): Promise<void> {
  const skills = await prisma.skill.findMany({
    select: { id: true, name: true, category: true, description: true, createdAt: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  response.status(200).json(skills);
}
