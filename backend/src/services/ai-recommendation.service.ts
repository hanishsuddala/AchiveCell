import type { SkillGap } from './skill-gap.service.js';

export type ExplanationInput = {
  studentName: string;
  careerName: string;
  matchScore: number;
  skills: SkillGap[];
};

export type AiRecommendation = {
  provider: 'local-deterministic';
  overview: string;
  strengths: string[];
  prioritySkills: Array<{ skill: string; priority: string; reason: string }>;
  nextSteps: string[];
};

export interface AiRecommendationProvider {
  explain(input: ExplanationInput): Promise<AiRecommendation>;
}

/** Local fallback that only interprets deterministic Step 2 results; it never creates scores. */
export class LocalExplanationProvider implements AiRecommendationProvider {
  async explain(input: ExplanationInput): Promise<AiRecommendation> {
    const strengths = input.skills.filter((skill) => skill.status === 'Strong').map((skill) => skill.skill).slice(0, 3);
    const gaps = input.skills
      .filter((skill) => skill.status !== 'Strong')
      .sort((left, right) => right.priorityScore - left.priorityScore || left.skill.localeCompare(right.skill))
      .slice(0, 3);
    return {
      provider: 'local-deterministic',
      overview: `${input.studentName}, your ${input.careerName} match is ${input.matchScore}%. ${strengths.length ? `Your strongest relevant skills are ${strengths.join(', ')}.` : 'Complete an assessment to identify your strongest relevant skills.'}`,
      strengths,
      prioritySkills: gaps.map((skill) => ({ skill: skill.skill, priority: skill.priority, reason: `${skill.status}: current level ${skill.studentLevel}, target level ${skill.requiredLevel}.` })),
      nextSteps: gaps.length
        ? [`Focus first on ${gaps[0].skill} with guided practice.`, 'Retake the relevant skill assessment after studying.', `Build one small project that uses ${gaps.map((skill) => skill.skill).join(', ')}.`]
        : ['Maintain your strengths with a practical project.', 'Explore an advanced portfolio project for this role.'],
    };
  }
}

export const aiRecommendationProvider = new LocalExplanationProvider();
