import type { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/require-auth.js';
import { aiRecommendationProvider } from '../services/ai-recommendation.service.js';
import { getSelectedCareerAnalysis } from '../services/career-analysis.service.js';
import { getDashboard, getStudentSkills, updateTargetRole } from '../services/student-profile.service.js';
import { AppError } from '../utils/app-error.js';
import { parsePositiveId } from '../utils/parse-id.js';

function userId(request: Request): number { return (request as AuthenticatedRequest).userId; }

export async function getMyDashboard(request: Request, response: Response): Promise<void> { response.status(200).json(await getDashboard(userId(request))); }
export async function getMySkills(request: Request, response: Response): Promise<void> { response.status(200).json(await getStudentSkills(userId(request))); }
export async function setMyTargetRole(request: Request, response: Response): Promise<void> { response.status(200).json(await updateTargetRole(userId(request), request.body?.targetRoleId)); }
export async function getMyCareerAnalysis(request: Request, response: Response): Promise<void> { response.status(200).json(await getSelectedCareerAnalysis(userId(request), parsePositiveId(request.params.careerId))); }

export async function getAiRecommendation(request: Request, response: Response): Promise<void> {
  const dashboard = await getDashboard(userId(request));
  if (!dashboard.targetAnalysis || !dashboard.targetRole) throw new AppError('Choose a target role before requesting guidance.', 422, 'TARGET_ROLE_REQUIRED');
  response.status(200).json(await aiRecommendationProvider.explain({ studentName: dashboard.user.name, careerName: dashboard.targetRole.name, matchScore: dashboard.targetAnalysis.matchScore, skills: dashboard.targetAnalysis.skills }));
}
