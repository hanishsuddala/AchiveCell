import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { parsePositiveId } from '../utils/parse-id.js';

export async function getUserById(request: Request, response: Response): Promise<void> {
  const id = parsePositiveId(request.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      education: true,
      year: true,
      createdAt: true,
      updatedAt: true,
      targetRole: { select: { id: true, name: true, category: true } },
    },
  });

  if (!user) {
    throw new AppError('User not found.', 404, 'NOT_FOUND');
  }

  response.status(200).json(user);
}

export async function getUserSkills(request: Request, response: Response): Promise<void> {
  const userId = parsePositiveId(request.params.id);
  const userExists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });

  if (!userExists) {
    throw new AppError('User not found.', 404, 'NOT_FOUND');
  }

  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
    select: {
      proficiency: true,
      source: true,
      skill: { select: { id: true, name: true, category: true } },
    },
    orderBy: [{ proficiency: 'desc' }, { skill: { name: 'asc' } }],
  });

  response.status(200).json(
    userSkills.map(({ skill, proficiency, source }) => ({
      skill: skill.name,
      skillId: skill.id,
      category: skill.category,
      proficiency,
      source,
    })),
  );
}
