import { SkillSource, type Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export type SubmittedAnswer = { questionId: number; optionIndex: number };

export function calculateAssessmentScore(correctOptions: ReadonlyMap<number, number>, answers: readonly SubmittedAnswer[]): number {
  if (correctOptions.size === 0 || answers.length !== correctOptions.size) throw new Error('Every question must be answered.');
  const answerByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer.optionIndex]));
  if (answerByQuestionId.size !== correctOptions.size || [...correctOptions.keys()].some((id) => !answerByQuestionId.has(id))) {
    throw new Error('Answers must correspond to the assessment questions exactly once.');
  }
  const correct = [...correctOptions].filter(([questionId, option]) => answerByQuestionId.get(questionId) === option).length;
  return Math.round((correct / correctOptions.size) * 100);
}

export async function listAssessments() {
  return prisma.assessment.findMany({
    select: { id: true, title: true, skill: { select: { id: true, name: true, category: true } }, _count: { select: { questions: true } } },
    orderBy: { skill: { name: 'asc' } },
  });
}

export async function getAssessmentForSkill(skillId: number) {
  const assessment = await prisma.assessment.findUnique({
    where: { skillId },
    select: { id: true, title: true, skill: { select: { id: true, name: true, category: true } }, questions: { select: { id: true, prompt: true, options: true, order: true }, orderBy: { order: 'asc' } } },
  });
  if (!assessment) throw new AppError('No assessment is available for this skill yet.', 404, 'ASSESSMENT_NOT_FOUND');
  return assessment;
}

export async function submitAssessment(userId: number, assessmentId: number, answers: unknown) {
  if (!Array.isArray(answers) || answers.length === 0 || !answers.every((answer) => typeof answer === 'object' && answer !== null && Number.isSafeInteger((answer as SubmittedAnswer).questionId) && Number.isInteger((answer as SubmittedAnswer).optionIndex) && (answer as SubmittedAnswer).optionIndex >= 0)) {
    throw new AppError('answers must be a non-empty list of questionId and optionIndex values.', 400, 'INVALID_ANSWERS');
  }
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: { select: { id: true, correctOption: true }, orderBy: { order: 'asc' } }, skill: { select: { id: true, name: true } } },
  });
  if (!assessment) throw new AppError('Assessment not found.', 404, 'ASSESSMENT_NOT_FOUND');
  let score: number;
  try {
    score = calculateAssessmentScore(new Map(assessment.questions.map((question) => [question.id, question.correctOption])), answers as SubmittedAnswer[]);
  } catch (error) {
    throw new AppError(error instanceof Error ? error.message : 'Invalid answers.', 400, 'INVALID_ANSWERS');
  }
  const existingSkill = await prisma.userSkill.findUnique({ where: { userId_skillId: { userId, skillId: assessment.skillId } }, select: { proficiency: true } });
  const previousProficiency = existingSkill?.proficiency ?? 0;
  const updatedProficiency = score;
  const attempt = await prisma.$transaction(async (transaction) => {
    await transaction.userSkill.upsert({
      where: { userId_skillId: { userId, skillId: assessment.skillId } },
      update: { proficiency: updatedProficiency, source: SkillSource.assessment },
      create: { userId, skillId: assessment.skillId, proficiency: updatedProficiency, source: SkillSource.assessment },
    });
    return transaction.assessmentAttempt.create({
      data: { userId, assessmentId, score, previousProficiency, updatedProficiency, answers: answers as Prisma.InputJsonValue },
      select: { id: true, score: true, previousProficiency: true, updatedProficiency: true, createdAt: true },
    });
  });
  const performance = score >= 70 ? 'Strong' : score >= 40 ? 'Intermediate' : 'Needs Improvement';
  return { attempt, skill: assessment.skill.name, performance };
}
