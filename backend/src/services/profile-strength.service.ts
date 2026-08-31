import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { calculateCareerMatch, type CareerRequirement, type StudentSkill } from './career-recommendation.service.js';

export type ProfileStrengthResult = {
  profileStrength: number | null;
  targetRole: string | null;
  message?: string;
};

export async function getProfileStrength(userId: number): Promise<ProfileStrengthResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      targetRole: { select: { name: true, careerSkills: { include: { skill: { select: { id: true, name: true } } } } } },
      userSkills: { select: { skillId: true, proficiency: true } },
    },
  });
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');
  if (!user.targetRole) {
    return { profileStrength: null, targetRole: null, message: 'A target role is required to calculate profile strength.' };
  }

  const studentSkills: StudentSkill[] = user.userSkills;
  const careerSkills: CareerRequirement[] = user.targetRole.careerSkills.map((item) => ({
    skillId: item.skill.id,
    skill: item.skill.name,
    requiredLevel: item.requiredLevel,
    importance: item.importance,
  }));
  return { profileStrength: calculateCareerMatch(studentSkills, careerSkills).matchScore, targetRole: user.targetRole.name };
}
