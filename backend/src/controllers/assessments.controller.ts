import type { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/require-auth.js';
import { getAssessmentForSkill, listAssessments, submitAssessment } from '../services/assessment.service.js';
import { parsePositiveId } from '../utils/parse-id.js';

export async function getAssessments(_request: Request, response: Response): Promise<void> { response.status(200).json(await listAssessments()); }
export async function getAssessment(request: Request, response: Response): Promise<void> { response.status(200).json(await getAssessmentForSkill(parsePositiveId(request.params.skillId))); }
export async function submitMyAssessment(request: Request, response: Response): Promise<void> { response.status(201).json(await submitAssessment((request as AuthenticatedRequest).userId, parsePositiveId(request.params.assessmentId), request.body?.answers)); }
