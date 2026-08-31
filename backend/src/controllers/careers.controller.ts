import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { parsePositiveId } from '../utils/parse-id.js';

export async function getCareers(_request: Request, response: Response): Promise<void> {
  const careers = await prisma.careerRole.findMany({
    select: { id: true, name: true, description: true, category: true, createdAt: true, updatedAt: true },
    orderBy: { name: 'asc' },
  });

  response.status(200).json(careers);
}

export async function getCareerById(request: Request, response: Response): Promise<void> {
  const id = parsePositiveId(request.params.id);
  const career = await prisma.careerRole.findUnique({
    where: { id },
    select: { id: true, name: true, description: true, category: true, createdAt: true, updatedAt: true },
  });

  if (!career) {
    throw new AppError('Career role not found.', 404, 'NOT_FOUND');
  }

  response.status(200).json(career);
}

export async function getCareerSkills(request: Request, response: Response): Promise<void> {
  const careerRoleId = parsePositiveId(request.params.id);
  const careerExists = await prisma.careerRole.findUnique({
    where: { id: careerRoleId },
    select: { id: true },
  });

  if (!careerExists) {
    throw new AppError('Career role not found.', 404, 'NOT_FOUND');
  }

  const careerSkills = await prisma.careerSkill.findMany({
    where: { careerRoleId },
    select: {
      importance: true,
      requiredLevel: true,
      skill: { select: { id: true, name: true, category: true } },
    },
    orderBy: [{ importance: 'desc' }, { skill: { name: 'asc' } }],
  });

  response.status(200).json(
    careerSkills.map(({ skill, requiredLevel, importance }) => ({
      skill: skill.name,
      skillId: skill.id,
      category: skill.category,
      requiredLevel,
      importance,
    })),
  );
}
