export type StudentSkill = {
  skillId: number;
  proficiency: number;
};

export type CareerRequirement = {
  skillId: number;
  skill: string;
  requiredLevel: number;
  importance: number;
};

export type SkillMatchBreakdown = CareerRequirement & {
  studentLevel: number;
  gap: number;
  matchPercentage: number;
};

export type CareerMatchResult = {
  matchScore: number;
  skills: SkillMatchBreakdown[];
};

function clampPercentage(value: number): number {
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
}

function roundScore(value: number): number {
  return Math.round(clampPercentage(value));
}

/**
 * Deterministically compares a student's proficiency to a career's required skills.
 * The result is intentionally independent of HTTP and database layers, making it
 * reusable and straightforward to test.
 */
export function calculateCareerMatch(
  studentSkills: readonly StudentSkill[],
  careerSkills: readonly CareerRequirement[],
): CareerMatchResult {
  const proficiencyBySkillId = new Map(
    studentSkills.map(({ skillId, proficiency }) => [skillId, clampPercentage(proficiency)]),
  );

  const skills = careerSkills.map((requirement) => {
    const studentLevel = proficiencyBySkillId.get(requirement.skillId) ?? 0;
    const requiredLevel = clampPercentage(requirement.requiredLevel);
    const importance = clampPercentage(requirement.importance);
    // A zero required level is already satisfied, avoiding division by zero.
    const matchRatio = requiredLevel === 0 ? 1 : Math.min(studentLevel / requiredLevel, 1);

    return {
      ...requirement,
      requiredLevel,
      importance,
      studentLevel,
      gap: roundScore(Math.max(requiredLevel - studentLevel, 0)),
      matchPercentage: roundScore(matchRatio * 100),
    };
  });

  const totalImportance = skills.reduce((total, skill) => total + skill.importance, 0);
  const weightedMatch = skills.reduce(
    (total, skill) => total + (skill.requiredLevel === 0 ? 1 : Math.min(skill.studentLevel / skill.requiredLevel, 1)) * skill.importance,
    0,
  );

  return {
    matchScore: totalImportance === 0 ? 0 : roundScore((weightedMatch / totalImportance) * 100),
    skills,
  };
}

export type RankedCareer = {
  careerId: number;
  career: string;
  category: string;
  matchScore: number;
};

export function rankCareers(
  studentSkills: readonly StudentSkill[],
  careers: ReadonlyArray<{
    id: number;
    name: string;
    category: string;
    careerSkills: readonly CareerRequirement[];
  }>,
): RankedCareer[] {
  return careers
    .map((career) => ({
      careerId: career.id,
      career: career.name,
      category: career.category,
      matchScore: calculateCareerMatch(studentSkills, career.careerSkills).matchScore,
    }))
    .sort((left, right) => right.matchScore - left.matchScore || left.career.localeCompare(right.career));
}
