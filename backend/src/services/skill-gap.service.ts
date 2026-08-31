import type { SkillMatchBreakdown } from './career-recommendation.service.js';

export type SkillStatus = 'Strong' | 'Needs Improvement' | 'Significant Gap' | 'Missing';
export type Priority = 'High' | 'Medium' | 'Low';

export type SkillGap = SkillMatchBreakdown & {
  status: SkillStatus;
  priorityScore: number;
  priority: Priority;
};

export type SkillGapSummary = {
  missingSkills: number;
  skillsToImprove: number;
  significantGaps: number;
  strongSkills: number;
};

function priorityFor(score: number): Priority {
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
}

export function calculateSkillGaps(skills: readonly SkillMatchBreakdown[]): SkillGap[] {
  return skills.map((skill) => {
    const ratio = skill.requiredLevel === 0 ? 1 : skill.studentLevel / skill.requiredLevel;
    const status: SkillStatus = skill.studentLevel === 0
      ? 'Missing'
      : skill.studentLevel >= skill.requiredLevel
        ? 'Strong'
        : ratio >= 0.7
          ? 'Needs Improvement'
          : 'Significant Gap';
    const priorityScore = Math.round((skill.gap * skill.importance) / 100);

    return { ...skill, status, priorityScore, priority: priorityFor(priorityScore) };
  });
}

export function summarizeSkillGaps(skills: readonly SkillGap[]): SkillGapSummary {
  return skills.reduce<SkillGapSummary>(
    (summary, skill) => {
      if (skill.status === 'Missing') summary.missingSkills += 1;
      if (skill.status === 'Needs Improvement' || skill.status === 'Significant Gap') summary.skillsToImprove += 1;
      if (skill.status === 'Significant Gap') summary.significantGaps += 1;
      if (skill.status === 'Strong') summary.strongSkills += 1;
      return summary;
    },
    { missingSkills: 0, skillsToImprove: 0, significantGaps: 0, strongSkills: 0 },
  );
}
