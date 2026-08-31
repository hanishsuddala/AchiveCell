import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { getCareerRecommendations, getSelectedCareerAnalysis } from './career-analysis.service.js';
import { getProfileStrength } from './profile-strength.service.js';

export async function updateTargetRole(userId: number, targetRoleId: unknown) {
  if (!Number.isSafeInteger(targetRoleId) || (targetRoleId as number) < 1) {
    throw new AppError('targetRoleId must be a positive integer.', 400, 'INVALID_TARGET_ROLE');
  }
  const role = await prisma.careerRole.findUnique({ where: { id: targetRoleId as number }, select: { id: true, name: true, category: true } });
  if (!role) throw new AppError('Career role not found.', 404, 'NOT_FOUND');
  const user = await prisma.user.update({ where: { id: userId }, data: { targetRoleId: role.id }, select: { id: true, name: true, targetRole: { select: { id: true, name: true, category: true } } } });
  return user;
}

export async function getStudentSkills(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');
  const skills = await prisma.userSkill.findMany({
    where: { userId },
    select: {
      proficiency: true, source: true, updatedAt: true,
      skill: { select: { id: true, name: true, category: true } },
    },
    orderBy: [{ proficiency: 'desc' }, { skill: { name: 'asc' } }],
  });
  return skills.map((item) => ({ skillId: item.skill.id, skill: item.skill.name, category: item.skill.category, proficiency: item.proficiency, source: item.source, lastAssessed: item.source === 'assessment' ? item.updatedAt : null }));
}

export async function getDashboard(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, targetRole: { select: { id: true, name: true, category: true } }, _count: { select: { userSkills: true } } },
  });
  if (!user) throw new AppError('User not found.', 404, 'NOT_FOUND');
  const [profile, recommendations, skills] = await Promise.all([
    getProfileStrength(userId), getCareerRecommendations(userId, 4), getStudentSkills(userId),
  ]);
  const analysis = user.targetRole ? await getSelectedCareerAnalysis(userId, user.targetRole.id) : null;
  return { user: { id: user.id, name: user.name }, targetRole: user.targetRole, profileStrength: profile.profileStrength, skillsAssessed: user._count.userSkills, skills: skills.slice(0, 6), recommendations: recommendations.recommendations, skillGapSummary: analysis?.summary ?? null, targetAnalysis: analysis };
}
