import type { Request, Response } from 'express';
import { getCareerRecommendations, getSelectedCareerAnalysis } from '../services/career-analysis.service.js';
import { getProfileStrength } from '../services/profile-strength.service.js';
import { AppError } from '../utils/app-error.js';
import { parsePositiveId } from '../utils/parse-id.js';

function parseLimit(value: unknown): number {
  if (value === undefined) return 5;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new AppError('limit must be a positive integer.', 400, 'INVALID_LIMIT');
  }
  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError('limit must be between 1 and 100.', 400, 'INVALID_LIMIT');
  }
  return limit;
}

export async function getRecommendations(request: Request, response: Response): Promise<void> {
  const userId = parsePositiveId(request.params.id);
  response.status(200).json(await getCareerRecommendations(userId, parseLimit(request.query.limit)));
}

export async function getCareerAnalysis(request: Request, response: Response): Promise<void> {
  const userId = parsePositiveId(request.params.userId);
  const careerId = parsePositiveId(request.params.careerId);
  response.status(200).json(await getSelectedCareerAnalysis(userId, careerId));
}

export async function getSkillGap(request: Request, response: Response): Promise<void> {
  const userId = parsePositiveId(request.params.userId);
  const careerId = parsePositiveId(request.params.careerId);
  const analysis = await getSelectedCareerAnalysis(userId, careerId);
  response.status(200).json({ student: analysis.student, career: analysis.career, matchScore: analysis.matchScore, summary: analysis.summary, skills: analysis.skills });
}

export async function getUserProfileStrength(request: Request, response: Response): Promise<void> {
  response.status(200).json(await getProfileStrength(parsePositiveId(request.params.id)));
}
