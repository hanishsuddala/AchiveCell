import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import {
  calculateCareerMatch,
  rankCareers,
  type CareerRequirement,
  type StudentSkill,
} from './career-recommendation.service.js';
import { calculateSkillGaps, summarizeSkillGaps } from './skill-gap.service.js';

function toRequirements(careerSkills: Array<{
  importance: number;
  requiredLevel: number;
  skill: { id: number; name: string };
}>): CareerRequirement[] {
  return careerSkills.map((item) => ({
    skillId: item.skill.id,
    skill: item.skill.name,
    requiredLevel: item.requiredLevel,
    importance: item.importance,
  }));
}

export async function getCareerRecommendations(userId: number, limit: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, userSkills: { select: { skillId: true, proficiency: true } } },
  });
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');

  const careers = await prisma.careerRole.findMany({
    select: { id: true, name: true, category: true, careerSkills: { include: { skill: { select: { id: true, name: true } } } } },
  });
  const recommendations = rankCareers(user.userSkills, careers.map((career) => ({
    ...career,
    careerSkills: toRequirements(career.careerSkills),
  }))).slice(0, limit);

  return { user: { id: user.id, name: user.name }, recommendations };
}

export async function getSelectedCareerAnalysis(userId: number, careerId: number) {
  const [user, career] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, userSkills: { select: { skillId: true, proficiency: true } } },
    }),
    prisma.careerRole.findUnique({
      where: { id: careerId },
      select: { id: true, name: true, category: true, careerSkills: { include: { skill: { select: { id: true, name: true } } } } },
    }),
  ]);
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');
  if (!career) throw new AppError('Career role not found.', 404, 'NOT_FOUND');
  if (career.careerSkills.length === 0) {
    throw new AppError('This career role has no required skills to analyze.', 422, 'CAREER_HAS_NO_SKILLS');
  }

  const studentSkills: StudentSkill[] = user.userSkills;
  const match = calculateCareerMatch(studentSkills, toRequirements(career.careerSkills));
  const skills = calculateSkillGaps(match.skills);
  const summary = summarizeSkillGaps(skills);

  return {
    student: { id: user.id, name: user.name },
    career: { id: career.id, name: career.name, category: career.category },
    matchScore: match.matchScore,
    summary,
    skills,
    strongSkills: skills.filter((skill) => skill.status === 'Strong'),
    skillsNeedingImprovement: skills.filter((skill) => skill.status === 'Needs Improvement'),
    significantGaps: skills.filter((skill) => skill.status === 'Significant Gap'),
    missingSkills: skills.filter((skill) => skill.status === 'Missing'),
  };
}
